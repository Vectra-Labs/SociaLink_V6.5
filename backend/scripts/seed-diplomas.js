import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDiplomas() {
    // Get first worker profile to add diplomas to
    const worker = await prisma.workerProfile.findFirst({
        include: { user: true }
    });

    if (!worker) {
        console.log('❌ No worker found. Please create a worker account first.');
        return;
    }

    console.log(`📚 Adding diplomas to worker: ${worker.first_name} ${worker.last_name} (user_id: ${worker.user_id})`);

    // Sample diplomas
    const diplomas = [
        {
            user_id: worker.user_id,
            name: 'Licence en Travail Social',
            institution: 'Université Mohammed V - Rabat',
            issue_date: new Date('2018-06-15'),
            description: 'Formation complète en intervention sociale et accompagnement des personnes en difficulté.',
            verification_status: 'VALIDATED',
            file_path: '/uploads/diplomas/licence_travail_social.pdf'
        },
        {
            user_id: worker.user_id,
            name: 'Master en Insertion Professionnelle',
            institution: 'ENCG Casablanca',
            issue_date: new Date('2020-07-20'),
            description: 'Spécialisation en accompagnement vers l\'emploi et formation professionnelle.',
            verification_status: 'VALIDATED',
            file_path: '/uploads/diplomas/master_insertion.pdf'
        },
        {
            user_id: worker.user_id,
            name: 'Certificat de Formation en Médiation Familiale',
            institution: 'Institut National de l\'Action Sociale',
            issue_date: new Date('2021-03-10'),
            description: 'Formation certifiante en médiation et résolution de conflits familiaux.',
            verification_status: 'PENDING',
            file_path: '/uploads/diplomas/certificat_mediation.pdf'
        },
        {
            user_id: worker.user_id,
            name: 'Attestation Premiers Secours (PSC1)',
            institution: 'Croix-Rouge Marocaine',
            issue_date: new Date('2022-11-05'),
            description: 'Formation aux gestes de premiers secours.',
            verification_status: 'VALIDATED',
            file_path: '/uploads/diplomas/psc1.pdf'
        }
    ];

    // Delete existing diplomas for this worker
    await prisma.diploma.deleteMany({
        where: { user_id: worker.user_id }
    });

    // Create new diplomas
    for (const diploma of diplomas) {
        await prisma.diploma.create({ data: diploma });
        console.log(`  ✅ Added: ${diploma.name}`);
    }

    console.log(`\n🎉 Successfully added ${diplomas.length} diplomas!`);
}

seedDiplomas()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
