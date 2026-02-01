import { prisma } from "../config/db.js";
import { createNotification } from "../services/notificationService.js";

//----------------------------- Get Profile -----------------------------//
export const getEstablishmentProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const profile = await prisma.establishmentProfile.findUnique({
            where: { user_id: userId },
            include: { city: true }
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: profile,
        });
    } catch (error) {
        console.error("GET ESTABLISHMENT PROFILE ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
};

//----------------------------- Update Profile -----------------------------//
export const updateEstablishmentProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const {
            name, contact_first_name, contact_last_name, phone, address, website,
            description, founding_year, employee_count, city_id
        } = req.body;

        const updateData = {
            name,
            contact_first_name,
            contact_last_name,
            phone,
            address,
            website,
            description,
            employee_count
        };

        // Only update founding_year if it's a valid number
        if (founding_year && !isNaN(parseInt(founding_year))) {
            updateData.founding_year = parseInt(founding_year);
        }

        // Only update city_id if provided
        if (city_id && !isNaN(parseInt(city_id))) {
            updateData.city_id = parseInt(city_id);
        }

        // Handle file uploads
        if (req.files) {
            if (req.files.logo && req.files.logo[0]) {
                updateData.logo_url = `/uploads/${req.files.logo[0].filename}`;
            }
            if (req.files.banner && req.files.banner[0]) {
                updateData.banner_url = `/uploads/${req.files.banner[0].filename}`;
            }
        }

        const updatedProfile = await prisma.establishmentProfile.update({
            where: { user_id: userId },
            data: updateData,
            include: { city: true }
        });

        res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: updatedProfile,
        });
    } catch (error) {
        console.error("UPDATE ESTABLISHMENT PROFILE ERROR:", error);
        res.status(500).json({
            message: "Failed to update profile",
        });
    }
};

//----------------------------- Get Public Profile (For Workers) -----------------------------//
// Supports lookup by slug OR id
export const getPublicEstablishmentProfile = async (req, res) => {
    try {
        const identifier = req.params.identifier;

        // Determine if identifier is a slug or ID
        const isNumeric = /^\d+$/.test(identifier);


        const whereClause = isNumeric
            ? { user_id: parseInt(identifier) }
            : { slug: identifier };

        const profile = await prisma.establishmentProfile.findFirst({
            where: whereClause,
            select: {
                user_id: true,
                name: true,
                slug: true,
                service: true,
                logo_url: true,
                city: { select: { name: true } },
                verification_status: true,
                // HIDE contact info: phone, contact_first_name, etc.
                missions: {
                    where: { status: "OPEN" },
                    take: 5,
                    orderBy: { created_at: 'desc' },
                    select: {
                        mission_id: true,
                        title: true,
                        start_date: true,
                        is_urgent: true
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({ message: "Établissement non trouvé" });
        }

        res.status(200).json({ status: "success", data: profile });
    } catch (error) {
        console.error("GET PUBLIC ESTABLISHMENT PROFILE ERROR:", error);
        res.status(500).json({ message: "Échec de récupération du profil" });
    }
};

//----------------------------- Helper: Generate Slug -----------------------------//
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars
        .replace(/\s+/g, '-')             // Replace spaces with -
        .replace(/-+/g, '-')              // Replace multiple - with single -
        .trim();
};

//----------------------------- Update Slug for Existing Establishments -----------------------------//
export const updateEstablishmentSlugs = async (req, res) => {
    try {
        const establishments = await prisma.establishmentProfile.findMany({
            where: { slug: null },
            select: { user_id: true, name: true }
        });

        for (const est of establishments) {
            const baseSlug = generateSlug(est.name);
            let slug = baseSlug;
            let counter = 1;

            // Ensure unique slug
            while (await prisma.establishmentProfile.findFirst({ where: { slug } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            await prisma.establishmentProfile.update({
                where: { user_id: est.user_id },
                data: { slug }
            });
        }

        res.status(200).json({
            status: "success",
            message: `${establishments.length} slugs mis à jour`
        });
    } catch (error) {
        console.error("UPDATE SLUGS ERROR:", error);
        res.status(500).json({ message: "Échec de mise à jour des slugs" });
    }
};

//----------------------------- Get Dashboard Stats -----------------------------//
export const getEstablishmentStats = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // 1. Active Missions (OPEN or IN_PROGRESS)
        const activeMissions = await prisma.mission.count({
            where: {
                establishment_id: userId,
                status: {
                    in: ["OPEN", "IN_PROGRESS"]
                }
            }
        });

        // 2. Pending Applications (for my missions)
        const pendingApplications = await prisma.application.count({
            where: {
                mission: {
                    establishment_id: userId
                },
                status: "PENDING"
            }
        });

        // 2b. Urgent Pending Applications (from my urgent missions)
        const urgentApplications = await prisma.application.count({
            where: {
                mission: {
                    establishment_id: userId,
                    is_urgent: true
                },
                status: "PENDING"
            }
        });

        // 3. Suggestions Count
        const establishment = await prisma.establishmentProfile.findUnique({
            where: { user_id: userId },
            select: { city_id: true }
        });

        let suggestions = 0;
        if (establishment?.city_id) {
            suggestions = await prisma.workerProfile.count({
                where: {
                    city_id: establishment.city_id,
                    verification_status: "VERIFIED"
                }
            });
        }

        // 4. Fetch Recent Applications List (Top 5)
        const recentApplicationsList = await prisma.application.findMany({
            where: {
                mission: {
                    establishment_id: userId
                }
            },
            take: 5,
            orderBy: { created_at: 'desc' },
            include: {
                worker: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        title: true,
                        experience_years: true,
                        profile_pic_url: true
                    }
                },
                mission: {
                    select: {
                        title: true
                    }
                }
            }
        });

        // Format applications for frontend
        const formattedApplications = recentApplicationsList.map(app => ({
            id: app.application_id,
            name: `${app.worker.first_name || ''} ${app.worker.last_name || ''}`.trim() || 'Candidat',
            experience: app.worker.experience_years ? `${app.worker.experience_years} ans d'exp.` : 'Non spécifié',
            position: app.mission.title, // Or worker title? Frontend shows "Poste visé" which usually implies the mission title or worker's profession. Let's use mission title for context.
            // Actually frontend col is "Poste visé", row value says "Éducateur Spécialisé" (worker function). 
            // Let's us Worker Title as it might be more relevant to "who applied". 
            // But wait, "Poste visé" technically means the job they applied FOR. 
            // Let's map it: position: app.mission.title. 
            // Match score: Mock for now as we don't have algorithm yet.
            matchScore: Math.floor(Math.random() * (99 - 70) + 70),
            avatar: app.worker.profile_pic_url,
            status: app.status
        }));

        // 5. Fetch Suggested Profiles List (Top 5 in same city)
        let formattedSuggestions = [];
        if (establishment?.city_id) {
            const suggestedWorkers = await prisma.workerProfile.findMany({
                where: {
                    city_id: establishment.city_id,
                    verification_status: "VERIFIED"
                },
                take: 5,
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    title: true
                }
            });

            formattedSuggestions = suggestedWorkers.map(worker => ({
                id: worker.user_id,
                name: `${worker.first_name || ''} ${worker.last_name || ''}`.trim(),
                title: worker.title || 'Professionnel',
                rating: (4.5 + Math.random() * 0.5).toFixed(1), // Mock rating until implemented
                status: 'Dispo' // Mock availability logic
            }));
        }

        res.status(200).json({
            status: "success",
            data: {
                activeMissions,
                pendingApplications,
                urgentApplications,
                suggestions,
                recentApplications: formattedApplications,
                suggestedProfiles: formattedSuggestions
            }
        });

    } catch (error) {
        console.error("GET ESTABLISHMENT STATS ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch stats"
        });
    }
};

