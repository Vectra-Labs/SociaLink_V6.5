import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Checking worker.premium@test.ma...');
    const email = 'worker.premium@test.ma';

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            subscription: {
                include: { plan: true }
            },
            workerProfile: true
        }
    });

    if (!user) {
        console.log('❌ User not found!');
        return;
    }

    console.log(`✅ User Found: ID ${user.user_id}, Role: ${user.role}, Status: ${user.status}`);

    if (user.subscription) {
        console.log('✅ Subscription Found:');
        console.log(`- Status: ${user.subscription.status}`);
        console.log(`- Plan: ${user.subscription.plan.name} (${user.subscription.plan.code})`);
        console.log(`- End Date: ${user.subscription.end_date}`);
    } else {
        console.log('❌ NO SUBSCRIPTION LINKED (User is effectively GRATUIT)');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
