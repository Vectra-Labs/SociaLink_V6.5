import { PrismaClient } from '@prisma/client';
import { config } from "dotenv";

config(); // Load env vars

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5001/api';
const timestamp = Date.now();

// Use Seeded Accounts
const EST_EMAIL = 'etab.pro@test.ma';
const WORKER_EMAIL = 'worker.premium@test.ma';
const PASSWORD = 'test123';

async function run() {
    console.log("🚀 Starting Match Flow Verification (with DB Fix)...");

    try {
        // 0. Fix DB State (Ensure users are verified)
        console.log("0. Force-validating test accounts in DB...");

        // Find Users
        const users = await prisma.user.findMany({
            where: { email: { in: [EST_EMAIL, WORKER_EMAIL] } },
            select: { user_id: true, email: true, role: true }
        });

        const estUser = users.find(u => u.role === 'ESTABLISHMENT');
        const workerUser = users.find(u => u.role === 'WORKER');

        if (!estUser || !workerUser) {
            throw new Error("Could not find test users in DB. Did you seed?");
        }

        // Update User (Email verified)
        await prisma.user.updateMany({
            where: { user_id: { in: users.map(u => u.user_id) } },
            data: { isEmailVerified: true, status: 'VALIDATED' }
        });

        // Update Establishment Profile
        await prisma.establishmentProfile.update({
            where: { user_id: estUser.user_id },
            data: { verification_status: 'VERIFIED' } // Schema enum
        });

        // Update Worker Profile
        await prisma.workerProfile.update({
            where: { user_id: workerUser.user_id },
            data: { verification_status: 'VERIFIED' } // Schema enum
        });

        console.log("   ✅ Accounts & Profiles Validated");


        // 1. Login Establishment
        console.log(`\n1. Logging in Establishment (${EST_EMAIL})...`);
        const estCookie = await login(EST_EMAIL, PASSWORD);
        console.log("   ✅ Establishment Logged In");

        // 2. Fetch Cities
        console.log("2. Fetching Cities...");
        const cityId = await getCityId(estCookie);
        console.log(`   ✅ Using City ID: ${cityId}`);

        // 3. Create Mission
        console.log("3. Creating Mission...");
        const mission = await createMission(estCookie, cityId);
        console.log(`   ✅ Mission Created: ${mission.title} (ID: ${mission.mission_id})`);

        // 4. Login Worker
        console.log(`\n4. Logging in Worker (${WORKER_EMAIL})...`);
        const workerCookie = await login(WORKER_EMAIL, PASSWORD);
        console.log("   ✅ Worker Logged In");

        // 5. Apply to Mission
        console.log("5. Applying to Mission...");
        try {
            await applyToMission(workerCookie, mission.mission_id);
            console.log("   ✅ Application Sent");
        } catch (e) {
            if (e.message.includes("already applied")) {
                console.log("   ⚠️ Worker already applied (skipping step)");
            } else {
                throw e;
            }
        }

        // 6. Establishment Views Applications
        console.log("\n6. Establishment Viewing Applications...");
        const applications = await getReceivedApplications(estCookie);

        const myApp = applications.find(a => a.mission_id === mission.mission_id);

        if (!myApp) {
            console.log("Debug: All Applications:", JSON.stringify(applications.map(a => ({ id: a.application_id, mission: a.mission_id })), null, 2));
            throw new Error("Application not found in establishment list!");
        }
        console.log(`   ✅ Application Found (ID: ${myApp.application_id})`);

        // 7. Accept Application
        console.log("7. Accepting Application...");
        await acceptApplication(estCookie, myApp.application_id);
        console.log("   ✅ Application Accepted");

        console.log("\n🎉 MATCH FLOW VERIFIED SUCCESSFULLY!");

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Helpers
async function login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Login failed: ${text}`);

    const cookie = res.headers.get('set-cookie');
    if (!cookie) throw new Error("No cookie received on login");
    return cookie;
}

async function getCityId(cookie) {
    try {
        const res = await fetch(`${BASE_URL}/general/cities`, {
            headers: { 'Cookie': cookie }
        });
        if (res.ok) {
            const data = await res.json();
            if (data.data?.length > 0) {
                if (data.data[0].city_id) return data.data[0].city_id;
                if (data.data[0].cities?.[0]?.city_id) return data.data[0].cities[0].city_id;
            }
        }
    } catch (e) {
        console.log("Warning: Could not fetch cities, defaulting to 1");
    }
    return 1;
}

async function createMission(cookie, cityId) {
    const res = await fetch(`${BASE_URL}/missions/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            title: `Mission Verify ${timestamp}`,
            description: "Automated verification mission description.",
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 86400000).toISOString(), // +1 day
            is_urgent: false,
            hourly_rate: 15,
            city_id: cityId
        })
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Create Mission failed: ${text}`);
    const data = JSON.parse(text);
    return data.data;
}

async function applyToMission(cookie, missionId) {
    const res = await fetch(`${BASE_URL}/applications/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({
            mission_id: missionId,
            motivation: "I am ready to work!"
        })
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Apply failed: ${text}`);
    return JSON.parse(text);
}

async function getReceivedApplications(cookie) {
    const res = await fetch(`${BASE_URL}/applications/received`, {
        method: 'GET',
        headers: { 'Cookie': cookie }
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Get Applications failed: ${text}`);
    const data = JSON.parse(text);
    return data.data;
}

async function acceptApplication(cookie, applicationId) {
    const res = await fetch(`${BASE_URL}/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookie
        },
        body: JSON.stringify({ status: "ACCEPTED" })
    });

    const text = await res.text();
    if (!res.ok) throw new Error(`Accept failed: ${text}`);
    return JSON.parse(text);
}

run();