//----------------------------- Search Workers (For Establishments) -----------------------------//
export const searchWorkers = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const {
            speciality_ids, // Array of speciality IDs
            min_experience, // Minimum years of experience
            region_id,      // Region ID
            city_id,        // City ID
            available_now,  // Boolean - has availability events today/this week
            search,         // Text search in name/title
            page = 1,
            limit = 10
        } = req.query;

        // Check establishment's subscription
        const establishment = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                subscription: {
                    include: { plan: true }
                },
                establishmentProfile: { select: { city_id: true } }
            }
        });

        const isPro = establishment?.subscription?.plan?.code === 'PRO';
        const canSearchWorkers = isPro || establishment?.subscription?.plan?.can_search_workers;

        // Build where clause
        const whereClause = {
            user: {
                status: 'VALIDATED'
            },
            verification_status: 'VERIFIED'
        };

        // Filter by specialities
        if (speciality_ids) {
            const ids = Array.isArray(speciality_ids)
                ? speciality_ids.map(Number)
                : [Number(speciality_ids)];
            whereClause.specialities = {
                some: {
                    speciality_id: { in: ids }
                }
            };
        }

        // Filter by minimum experience
        if (min_experience) {
            whereClause.experience_years = {
                gte: Number(min_experience)
            };
        }

        // Filter by city or region
        if (city_id) {
            whereClause.city_id = Number(city_id);
        } else if (region_id) {
            whereClause.city = {
                region_id: Number(region_id)
            };
        }

        // Text search in name/title
        if (search) {
            whereClause.OR = [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get total count
        const totalCount = await prisma.workerProfile.count({ where: whereClause });

        // Fetch workers
        const workers = await prisma.workerProfile.findMany({
            where: whereClause,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            orderBy: { experience_years: 'desc' },
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                title: true,
                experience_years: true,
                profile_pic_url: true,
                verification_status: true,
                bio: canSearchWorkers ? true : false,
                city: {
                    select: {
                        name: true,
                        region: { select: { name: true } }
                    }
                },
                specialities: {
                    select: {
                        speciality: { select: { name: true } }
                    }
                },
                // Get availability status (has AVAILABLE event in next 7 days)
                calendar_events: {
                    where: {
                        type: 'AVAILABLE',
                        start_date: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
                        end_date: { gte: new Date() }
                    },
                    take: 1,
                    select: { event_id: true }
                },
                // Get average rating
                user: {
                    select: {
                        receivedReviews: {
                            select: { rating: true }
                        }
                    }
                }
            }
        });

        // Format response
        const formattedWorkers = workers.map(worker => {
            const reviews = worker.user?.receivedReviews || [];
            const avgRating = reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                : null;

            return {
                id: worker.user_id,
                name: canSearchWorkers
                    ? `${worker.first_name || ''} ${worker.last_name || ''}`.trim()
                    : `${worker.first_name?.[0] || ''}. ${worker.last_name || ''}`,
                title: worker.title || 'Professionnel',
                experience_years: worker.experience_years,
                profile_pic_url: worker.profile_pic_url,
                is_verified: worker.verification_status === 'VERIFIED',
                city: worker.city?.name,
                region: worker.city?.region?.name,
                specialities: worker.specialities.map(s => s.speciality.name),
                is_available: worker.calendar_events.length > 0,
                rating: avgRating,
                review_count: reviews.length,
                bio: canSearchWorkers ? worker.bio : null,
                is_locked: !canSearchWorkers
            };
        });

        // Filter by availability if requested
        let finalWorkers = formattedWorkers;
        if (available_now === 'true') {
            finalWorkers = formattedWorkers.filter(w => w.is_available);
        }

        res.status(200).json({
            status: 'success',
            data: {
                workers: finalWorkers,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / Number(limit))
                },
                subscription: {
                    isPro,
                    canViewFullProfiles: canSearchWorkers
                }
            }
        });

    } catch (error) {
        console.error('SEARCH WORKERS ERROR:', error);
        res.status(500).json({
            message: 'Failed to search workers'
        });
    }
};

