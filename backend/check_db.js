import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Checking Notification table...");
        const count = await prisma.notification.count();
        console.log("Notification table exists. Count:", count);

        // Try to create a dummy notification to verify writes
        const user = await prisma.user.findFirst();
        if (user) {
            await prisma.notification.create({
                data: {
                    user_id: user.user_id,
                    type: 'INFO',
                    message: 'Installation check',
                    is_read: true
                }
            });
            console.log("Write test successful.");
        }
    } catch (e) {
        console.error("Error accessing Notification table:", e.message);
        if (e.code === 'P2021') {
            console.log("Table does not exist in current DB.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

check();
