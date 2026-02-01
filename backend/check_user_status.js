
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'worker.premium@test.ma';
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                subscription: {
                    include: {
                        plan: true
                    }
                }
            }
        });

        if (user) {
            console.log(`Role: ${user.role}`);
            console.log(`Status: ${user.status}`);
            if (user.subscription) {
                console.log(`Plan: ${user.subscription.plan.name}`);
                console.log(`Subscription Status: ${user.subscription.status}`);
            } else {
                console.log('No subscription');
            }
        } else {
            console.log('User not found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