//----------------------------- Get Worker Profile by ID (for Establishment) -----------------------------//
export const getWorkerById = async (req, res) => {
    try {
        const { id } = req.params;
        const establishmentId = req.user.user_id;

        // Verify it is an establishment (already done by middleware but safe to double check)
        const establishmentUser = await prisma.user.findUnique({
            where: { user_id: establishmentId },
            include: { subscription: { include: { plan: true } } }
        });

        const isSubscriber = establishmentUser?.subscription?.status === 'ACTIVE' &&
            ['PRO', 'PREMIUM'].includes(establishmentUser.subscription.plan.code);

        // Fetch worker profile
        const worker = await prisma.workerProfile.findUnique({
            where: { user_id: parseInt(id) },
            include: {
                user: { select: { email: isSubscriber ? true : false, status: true } },
                city: true,
                specialities: { include: { speciality: true } },
                diplomas: true,
                experiences: { orderBy: { start_date: 'desc' } },
                documents: { where: { status: 'VERIFIED' } }
            }
        });

        if (!worker) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.status(200).json({
            status: "success",
            data: worker,
            isSubscriber
        });

    } catch (error) {
        console.error("GET WORKER FOR ESTABLISHMENT ERROR:", error);
        res.status(500).json({ message: "Failed to fetch worker details" });
    }
};

//----------------------------- Request CV (Notification) -----------------------------//
export const requestCV = async (req, res) => {
    try {
        const { workerId } = req.body;
        const establishmentId = req.user.user_id;

        // Verify establishment exists
        const establishment = await prisma.establishmentProfile.findUnique({
            where: { user_id: establishmentId }
        });

        if (!establishment) {
            return res.status(404).json({ message: "Establishment profile not found" });
        }

        // Check if notification already sent recently (optional spam protection)
        const recentNotification = await prisma.notification.findFirst({
            where: {
                user_id: parseInt(workerId),
                type: 'CV_REQUEST',
                message: { contains: establishment.name }
            }
        });

        if (recentNotification) {
            // Allow resending only after some time or just return success to avoid info leak/spam
            // For now, let's just proceed or maybe return a message
        }

        // Create Notification
        await createNotification({
            userId: parseInt(workerId),
            type: 'CV_REQUEST',
            message: `L'établissement ${establishment.name} souhaite consulter votre CV. Pensez à l'ajouter à votre profil !`,
            link: '/worker/documents'
        });

        res.status(200).json({ message: "CV request sent successfully" });

    } catch (error) {
        console.error("REQUEST CV ERROR:", error);
        res.status(500).json({ message: "Failed to send CV request" });
    }
};
