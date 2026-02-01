import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Mission Seeding...');

    // 1. Fetch or Create Cities
    const cities = await prisma.city.findMany();
    if (cities.length === 0) {
        console.error('❌ No cities found. Run base seed first.');
        return;
    }

    // 2. Create Establishments
    const establishmentsData = [
        { name: "Association Al Baraka", email: "albaraka@test.com", city: cities[0].city_id },
        { name: "Fondation Orient-Occident", email: "orient@test.com", city: cities[1]?.city_id || cities[0].city_id },
        { name: "Croissant Rouge Marocain", email: "crm@test.com", city: cities[2]?.city_id || cities[0].city_id },
        { name: "Association Solidarité Féminine", email: "asf@test.com", city: cities[0].city_id },
        { name: "SOS Villages d'Enfants", email: "sos@test.com", city: cities[3]?.city_id || cities[0].city_id },
    ];

    const establishmentIds = [];
    const hashedPassword = await bcrypt.hash('password123', 10);

    for (const est of establishmentsData) {
        const email = `est_${Date.now()}_${Math.floor(Math.random() * 1000)}@seed.com`; // Ensure unique

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "ESTABLISHMENT",
                status: "VALIDATED"
            }
        });

        await prisma.establishmentProfile.create({
            data: {
                user_id: user.user_id,
                name: est.name,
                contact_first_name: "Ahmed",
                contact_last_name: "Responsable",
                ice_number: `ICE${Date.now()}${Math.floor(Math.random() * 100)}`,
                city_id: est.city,
                verification_status: "VERIFIED"
            }
        });

        establishmentIds.push(user.user_id);
        console.log(`✅ Created Establishment: ${est.name}`);
    }

    // 3. Generate Missions
    const missionTitles = [
        "Assistant Social pour Centre d'Accueil",
        "Éducateur Spécialisé - Enfants en difficulté",
        "Psychologue pour soutien scolaire",
        "Animateur d'ateliers créatifs",
        "Coordinateur de projet humanitaire",
        "Aide à domicile pour personnes âgées",
        "Médiateur familial",
        "Accompagnateur pour insertion professionnelle",
        "Distributeur de repas - Action Ramadan",
        "Infirmier bénévole pour caravane médicale"
    ];

    const missions = [];

    for (let i = 0; i < 50; i++) {
        const isUrgent = Math.random() > 0.8; // 20% urgent
        const isOld = Math.random() > 0.5; // 50% older than 48h

        // Date logic
        const today = new Date();
        const createdAt = new Date(today);
        if (isOld) {
            createdAt.setDate(today.getDate() - (Math.floor(Math.random() * 10) + 3)); // 3-13 days ago
        } else {
            createdAt.setHours(today.getHours() - (Math.floor(Math.random() * 40))); // 0-40 hours ago
        }

        const startDate = new Date(createdAt);
        startDate.setDate(startDate.getDate() + 10); // Starts in 10 days

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30); // Lasts 30 days

        missions.push({
            establishment_id: establishmentIds[Math.floor(Math.random() * establishmentIds.length)],
            city_id: cities[Math.floor(Math.random() * cities.length)].city_id,
            title: missionTitles[Math.floor(Math.random() * missionTitles.length)],
            description: `Nous recherchons un professionnel passionné pour rejoindre notre équipe. \n\n**Missions:**\n- Accompagnement des bénéficiaires\n- Suivi des dossiers\n- Reporting hebdomadaire\n\n**Profil:**\n- Diplôme en action sociale\n- Expérience souhaitée`,
            budget: Math.floor(Math.random() * 5000) + 2000,
            start_date: startDate,
            end_date: endDate,
            status: "OPEN",
            is_urgent: isUrgent,
            created_at: createdAt
        });
    }

    await prisma.mission.createMany({ data: missions });
    console.log(`✅ Created ${missions.length} Missions`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
