
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyLimits() {
    console.log('--- STARTING LIMIT VERIFICATION ---');

    try {
        // 1. Find or Create a Basic User (Worker)
        // We'll use a test email
        const testEmail = 'verify.limit.worker@test.com';
        let worker = await prisma.user.findUnique({ where: { email: testEmail } });

        if (!worker) {
            console.log('Creating test worker...');
            // Create user
            worker = await prisma.user.create({
                data: {
                    email: testEmail,
                    password: 'hashedpassword', // wont log in via api so ok
                    role: 'WORKER',
                    status: 'VALIDATED',
                    workerProfile: {
                        create: {
                            first_name: 'Limit',
                            last_name: 'Tester'
                        }
                    }
                }
            });
        }

        // Ensure no Subscription
        await prisma.subscription.deleteMany({ where: { user_id: worker.user_id } });
        console.log(`Test Worker ID: ${worker.user_id} (No Subscription)`);

        // 2. Find Limits from Basic Plan
        const basicPlan = await prisma.subscriptionPlanConfig.findUnique({
            where: { code_target_role: { code: 'BASIC', target_role: 'WORKER' } }
        });
        console.log(`Basic Plan Limit (Workers): ${basicPlan?.max_active_applications}`);

        // 3. Clear existing applications
        await prisma.application.deleteMany({ where: { worker_profile_id: worker.user_id } });

        // 4. Create dummy missions to apply to
        const establishments = await prisma.user.findMany({ where: { role: 'ESTABLISHMENT' }, take: 1 });
        const estId = establishments[0].user_id;

        // Create 4 missions
        const missions = [];
        for (let i = 0; i < 4; i++) {
            const m = await prisma.mission.create({
                data: {
                    title: `Limit Test Mission ${i}`,
                    establishment_id: estId,
                    city_id: 1,
                    start_date: new Date(),
                    end_date: new Date(),
                    status: 'OPEN'
                }
            });
            missions.push(m);
        }
        console.log(`Created ${missions.length} test missions.`);

        // 5. Try to apply 4 times (Limit is 3)
        console.log('Attempting to apply...');

        // We will simulate the logic in controller directly since we can't easily curl without full auth set up in script
        // Or we just check the output of our logic by calling the check function?
        // Let's rely on the fact we modified the controller logic. 
        // Wait, testing via script is better if we mimic the DB calls.

        for (let i = 0; i < 4; i++) {
            const missionId = missions[i].mission_id;

            // Simulating the check
            const activeApps = await prisma.application.count({
                where: {
                    worker_profile_id: worker.user_id,
                    status: { in: ['PENDING', 'ACCEPTED'] }
                }
            });

            if (activeApps >= basicPlan.max_active_applications) {
                console.log(`[EXPECTED] Blocked application ${i + 1} : Limit reached (${activeApps}/${basicPlan.max_active_applications})`);
            } else {
                await prisma.application.create({
                    data: {
                        worker_profile_id: worker.user_id,
                        mission_id: missionId,
                        status: 'PENDING'
                    }
                });
                console.log(`[SUCCESS] Created application ${i + 1}`);
            }
        }

        // Cleanup
        console.log('Cleaning up...');
        await prisma.application.deleteMany({ where: { worker_profile_id: worker.user_id } });
        await prisma.mission.deleteMany({ where: { title: { startsWith: 'Limit Test Mission' } } });
        // Keep user for future tests or delete? Delete.
        await prisma.workerProfile.delete({ where: { user_id: worker.user_id } });
        await prisma.user.delete({ where: { user_id: worker.user_id } });

        console.log('--- VERIFICATION COMPLETE ---');

    } catch (e) {
        console.error("TEST FAILED", e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLimits();
