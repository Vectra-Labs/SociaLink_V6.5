import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:5001/api';

async function verifyOtpFlow() {
    console.log('--- STARTING OTP VERIFICATION TEST ---');
    try {
        const email = `test_otp_${Date.now()}@test.com`;
        const password = 'password123';

        // 1. REGISTER
        console.log(`\n🔵 1. Registering worker with email: ${email}`);
        const regRes = await fetch(`${API_URL}/auth/register/worker`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                first_name: 'Test',
                last_name: 'OTP',
                phone: '0600000000'
            })
        });

        const regData = await regRes.json();
        console.log(`   Status: ${regRes.status}`);
        // console.log(`   Response:`, JSON.stringify(regData, null, 2));

        if (!regData.requiresVerification) {
            console.error('❌ Failed: Expected requiresVerification to be true');
            console.error('Full Response:', regData);
            return;
        }

        // 2. FETCH OTP
        console.log('\n🔵 2. Fetching OTP from Database...');
        // Wait a bit for DB write
        await new Promise(r => setTimeout(r, 1000));

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.verificationCode) {
            console.error('❌ Failed: User not found or no verification code in DB');
            return;
        }

        const code = user.verificationCode;
        console.log(`   ✅ OTP Found in DB: ${code}`);

        // 3. VERIFY
        console.log('\n🔵 3. Verifying Email...');
        const verifyRes = await fetch(`${API_URL}/auth/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });

        const text = await verifyRes.text();
        console.log(`   Status: ${verifyRes.status}`);
        console.log(`   Raw Response:`, text);
        const verifyData = JSON.parse(text);
        console.log(`   Response:`, verifyData);

        if (verifyRes.status !== 200) {
            console.error('❌ Failed: Verification endpoint returned error');
            return;
        }

        // 4. LOGIN
        console.log('\n🔵 4. Attempting Login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginRes.json();
        console.log(`   Status: ${loginRes.status}`);

        if (loginData.token) {
            console.log('   ✅ Login Successful! Token received.');
            console.log('\n🎉 TEST PASSED: Full OTP Flow Verified.');
        } else {
            console.error('❌ Failed: Login failed after verification');
            console.error('Login Response:', loginData);
        }

        // Cleanup
        if (user) {
            await prisma.workerProfile.deleteMany({ where: { user_id: user.user_id } });
            await prisma.user.delete({ where: { user_id: user.user_id } });
            console.log('\nCleanup done.');
        }

    } catch (error) {
        console.error("\n❌ SCRIPT CRASHED:", error);
    }
}

verifyOtpFlow();
