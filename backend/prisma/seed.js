import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const bcrypt = await import('bcryptjs');
  const defaultPassword = await bcrypt.hash('test123', 10);

  console.log('🧹 Cleaning existing data...');
  // Clean in order respecting foreign keys
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.application.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.workerDocument.deleteMany();
  await prisma.profileView.deleteMany();
  await prisma.diploma.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.workerSpeciality.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.adminMessage.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.establishmentProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Database cleaned!');

  // ==========================================
  // REGIONS & CITIES
  // ==========================================
  console.log('\n🗺️ Seeding regions and cities...');

  const regions = [
    { name: 'Casablanca-Settat', cities: ['Casablanca', 'Mohammedia', 'El Jadida', 'Settat', 'Berrechid'] },
    { name: 'Rabat-Salé-Kénitra', cities: ['Rabat', 'Salé', 'Kénitra', 'Témara'] },
    { name: 'Marrakech-Safi', cities: ['Marrakech', 'Safi', 'Essaouira'] },
    { name: 'Fès-Meknès', cities: ['Fès', 'Meknès'] },
    { name: 'Tanger-Tétouan-Al Hoceïma', cities: ['Tanger', 'Tétouan', 'Al Hoceïma'] },
    { name: 'Souss-Massa', cities: ['Agadir', 'Taroudant', 'Tiznit'] },
  ];

  const cityMap = {};
  for (const regionData of regions) {
    const region = await prisma.region.upsert({
      where: { name: regionData.name },
      update: {},
      create: { name: regionData.name }
    });

    for (const cityName of regionData.cities) {
      const city = await prisma.city.upsert({
        where: { city_id: 0 },
        update: {},
        create: { name: cityName, region_id: region.region_id }
      }).catch(async () => {
        const existing = await prisma.city.findFirst({ where: { name: cityName, region_id: region.region_id } });
        if (!existing) {
          return await prisma.city.create({ data: { name: cityName, region_id: region.region_id } });
        }
        return existing;
      });
      if (city) cityMap[cityName] = city.city_id;
    }
  }

  // Refresh city map
  const allCities = await prisma.city.findMany();
  allCities.forEach(c => { cityMap[c.name] = c.city_id; });
  console.log('✅ Regions and cities seeded!');

  // ==========================================
  // STRUCTURES
  // ==========================================
  console.log('\n🏗️ Seeding structures...');
  const structures = ['EHPAD', 'Crèche', 'Centre social', 'Clinique', 'Hôpital', 'Association', 'Maison de jeunes', 'Foyer'];

  const structureMap = {};
  for (const label of structures) {
    const s = await prisma.structure.upsert({
      where: { label },
      update: {},
      create: { label, is_active: true }
    });
    structureMap[label] = s.id;
  }
  console.log('✅ Structures seeded!');

  // ==========================================
  // SPECIALITIES
  // ==========================================
  console.log('\n🎯 Seeding specialities...');

  const specialities = [
    'Soins infirmiers', 'Soins palliatifs', 'Soins gériatriques', 'Soins à domicile', 'Médication',
    'Accompagnement social', 'Accompagnement scolaire', 'Aide aux démarches administratives',
    'Assistance aux personnes âgées', 'Aide à la mobilité',
    'Garde d\'enfants', 'Éveil et pédagogie', 'Activités maternelles', 'Animation périscolaire',
    'Accompagnement handicap', 'Autonomie PMR', 'Langue des signes', 'Braille',
    'Gériatrie', 'EHPAD', 'Maintien à domicile seniors', 'Animation personnes âgées',
    'Psychologie clinique', 'Psychiatrie', 'Santé mentale', 'Écoute et soutien psychologique',
    'Éducation spécialisée', 'Travail social', 'Médiation familiale', 'Insertion professionnelle',
    'Premiers secours', 'Cuisine et nutrition', 'Entretien du domicile', 'Transport de personnes'
  ];

  const specMap = {};
  for (const name of specialities) {
    const spec = await prisma.speciality.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    specMap[name] = spec.speciality_id;
  }
  console.log(`✅ ${specialities.length} specialities seeded!`);

  // ==========================================
  // SUBSCRIPTION PLANS
  // ==========================================
  console.log('\n💳 Seeding subscription plans...');

  // Delete existing plans first (handles composite unique constraint)
  await prisma.subscriptionPlanConfig.deleteMany();

  const basicPlan = await prisma.subscriptionPlanConfig.create({
    data: {
      code: 'BASIC', name: 'Gratuit', description: 'Accès limité à la plateforme',

      target_role: 'WORKER', price_monthly: 0, trial_days: 0,
      max_active_applications: 3, can_view_urgent_missions: false,
      can_view_full_profiles: false, has_auto_matching: false,
      mission_view_delay_hours: 48, max_visible_missions: 5, is_active: true
    }
  });

  const premiumPlan = await prisma.subscriptionPlanConfig.create({
    data: {
      code: 'PREMIUM', name: 'Premium', description: 'Accès complet pour travailleurs sociaux',
      target_role: 'WORKER', price_monthly: 14900, price_yearly: 149900, trial_days: 7,
      max_active_applications: 999, can_view_urgent_missions: true,
      can_view_full_profiles: true, has_auto_matching: true,
      mission_view_delay_hours: 0, max_visible_missions: null, is_active: true
    }
  });

  const proPlan = await prisma.subscriptionPlanConfig.create({
    data: {
      code: 'PRO', name: 'Pro', description: 'Accès complet pour établissements',
      target_role: 'ESTABLISHMENT', price_monthly: 49900, price_yearly: 499900, trial_days: 14,
      max_active_missions: null, can_post_urgent: true, can_search_workers: true,
      can_view_full_profiles: true, urgent_mission_fee_percent: 0, is_active: true
    }
  });
  console.log('✅ Subscription plans seeded!');

  // ==========================================
  // ADMIN ACCOUNTS
  // ==========================================
  console.log('\n👑 Creating admin accounts...');

  /* REMOVED SUPER_ADMIN creation - Merged into ADMIN role */
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@socialink.ma',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN', status: 'VALIDATED', isEmailVerified: true,
      // Permissions are now implicit for ADMIN, but keeping explicit list doesn't hurt or can be removed if schema changed
      admin_permissions: JSON.stringify(['ALL_ACCESS']) 
    }
  });
  console.log('  ✓ admin@socialink.ma / admin123 (Full Admin Access)');

  const hafidAdmin = await prisma.user.create({
    data: {
      email: 'hafid.admin@socialink.ma',
      password: await bcrypt.hash('hafid123', 10),
      role: 'ADMIN', status: 'VALIDATED', isEmailVerified: true,
      admin_permissions: JSON.stringify(['ALL_ACCESS']),
      adminProfile: {
        create: {
            first_name: 'Hafid', last_name: 'Belkorchi', 
            department: 'Direction', profile_pic_url: null
        }
      }
    }
  });
  console.log('  ✓ hafid.admin@socialink.ma / hafid123 (Admin Persistant)');

  // ==========================================
  // PERSISTENT WORKER: HAFID BELKORCHI
  // ==========================================
  const hafidWorker = await prisma.user.create({
    data: {
        email: 'hafid.belkorchi@gmail.com',
        password: await bcrypt.hash('hafid123', 10),
        role: 'WORKER', status: 'VALIDATED', isEmailVerified: true,
        workerProfile: {
            create: {
                first_name: 'Hafid', last_name: 'Belkorchi',
                phone: '+212600000000', city_id: 1, // Casablanca assumed ID 1
                title: 'Infirmier Testeur', experience_years: 10,
                bio: 'Compte de test officiel pour validation et démonstration. Profil complet et vérifié.',
                verification_status: 'VERIFIED',
                skills: ["Test", "Développement", "Gestion"],
                address: '123 Avenue Mohamed V, Casablanca',
                profile_pic_url: null
            }
        }
    }
  });
  
  // Fake Documents for Hafid Worker
  await prisma.workerDocument.createMany({
    data: [
        { worker_id: hafidWorker.user_id, type: 'CV', name: 'CV_Final.pdf', file_url: '/assets/documents/sample.pdf', status: 'VERIFIED', verified_at: new Date() },
        { worker_id: hafidWorker.user_id, type: 'DIPLOMA', name: 'Diplome_Etat.pdf', file_url: '/assets/documents/sample.pdf', status: 'VERIFIED', verified_at: new Date() },
        { worker_id: hafidWorker.user_id, type: 'CIN', name: 'CIN_RectoVerso.jpg', file_url: '/assets/documents/sample.jpg', status: 'VERIFIED', verified_at: new Date() }
    ]
  });
  console.log('  ✓ hafid.belkorchi@gmail.com / hafid123 (Worker Persistant + Docs)');

  // ==========================================
  // REALISTIC WORKERS (8 profiles)
  // ==========================================
  console.log('\n👤 Creating REALISTIC WORKER accounts...');

  const workersData = [
    {
      email: 'fatima.benali@gmail.com', first_name: 'Fatima', last_name: 'Benali',
      phone: '+212661234567', city: 'Casablanca', status: 'VALIDATED', subscription: 'PREMIUM',
      title: 'Aide-soignante spécialisée gériatrie', experience_years: 8,
      bio: 'Aide-soignante diplômée avec 8 ans d\'expérience en EHPAD et soins à domicile. Passionnée par l\'accompagnement des personnes âgées, je mets mon expertise au service du bien-être et de la dignité de chaque patient. Certifiée en soins palliatifs.',
      specialities: ['Soins gériatriques', 'EHPAD', 'Soins palliatifs', 'Assistance aux personnes âgées'],
      skills: ["Permis B", "Gériatrie", "Soins techniques"],
      profile_pic: '/assets/Photo profile/Profile photo_1.jpg'
    },
    {
      email: 'karim.idrissi@gmail.com', first_name: 'Karim', last_name: 'Idrissi',
      phone: '+212662345678', city: 'Rabat', status: 'VALIDATED', subscription: 'BASIC',
      title: 'Éducateur spécialisé', experience_years: 5,
      bio: 'Éducateur spécialisé diplômé d\'État, je travaille depuis 5 ans avec des personnes en situation de handicap. Formé à la communication non-violente et aux techniques d\'accompagnement individualisé.',
      specialities: ['Éducation spécialisée', 'Accompagnement handicap', 'Autonomie PMR'],
      skills: ["Langue des signes", "Permis B"],
      profile_pic: '/assets/Photo profile/Profile photo_2.jpg'
    },
    {
      email: 'salma.amrani@gmail.com', first_name: 'Salma', last_name: 'Amrani',
      phone: '+212663456789', city: 'Marrakech', status: 'VALIDATED', subscription: 'PREMIUM',
      title: 'Éducatrice de jeunes enfants', experience_years: 6,
      bio: 'Éducatrice de jeunes enfants avec spécialisation Montessori. J\'accompagne les enfants de 0 à 6 ans dans leur développement psychomoteur et leur éveil. Expérience en crèche et à domicile.',
      specialities: ['Garde d\'enfants', 'Éveil et pédagogie', 'Activités maternelles'],
      skills: ["Toilette", "Alimentation", "Ecoute active"],
      profile_pic: '/assets/Photo profile/Profile photo_3.jpg'
    },
    {
      email: 'youssef.tazi@gmail.com', first_name: 'Youssef', last_name: 'Tazi',
      phone: '+212664567890', city: 'Fès', status: 'VALIDATED', subscription: 'BASIC',
      title: 'Psychologue clinicien', experience_years: 4,
      bio: 'Psychologue clinicien spécialisé en thérapie cognitive et comportementale. Expérience en milieu hospitalier et associatif. Accompagnement des personnes en souffrance psychique.',
      specialities: ['Psychologie clinique', 'Santé mentale', 'Écoute et soutien psychologique'],
      profile_pic: '/assets/Photo profile/Profile photo_4.jpg'
    },
    {
      email: 'amina.chraibi@gmail.com', first_name: 'Amina', last_name: 'Chraibi',
      phone: '+212665678901', city: 'Tanger', status: 'PENDING', subscription: null,
      title: 'Infirmière diplômée', experience_years: 3,
      bio: 'Infirmière diplômée d\'État, je cherche à mettre mes compétences au service des soins à domicile. Formation en soins infirmiers généraux et gériatriques.',
      specialities: ['Soins infirmiers', 'Soins à domicile', 'Médication'],
      profile_pic: '/assets/Photo profile/Profile photo_5.jpg'
    },
    {
      email: 'hassan.berrada@gmail.com', first_name: 'Hassan', last_name: 'Berrada',
      phone: '+212666789012', city: 'Agadir', status: 'VALIDATED', subscription: 'PREMIUM',
      title: 'Conseiller en insertion professionnelle', experience_years: 7,
      bio: 'Conseiller en insertion professionnelle avec 7 ans d\'expérience. Accompagnement des demandeurs d\'emploi, animation d\'ateliers collectifs, mise en relation avec les entreprises locales.',
      specialities: ['Insertion professionnelle', 'Accompagnement social', 'Travail social'],
      profile_pic: '/assets/Photo profile/Profile photo_6.jpg'
    },
    {
      email: 'nadia.ouazzani@gmail.com', first_name: 'Nadia', last_name: 'Ouazzani',
      phone: '+212667890123', city: 'Casablanca', status: 'REJECTED', subscription: null,
      title: 'Médiatrice familiale', experience_years: 2,
      bio: 'En cours de certification comme médiatrice familiale. Expérience en accompagnement de couples et familles en difficulté.',
      specialities: ['Médiation familiale', 'Écoute et soutien psychologique'],
      profile_pic: '/assets/Photo profile/Profile photo_7.webp'
    },
    {
      email: 'omar.fassi@gmail.com', first_name: 'Omar', last_name: 'Fassi',
      phone: '+212668901234', city: 'Rabat', status: 'VALIDATED', subscription: 'BASIC',
      title: 'Animateur socio-culturel', experience_years: 4,
      bio: 'Animateur passionné avec expérience en maisons de jeunes et centres sociaux. Organisation d\'événements culturels, ateliers créatifs et activités sportives pour tous âges.',
      specialities: ['Animation périscolaire', 'Animation personnes âgées', 'Accompagnement scolaire'],
      profile_pic: '/assets/Photo profile/Profile photo_8.webp'
    }
  ];

  const createdWorkers = [];
  for (const w of workersData) {
    const user = await prisma.user.create({
      data: {
        email: w.email,
        password: defaultPassword,
        role: 'WORKER',
        status: w.status,
        isEmailVerified: w.status === 'VALIDATED',
        workerProfile: {
          create: {
            first_name: w.first_name,
            last_name: w.last_name,
            phone: w.phone,
            title: w.title,
            experience_years: w.experience_years,
            bio: w.bio,
            city_id: cityMap[w.city],
            profile_pic_url: w.profile_pic,
            verification_status: w.status === 'VALIDATED' ? 'VERIFIED' : 'PENDING',
            skills: w.skills || [], // Add demo skills
            address: `${Math.floor(Math.random() * 200) + 1}, Rue ${['Mohammed V', 'Hassan II', 'Ibn Batouta', 'Al Massira'][Math.floor(Math.random() * 4)]}, ${w.city}`
          }
        }
      }
    });

    // Add specialities
    for (const specName of w.specialities) {
      if (specMap[specName]) {
        await prisma.workerSpeciality.create({
          data: { user_id: user.user_id, speciality_id: specMap[specName] }
        });
      }
    }

    // Add subscription
    if (w.subscription === 'PREMIUM') {
      await prisma.subscription.create({
        data: {
          user_id: user.user_id,
          plan_id: premiumPlan.plan_id,
          status: 'ACTIVE',
          start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }
      });
    }

    createdWorkers.push({ ...w, user_id: user.user_id });
    console.log(`  ✓ ${w.email} (${w.status}${w.subscription ? ' + ' + w.subscription : ''})`);
  }

  // ==========================================
  // REALISTIC ESTABLISHMENTS (6 profiles)
  // ==========================================
  console.log('\n🏢 Creating REALISTIC ESTABLISHMENT accounts...');

  const establishmentsData = [
    {
      email: 'contact@ehpad-atlas.ma', name: 'EHPAD Résidence Atlas',
      contact_first_name: 'Rachida', contact_last_name: 'Bennani', contact_function: 'Directrice',
      ice_number: '001234567890123', phone: '+212522334455', city: 'Casablanca',
      structure: 'EHPAD', status: 'VALIDATED', subscription: 'PRO',
      description: 'EHPAD de 80 lits offrant un cadre de vie chaleureux et sécurisé pour les personnes âgées dépendantes. Équipe pluridisciplinaire, soins médicaux 24h/24.',
      website: 'https://ehpad-atlas.ma', founding_year: 2010, employee_count: '50-100'
    },
    {
      email: 'rh@creche-soleil.ma', name: 'Crèche Les Petits Soleils',
      contact_first_name: 'Samira', contact_last_name: 'Alaoui', contact_function: 'Responsable RH',
      ice_number: '001234567890124', phone: '+212537445566', city: 'Rabat',
      structure: 'Crèche', status: 'VALIDATED', subscription: 'PRO',
      description: 'Crèche associative accueillant 45 enfants de 3 mois à 4 ans. Pédagogie active, éveil musical, jardin pédagogique. Personnel qualifié et bienveillant.',
      website: 'https://creche-soleil.ma', founding_year: 2015, employee_count: '10-25'
    },
    {
      email: 'direction@centre-amal.ma', name: 'Centre Social Al Amal',
      contact_first_name: 'Mustapha', contact_last_name: 'Tahiri', contact_function: 'Directeur',
      ice_number: '001234567890125', phone: '+212524556677', city: 'Marrakech',
      structure: 'Centre social', status: 'VALIDATED', subscription: 'BASIC',
      description: 'Centre social polyvalent au service des familles du quartier. Actions d\'insertion, soutien scolaire, aide alimentaire, accompagnement administratif.',
      website: null, founding_year: 2008, employee_count: '10-25'
    },
    {
      email: 'accueil@clinique-nord.ma', name: 'Clinique du Nord',
      contact_first_name: 'Nabil', contact_last_name: 'Cherkaoui', contact_function: 'DRH',
      ice_number: '001234567890126', phone: '+212539667788', city: 'Tanger',
      structure: 'Clinique', status: 'VALIDATED', subscription: 'PRO',
      description: 'Clinique privée multidisciplinaire avec services de médecine, chirurgie et soins de suite. 120 lits, équipements modernes, équipe médicale expérimentée.',
      website: 'https://clinique-nord.ma', founding_year: 2005, employee_count: '100-250'
    },
    {
      email: 'contact@fondation-espoir.ma', name: 'Fondation Espoir',
      contact_first_name: 'Ahmed', contact_last_name: 'Belhaj', contact_function: 'Président',
      ice_number: '001234567890127', phone: '+212535778899', city: 'Fès',
      structure: 'Association', status: 'PENDING', subscription: null,
      description: 'Association caritative œuvrant pour l\'insertion des personnes en situation de précarité. Programmes de formation, aide au logement, accompagnement social.',
      website: null, founding_year: 2018, employee_count: '5-10'
    },
    {
      email: 'rh@maison-jeunes-agadir.ma', name: 'Maison des Jeunes Agadir',
      contact_first_name: 'Latifa', contact_last_name: 'Moussaoui', contact_function: 'Responsable',
      ice_number: '001234567890128', phone: '+212528889900', city: 'Agadir',
      structure: 'Maison de jeunes', status: 'VALIDATED', subscription: 'BASIC',
      description: 'Structure publique dédiée aux jeunes de 14 à 30 ans. Activités culturelles, sportives, formation professionnelle, accompagnement à l\'emploi.',
      website: 'https://mj-agadir.gov.ma', founding_year: 1995, employee_count: '10-25'
    }
  ];

  const createdEstabs = [];
  for (const e of establishmentsData) {
    const user = await prisma.user.create({
      data: {
        email: e.email,
        password: defaultPassword,
        role: 'ESTABLISHMENT',
        status: e.status,
        isEmailVerified: e.status === 'VALIDATED',
        establishmentProfile: {
          create: {
            name: e.name,
            contact_first_name: e.contact_first_name,
            contact_last_name: e.contact_last_name,
            contact_function: e.contact_function,
            ice_number: e.ice_number,
            phone: e.phone,
            city_id: cityMap[e.city],
            structure_id: structureMap[e.structure],
            description: e.description,
            website: e.website,
            founding_year: e.founding_year,
            employee_count: e.employee_count,
            verification_status: e.status === 'VALIDATED' ? 'VERIFIED' : 'PENDING',
            address: `Zone industrielle, ${e.city}`
          }
        }
      }
    });

    if (e.subscription === 'PRO') {
      await prisma.subscription.create({
        data: {
          user_id: user.user_id,
          plan_id: proPlan.plan_id,
          status: 'ACTIVE',
          start_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        }
      });
    }

    createdEstabs.push({ ...e, user_id: user.user_id });
    console.log(`  ✓ ${e.email} - ${e.name} (${e.status}${e.subscription ? ' + ' + e.subscription : ''})`);
  }

  // ==========================================
  // REALISTIC MISSIONS (15 missions)
  // ==========================================
  console.log('\n📋 Creating REALISTIC MISSIONS...');

  const missionsData = [
    { estab: 0, title: 'Aide-soignant(e) de nuit - 3x12h', desc: 'Poste d\'aide-soignant(e) en équipe de nuit au sein de notre EHPAD. Vous assurez l\'accompagnement des résidents, les soins d\'hygiène et de confort, la distribution des repas et la surveillance nocturne. Rotation sur 3 nuits consécutives.', city: 'Casablanca', budget: 9500, contract: 'CDI', urgent: false, status: 'OPEN', daysAgo: 5, skills: ["Soins techniques", "Gériatrie", "Permis B"] },
    { estab: 0, title: 'Infirmier(e) coordinateur(trice)', desc: 'En tant qu\'IDEC, vous coordonnez l\'équipe soignante, gérez les plannings, assurez le lien avec les familles et les médecins traitants. Poste clé dans notre organisation.', city: 'Casablanca', budget: 14000, contract: 'CDI', urgent: false, status: 'OPEN', daysAgo: 3, skills: ["Management", "Gériatrie"] },
    { estab: 1, title: 'Éducatrice de jeunes enfants', desc: 'Nous recherchons une EJE passionnée pour rejoindre notre équipe. Vous encadrez un groupe de 8 enfants (2-3 ans), proposez des activités d\'éveil adaptées et participez aux réunions pédagogiques.', city: 'Rabat', budget: 8000, contract: 'CDI', urgent: false, status: 'OPEN', daysAgo: 7, skills: ["Ecoute active", "Eveil"] },
    { estab: 1, title: 'Auxiliaire de puériculture - Remplacement', desc: 'Remplacement congé maternité de 4 mois. Vous assurez les soins quotidiens aux bébés (0-1 an), préparez les biberons, accompagnez les siestes et participez aux transmissions.', city: 'Rabat', budget: 6500, contract: 'CDD', urgent: true, status: 'OPEN', daysAgo: 1, skills: ["Soins nourrisson", "Hygiène"] },
    { estab: 2, title: 'Travailleur(euse) social(e) polyvalent(e)', desc: 'Au sein de notre centre social, vous accueillez et orientez les usagers, réalisez des évaluations sociales, montez des dossiers d\'aide et travaillez en réseau avec les partenaires locaux.', city: 'Marrakech', budget: 7500, contract: 'CDD', urgent: false, status: 'IN_PROGRESS', daysAgo: 20 },
    { estab: 2, title: 'Animateur(trice) soutien scolaire', desc: 'Animation d\'ateliers d\'aide aux devoirs pour enfants du CP au CM2, 4 soirs par semaine de 16h30 à 18h30. Bienveillance et patience requises.', city: 'Marrakech', budget: 3500, contract: 'CDD', urgent: false, status: 'OPEN', daysAgo: 4 },
    { estab: 3, title: 'Infirmier(e) de bloc opératoire - URGENT', desc: 'Poste en bloc opératoire polyvalent. Vous assistez les chirurgiens, préparez le matériel, assurez l\'instrumentation et participez à la prise en charge du patient en pré et post-opératoire.', city: 'Tanger', budget: 15000, contract: 'CDI', urgent: true, status: 'OPEN', daysAgo: 2 },
    { estab: 3, title: 'Aide-soignant(e) service médecine', desc: 'Intégrez notre équipe du service médecine (30 lits). Soins d\'hygiène, aide aux repas, mobilisation des patients, transmissions ciblées. Travail en binôme IDE/AS.', city: 'Tanger', budget: 8500, contract: 'CDI', urgent: false, status: 'OPEN', daysAgo: 6 },
    { estab: 3, title: 'Psychologue clinicien(ne)', desc: 'Accompagnement psychologique des patients hospitalisés et de leurs familles. Évaluations cliniques, entretiens de soutien, participation aux staffs pluridisciplinaires.', city: 'Tanger', budget: 12000, contract: 'CDD', urgent: false, status: 'OPEN', daysAgo: 8 },
    { estab: 5, title: 'Animateur(trice) socio-culturel', desc: 'Animation d\'activités pour les jeunes : ateliers créatifs, sorties culturelles, tournois sportifs, projets citoyens. Dynamisme et créativité essentiels.', city: 'Agadir', budget: 6500, contract: 'CDD', urgent: false, status: 'OPEN', daysAgo: 10 },
    { estab: 5, title: 'Conseiller(ère) insertion professionnelle', desc: 'Accompagnement individuel des jeunes demandeurs d\'emploi. Bilan de compétences, ateliers CV et entretien, mise en relation avec les entreprises partenaires.', city: 'Agadir', budget: 8000, contract: 'CDI', urgent: false, status: 'COMPLETED', daysAgo: 45 },
    { estab: 0, title: 'Ergothérapeute', desc: 'Évaluation des capacités fonctionnelles des résidents, mise en place d\'aides techniques, animation d\'ateliers de stimulation cognitive et motrice.', city: 'Casablanca', budget: 11000, contract: 'CDI', urgent: false, status: 'OPEN', daysAgo: 12 },
    { estab: 1, title: 'Agent d\'entretien - Mi-temps', desc: 'Entretien des locaux de la crèche selon protocoles stricts d\'hygiène. Désinfection quotidienne, gestion des stocks produits. Poste matinal 6h-10h.', city: 'Rabat', budget: 3000, contract: 'CDI', urgent: false, status: 'OPEN', daysAgo: 15 },
    { estab: 2, title: 'Bénévole distribution alimentaire', desc: 'Participation à notre action hebdomadaire de distribution alimentaire aux familles précaires. Chaque samedi matin de 9h à 13h. Formation assurée.', city: 'Marrakech', budget: 0, contract: 'BENEVOLAT', urgent: false, status: 'OPEN', daysAgo: 9 },
    { estab: 3, title: 'Kinésithérapeute - Vacation', desc: 'Vacations en rééducation fonctionnelle post-opératoire. 3 demi-journées par semaine selon vos disponibilités. Patientèle variée.', city: 'Tanger', budget: 5000, contract: 'FREELANCE', urgent: false, status: 'OPEN', daysAgo: 11 }
  ];

  const createdMissions = [];
  for (const m of missionsData) {
    const mission = await prisma.mission.create({
      data: {
        establishment_id: createdEstabs[m.estab].user_id,
        title: m.title,
        description: m.desc,
        city_id: cityMap[m.city],
        budget: m.budget,
        contract_type: m.contract,
        is_urgent: m.urgent,
        status: m.status,
        skills: m.skills || [], // Add demo skills
        start_date: new Date(),
        end_date: new Date(Date.now() + (m.status === 'COMPLETED' ? -10 : 60) * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - m.daysAgo * 24 * 60 * 60 * 1000),
        published_at: new Date(Date.now() - m.daysAgo * 24 * 60 * 60 * 1000)
      }
    });
    createdMissions.push(mission);
  }
  console.log(`  ✓ ${missionsData.length} missions créées`);

  // ==========================================
  // APPLICATIONS
  // ==========================================
  console.log('\n📨 Creating APPLICATIONS...');

  const validatedWorkers = createdWorkers.filter(w => w.status === 'VALIDATED');
  const applications = [
    { worker: 0, mission: 0, status: 'ACCEPTED' },
    { worker: 0, mission: 1, status: 'PENDING' },
    { worker: 1, mission: 2, status: 'PENDING' },
    { worker: 2, mission: 2, status: 'ACCEPTED' },
    { worker: 2, mission: 3, status: 'PENDING' },
    { worker: 3, mission: 8, status: 'PENDING' },
    { worker: 4, mission: 10, status: 'ACCEPTED' },
    { worker: 5, mission: 9, status: 'PENDING' },
    { worker: 5, mission: 5, status: 'ACCEPTED' },
    { worker: 0, mission: 11, status: 'PENDING' }
  ];

  const createdApps = [];
  for (const a of applications) {
    const worker = validatedWorkers[a.worker];
    if (worker && createdMissions[a.mission]) {
      const app = await prisma.application.create({
        data: {
          worker_profile_id: worker.user_id,
          mission_id: createdMissions[a.mission].mission_id,
          status: a.status,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
        }
      });
      createdApps.push(app);
    }
  }
  console.log(`  ✓ ${createdApps.length} candidatures créées`);

  // ==========================================
  // REVIEWS
  // ==========================================
  console.log('\n⭐ Creating REVIEWS...');

  const reviews = [
    { author: createdEstabs[0].user_id, target: validatedWorkers[0].user_id, mission: 0, rating: 5, comment: 'Fatima est une aide-soignante exceptionnelle. Professionnelle, douce avec les résidents, toujours ponctuelle. Je la recommande vivement.' },
    { author: validatedWorkers[0].user_id, target: createdEstabs[0].user_id, mission: 0, rating: 5, comment: 'Très bonne structure, équipe bienveillante et conditions de travail agréables. Direction à l\'écoute.' },
    { author: createdEstabs[1].user_id, target: validatedWorkers[2].user_id, mission: 2, rating: 4, comment: 'Salma s\'est très bien intégrée à l\'équipe. Les enfants l\'adorent. Quelques progrès à faire sur la documentation.' },
    { author: createdEstabs[5].user_id, target: validatedWorkers[4].user_id, mission: 10, rating: 5, comment: 'Hassan a mené à bien toutes les insertions professionnelles. Excellent travail de réseau et de suivi personnalisé.' },
    { author: validatedWorkers[4].user_id, target: createdEstabs[5].user_id, mission: 10, rating: 4, comment: 'Mission enrichissante avec des moyens limités mais une équipe motivée. Belle expérience humaine.' },
    { author: createdEstabs[2].user_id, target: validatedWorkers[5].user_id, mission: 5, rating: 5, comment: 'Omar a su créer une vraie dynamique avec les enfants. Ateliers créatifs très appréciés. À refaire !' }
  ];

  for (const r of reviews) {
    await prisma.review.create({
      data: {
        author_id: r.author,
        target_id: r.target,
        mission_id: createdMissions[r.mission].mission_id,
        rating: r.rating,
        comment: r.comment
      }
    });
  }
  console.log(`  ✓ ${reviews.length} avis créés`);

  // ==========================================
  // NOTIFICATIONS (Admin tracking)
  // ==========================================
  console.log('\n🔔 Creating NOTIFICATIONS...');

  const notifications = [
    // Admin notifications - new pending users
    { user: admin.user_id, message: 'Nouvelle inscription: Amina Chraibi (Travailleur) en attente de validation', type: 'INFO', link: '/admin/validations' },
    { user: admin.user_id, message: 'Nouvelle inscription: Fondation Espoir (Établissement) en attente de validation', type: 'INFO', link: '/admin/validations' },
    { user: admin.user_id, message: 'Nouvel abonnement PREMIUM activé: Fatima Benali', type: 'SUCCESS', link: '/admin/finance' },
    { user: admin.user_id, message: 'Nouvel abonnement PRO activé: EHPAD Résidence Atlas', type: 'SUCCESS', link: '/admin/finance' },
    { user: admin.user_id, message: '3 nouveaux abonnements ce mois - Revenus: 113 700 DH', type: 'INFO', link: '/admin/dashboard' },
    // Worker notifications
    { user: validatedWorkers[0].user_id, message: 'Votre candidature pour "Aide-soignant(e) de nuit" a été acceptée !', type: 'SUCCESS', link: '/worker/applications' },
    { user: validatedWorkers[0].user_id, message: 'Vous avez reçu un avis 5 étoiles de EHPAD Résidence Atlas', type: 'SUCCESS', link: '/worker/reviews' },
    { user: validatedWorkers[2].user_id, message: 'Nouvelle mission correspondant à votre profil: "Éducatrice de jeunes enfants"', type: 'INFO', link: '/worker/missions' },
    { user: validatedWorkers[5].user_id, message: 'Mission terminée ! N\'oubliez pas de laisser un avis.', type: 'INFO', link: '/worker/reviews' },
    // Establishment notifications
    { user: createdEstabs[0].user_id, message: 'Nouvelle candidature de Fatima Benali pour votre mission', type: 'INFO', link: '/establishment/applications' },
    { user: createdEstabs[1].user_id, message: 'Votre mission urgente a été publiée avec succès', type: 'SUCCESS', link: '/establishment/missions' },
    { user: createdEstabs[3].user_id, message: 'Rappel: 2 candidatures en attente de réponse', type: 'WARNING', link: '/establishment/applications' }
  ];

  for (const n of notifications) {
    await prisma.notification.create({
      data: {
        user_id: n.user,
        message: n.message,
        type: n.type,
        link: n.link,
        is_read: Math.random() > 0.7,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
      }
    });
  }
  console.log(`  ✓ ${notifications.length} notifications créées (dont ${notifications.filter(n => n.user === admin.user_id).length} pour admins)`);

  // ==========================================
  // CONVERSATIONS & MESSAGES
  // ==========================================
  console.log('\n💬 Creating CONVERSATIONS & MESSAGES...');

  const conversations = [
    {
      worker: validatedWorkers[0].user_id,
      estab: createdEstabs[0].user_id,
      messages: [
        { sender: createdEstabs[0].user_id, content: 'Bonjour Fatima, nous avons bien reçu votre candidature pour le poste d\'aide-soignante de nuit. Seriez-vous disponible pour un entretien la semaine prochaine ?' },
        { sender: validatedWorkers[0].user_id, content: 'Bonjour, merci pour votre retour ! Oui, je suis disponible mardi ou jeudi après-midi.' },
        { sender: createdEstabs[0].user_id, content: 'Parfait, disons mardi à 14h30 à la résidence. Munissez-vous de vos diplômes originaux.' },
        { sender: validatedWorkers[0].user_id, content: 'C\'est noté, à mardi !' }
      ]
    },
    {
      worker: validatedWorkers[2].user_id,
      estab: createdEstabs[1].user_id,
      messages: [
        { sender: createdEstabs[1].user_id, content: 'Bonjour Salma, votre profil nous intéresse beaucoup. Avez-vous une expérience avec la pédagogie Montessori ?' },
        { sender: validatedWorkers[2].user_id, content: 'Bonjour, oui j\'ai suivi une formation certifiante Montessori 3-6 ans en 2022. Je peux vous envoyer mon attestation.' },
        { sender: createdEstabs[1].user_id, content: 'Excellent ! Pouvez-vous nous envoyer vos disponibilités pour une journée d\'immersion ?' }
      ]
    }
  ];

  for (const conv of conversations) {
    const conversation = await prisma.conversation.create({
      data: {
        worker_id: conv.worker,
        establishment_id: conv.estab
      }
    });

    for (let i = 0; i < conv.messages.length; i++) {
      await prisma.message.create({
        data: {
          conversation_id: conversation.conversation_id,
          sender_id: conv.messages[i].sender,
          content: conv.messages[i].content,
          created_at: new Date(Date.now() - (conv.messages.length - i) * 3600 * 1000)
        }
      });
    }
  }
  console.log(`  ✓ ${conversations.length} conversations créées`);

  // ==========================================
  // WORKER DOCUMENTS
  // ==========================================
  console.log('\n📄 Creating WORKER DOCUMENTS...');

  const documents = [
    { worker: validatedWorkers[0].user_id, type: 'DIPLOMA', name: 'Diplôme d\'Aide-Soignant', institution: 'ISPITS Casablanca', status: 'VERIFIED' },
    { worker: validatedWorkers[0].user_id, type: 'CIN', name: 'Carte d\'Identité Nationale', institution: null, status: 'VERIFIED' },
    { worker: validatedWorkers[1].user_id, type: 'DIPLOMA', name: 'DEES - Éducateur Spécialisé', institution: 'INAS Rabat', status: 'VERIFIED' },
    { worker: validatedWorkers[2].user_id, type: 'DIPLOMA', name: 'Diplôme EJE', institution: 'ENSP Marrakech', status: 'VERIFIED' },
    { worker: validatedWorkers[2].user_id, type: 'CERTIFICATE', name: 'Certification Montessori 3-6 ans', institution: 'AMI France', status: 'PENDING' },
    { worker: validatedWorkers[3].user_id, type: 'DIPLOMA', name: 'Master Psychologie Clinique', institution: 'Université Sidi Mohamed Ben Abdellah - Fès', status: 'VERIFIED' },
    { worker: validatedWorkers[5].user_id, type: 'DIPLOMA', name: 'Licence Travail Social', institution: 'Université Ibn Zohr - Agadir', status: 'VERIFIED' }
  ];

  for (const doc of documents) {
    await prisma.workerDocument.create({
      data: {
        worker_id: doc.worker,
        type: doc.type,
        name: doc.name,
        institution: doc.institution,
        file_url: '/uploads/documents/placeholder-document.pdf',
        status: doc.status,
        issue_date: new Date(2020, Math.floor(Math.random() * 12), 1),
        verified_at: doc.status === 'VERIFIED' ? new Date() : null,
        verified_by: doc.status === 'VERIFIED' ? admin.user_id : null
      }
    });
  }
  console.log(`  ✓ ${documents.length} documents créés`);

  // ==========================================
  // ADMIN LOGS
  // ==========================================
  console.log('\n📝 Creating ADMIN LOGS...');

  const adminLogs = [
    { admin: admin.user_id, action: 'VALIDATE_USER', target_type: 'USER', details: { user_email: 'fatima.benali@gmail.com', action: 'Profile validated' } },
    { admin: admin.user_id, action: 'VALIDATE_USER', target_type: 'USER', details: { user_email: 'karim.idrissi@gmail.com', action: 'Profile validated' } },
    { admin: admin.user_id, action: 'VALIDATE_DOCUMENT', target_type: 'DOCUMENT', details: { document: 'Diplôme Aide-Soignant', worker: 'Fatima Benali' } },
    { admin: admin.user_id, action: 'REJECT_USER', target_type: 'USER', details: { user_email: 'nadia.ouazzani@gmail.com', reason: 'Documents insuffisants' } },
    { admin: admin.user_id, action: 'CREATE_PLAN', target_type: 'SUBSCRIPTION', details: { plan: 'PREMIUM', price: 14900 } },
    { admin: admin.user_id, action: 'VIEW_FINANCE', target_type: 'SYSTEM', details: { action: 'Accessed finance dashboard' } }
  ];

  for (const log of adminLogs) {
    await prisma.adminLog.create({
      data: {
        admin_id: log.admin,
        action: log.action,
        target_type: log.target_type,
        details: log.details,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
      }
    });
  }
  console.log(`  ✓ ${adminLogs.length} logs admin créés`);

  // ==========================================
  // CALENDAR EVENTS
  // ==========================================
  console.log('\n📅 Creating CALENDAR EVENTS...');

  for (const worker of validatedWorkers.slice(0, 4)) {
    // Add 3-5 availability events per worker
    for (let i = 0; i < Math.floor(Math.random() * 3) + 3; i++) {
      const startDate = new Date(Date.now() + (i * 7 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000);
      await prisma.calendarEvent.create({
        data: {
          worker_id: worker.user_id,
          title: 'Disponible',
          type: 'AVAILABLE',
          start_date: startDate,
          end_date: new Date(startDate.getTime() + 8 * 60 * 60 * 1000),
          is_all_day: false
        }
      });
    }
  }
  console.log('  ✓ Calendar events créés');

  // ==========================================
  // FINAL SUMMARY
  // ==========================================
  console.log('\n' + '═'.repeat(70));
  console.log('✅ SEED COMPLETED SUCCESSFULLY!');
  console.log('═'.repeat(70));
  console.log('\n📋 RÉCAPITULATIF DES COMPTES (MDP: test123 sauf admins):');
  console.log('─'.repeat(70));
  console.log('\n👑 ADMINS:');
  console.log('  admin@socialink.ma / admin123            → ADMIN (Full Access)');
  console.log('\n👤 TRAVAILLEURS:');
  workersData.forEach(w => {
    console.log(`  ${w.email.padEnd(35)} → ${w.status}${w.subscription ? ' + ' + w.subscription : ''}`);
  });
  console.log('\n🏢 ÉTABLISSEMENTS:');
  establishmentsData.forEach(e => {
    console.log(`  ${e.email.padEnd(35)} → ${e.status}${e.subscription ? ' + ' + e.subscription : ''}`);
  });
  console.log('\n📊 STATISTIQUES:');
  console.log(`  • ${workersData.length} travailleurs (${workersData.filter(w => w.status === 'VALIDATED').length} validés)`);
  console.log(`  • ${establishmentsData.length} établissements (${establishmentsData.filter(e => e.status === 'VALIDATED').length} validés)`);
  console.log(`  • ${missionsData.length} missions`);
  console.log(`  • ${createdApps.length} candidatures`);
  console.log(`  • ${reviews.length} avis`);
  console.log(`  • ${notifications.length} notifications`);
  console.log(`  • ${conversations.length} conversations`);
  console.log('═'.repeat(70));
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
