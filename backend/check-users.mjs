import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            user_id: true,
            email: true,
            role: true,
            status: true
        }
    });
    console.log('📋 Users in database:');
    users.forEach(u => {
        console.log(`  ID: ${u.user_id} | Email: "${u.email}" | Role: ${u.role} | Status: ${u.status}`);
    });
    console.log(`\nTotal: ${users.length} users`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
