import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixAdminVerification() {
    try {
        // Update superadmin
        const superadmin = await prisma.user.updateMany({
            where: { email: 'superadmin@socialink.ma' },
            data: { isEmailVerified: true }
        });
        console.log('Super Admin updated:', superadmin.count);

        // Update admin
        const admin = await prisma.user.updateMany({
            where: { email: 'admin@socialink.ma' },
            data: { isEmailVerified: true }
        });
        console.log('Admin updated:', admin.count);

        console.log('✅ Done! Both accounts are now verified.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminVerification();
