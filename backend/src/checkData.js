import { prisma } from './config/db.js';

async function checkData() {
    console.log('\n=== Database Check ===\n');

    // Count all workers by verification status
    const workerCounts = await Promise.all([
        prisma.workerProfile.count(),
        prisma.workerProfile.count({ where: { verification_status: 'PENDING' } }),
        prisma.workerProfile.count({ where: { verification_status: 'VERIFIED' } }),
        prisma.workerProfile.count({ where: { verification_status: 'REJECTED' } }),
    ]);

    console.log('WorkerProfile counts:');
    console.log(`  Total: ${workerCounts[0]}`);
    console.log(`  PENDING: ${workerCounts[1]}`);
    console.log(`  VERIFIED: ${workerCounts[2]}`);
    console.log(`  REJECTED: ${workerCounts[3]}`);

    // Count all establishments by verification status
    const estCounts = await Promise.all([
        prisma.establishmentProfile.count(),
        prisma.establishmentProfile.count({ where: { verification_status: 'PENDING' } }),
        prisma.establishmentProfile.count({ where: { verification_status: 'VERIFIED' } }),
        prisma.establishmentProfile.count({ where: { verification_status: 'REJECTED' } }),
    ]);

    console.log('\nEstablishmentProfile counts:');
    console.log(`  Total: ${estCounts[0]}`);
    console.log(`  PENDING: ${estCounts[1]}`);
    console.log(`  VERIFIED: ${estCounts[2]}`);
    console.log(`  REJECTED: ${estCounts[3]}`);

    // Show some sample workers
    const sampleWorkers = await prisma.workerProfile.findMany({
        take: 5,
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            verification_status: true,
            user: { select: { email: true, status: true } }
        }
    });

    console.log('\nSample workers:');
    sampleWorkers.forEach(w => {
        console.log(`  - ${w.first_name} ${w.last_name} (${w.user?.email}): verification=${w.verification_status}, user.status=${w.user?.status}`);
    });

    await prisma.$disconnect();
}

checkData().catch(console.error);
