import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Find missions with ACCEPTED applications
    const missionWithAcceptedApp = await prisma.mission.findFirst({
        where: {
            applications: { some: { status: 'ACCEPTED' } }
        },
        include: {
            applications: {
                where: { status: 'ACCEPTED' },
                include: { worker: true }
            },
            establishment: true
        }
    });

    if (missionWithAcceptedApp) {
        console.log('Found mission with accepted application:', missionWithAcceptedApp.title);
        console.log('Worker:', missionWithAcceptedApp.applications[0]?.worker?.first_name);

        // Mark mission as COMPLETED
        const updated = await prisma.mission.update({
            where: { mission_id: missionWithAcceptedApp.mission_id },
            data: { status: 'COMPLETED' }
        });
        console.log('Marked mission as COMPLETED:', updated.mission_id, updated.title);
    } else {
        console.log('No accepted applications found, checking all missions...');

        // Find any mission with an application
        const anyMission = await prisma.mission.findFirst({
            where: {
                applications: { some: {} }
            },
            include: {
                applications: { include: { worker: true } },
                establishment: true
            }
        });

        if (anyMission) {
            // Accept the first application and complete the mission
            const app = anyMission.applications[0];
            await prisma.application.update({
                where: { application_id: app.application_id },
                data: { status: 'ACCEPTED' }
            });
            await prisma.mission.update({
                where: { mission_id: anyMission.mission_id },
                data: { status: 'COMPLETED' }
            });
            console.log('Accepted application and completed mission:', anyMission.title);
        }
    }

    // Show completed missions
    const completed = await prisma.mission.findMany({
        where: { status: 'COMPLETED' },
        include: {
            applications: { include: { worker: true } },
            establishment: true
        }
    });
    console.log('\nCompleted missions:', completed.length);
    completed.forEach(m => {
        console.log(`- ${m.title} (ID: ${m.mission_id})`);
        console.log(`  Establishment: ${m.establishment?.name}`);
        m.applications.forEach(a => {
            console.log(`  Worker: ${a.worker?.first_name} ${a.worker?.last_name} (status: ${a.status})`);
        });
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
