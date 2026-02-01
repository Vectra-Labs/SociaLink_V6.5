import { prisma } from "../config/db.js";
import privilegeService from "../services/privilegeService.js";

// ... existing createMission, getMyMissions, getAllMissions ...


//----------------------------- Create Mission -----------------------------//
export const createMission = async (req, res) => {
    try {
        const {
            title,
            description,
            start_date,
            end_date,
            budget,
            city_id,
            contract_type,
            is_urgent,
            // New fields
            sector,
            positions_count,
            work_mode,
            experience_level,
            salary_min,
            salary_max,
            application_deadline,
            benefits,
            skills
        } = req.body;
        const establishment_id = req.user.user_id;

        // 1. Check Limits (Dynamic from DB)
        // Fetch current sub + plan
        const subscription = await prisma.subscription.findUnique({
            where: { user_id: establishment_id },
            include: { plan: true }
        });

        let maxMissions = null; // Default null = unlimited
        let canPostUrgent = false;

        if (subscription && subscription.status === 'ACTIVE') {
            maxMissions = subscription.plan.max_active_missions;
            canPostUrgent = subscription.plan.can_post_urgent;
        } else {
            // No active sub -> Fallback to BASIC Free Plan
            const basicPlan = await prisma.subscriptionPlanConfig.findUnique({
                where: {
                    code_target_role: {
                        code: 'BASIC',
                        target_role: 'ESTABLISHMENT'
                    }
                }
            });
            if (basicPlan) {
                maxMissions = basicPlan.max_active_missions;
                canPostUrgent = basicPlan.can_post_urgent;
            }
        }

        // Check Limit Usage
        if (maxMissions !== null) {
            const activeCount = await prisma.mission.count({
                where: {
                    establishment_id,
                    status: { in: ['OPEN', 'IN_PROGRESS'] }
                }
            });

            if (activeCount >= maxMissions) {
                return res.status(403).json({
                    message: `Limite de missions atteinte (${activeCount}/${maxMissions}). Passez au plan Pro pour plus.`,
                    code: 'LIMIT_REACHED'
                });
            }
        }

        // Check Urgency Privilege
        if (is_urgent && !canPostUrgent) {
            return res.status(403).json({
                message: "Seuls les membres Pro peuvent publier des missions urgentes.",
                code: 'URGENT_RESTRICTED'
            });
        }

        const mission = await prisma.mission.create({
            data: {
                title,
                description,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                budget: budget ? parseFloat(budget) : null,
                establishment_id,
                city_id: parseInt(city_id),
                status: "OPEN",
                contract_type: contract_type || "FREELANCE",
                is_urgent: is_urgent || false,
                // New fields
                sector: sector || null,
                positions_count: positions_count ? parseInt(positions_count) : 1,
                work_mode: work_mode || "ON_SITE",
                experience_level: experience_level || "INTERMEDIATE",
                salary_min: salary_min ? parseFloat(salary_min) : null,
                salary_max: salary_max ? parseFloat(salary_max) : null,
                application_deadline: application_deadline ? new Date(application_deadline) : null,
                benefits: benefits || [],
                skills: skills || []
            }
        });
        res.status(201).json({ message: "Mission created", data: mission });
    } catch (error) {
        console.error("CREATE MISSION ERROR:", error);
        res.status(500).json({ message: "Failed to create mission" });
    }
};

//----------------------------- Update Mission -----------------------------//
export const updateMission = async (req, res) => {
    try {
        const { id } = req.params;
        const establishment_id = req.user.user_id;
        const {
            title,
            description,
            start_date,
            end_date,
            budget,
            city_id,
            contract_type,
            is_urgent,
            sector,
            positions_count,
            work_mode,
            experience_level,
            salary_min,
            salary_max,
            application_deadline,
            benefits,
            skills
        } = req.body;

        // 1. Verify Ownership
        const existingMission = await prisma.mission.findUnique({
            where: { mission_id: parseInt(id) }
        });

        if (!existingMission) {
            return res.status(404).json({ message: "Mission introuvable" });
        }

        if (existingMission.establishment_id !== establishment_id) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        // 2. Update Data
        const updatedMission = await prisma.mission.update({
            where: { mission_id: parseInt(id) },
            data: {
                title,
                description,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                budget: budget ? parseFloat(budget) : null,
                city_id: parseInt(city_id),
                contract_type,
                is_urgent: is_urgent || false,
                sector: sector || null,
                positions_count: positions_count ? parseInt(positions_count) : 1,
                work_mode: work_mode || "ON_SITE",
                experience_level: experience_level || "INTERMEDIATE",
                salary_min: salary_min ? parseFloat(salary_min) : null,
                salary_max: salary_max ? parseFloat(salary_max) : null,
                application_deadline: application_deadline ? new Date(application_deadline) : null,
                benefits: benefits || [],
                skills: skills || []
            }
        });

        res.status(200).json({ message: "Mission mise à jour avec succès", data: updatedMission });
    } catch (error) {
        console.error("UPDATE MISSION ERROR:", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour de la mission" });
    }
};

export const getMyMissions = async (req, res) => {
    try {
        const establishment_id = req.user.user_id;
        const missions = await prisma.mission.findMany({
            where: { establishment_id },
            orderBy: { created_at: 'desc' },
            include: {
                city: true,
                _count: {
                    select: { applications: true }
                }
            }
        });
        res.status(200).json({ data: missions });
    } catch (error) {
        console.error("GET MY MISSIONS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch missions" });
    }
};

//----------------------------- Get Single Mission by ID -----------------------------//
export const getMissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const isWorker = user?.role === "WORKER";
        const isValidated = user?.status === "VALIDATED";

        const mission = await prisma.mission.findUnique({
            where: { mission_id: parseInt(id) },
            include: {
                establishment: {
                    select: { user_id: true, name: true, slug: true, logo_url: true, city: { select: { name: true } } }
                },
                city: true,
                applications: user?.role === 'WORKER' ? {
                    where: { worker_profile_id: user.user_id },
                    select: { application_id: true, status: true, worker_profile_id: true }
                } : false
            }
        });

        if (!mission) {
            return res.status(404).json({ message: "Mission introuvable" });
        }

        // Increment View Count (Fire and forget, or await)
        await prisma.mission.update({
            where: { mission_id: parseInt(id) },
            data: { views: { increment: 1 } }
        });

        // Apply redaction logic
        let processedMission = { ...mission };

        if (!user) {
            processedMission = {
                ...mission,
                description: null,
                budget: null,
                salary_min: null,
                salary_max: null,
                is_redacted: true,
                redaction_reason: "VISITOR"
            };
        } else if (isWorker) {
            // Check subscription
            const sub = await prisma.subscription.findUnique({
                where: { user_id: user.user_id },
                include: { plan: true }
            });
            const isSubscriber = sub?.status === 'ACTIVE' && sub?.plan?.code !== 'BASIC';

            if (!isValidated) {
                processedMission = {
                    ...mission,
                    description: null,
                    budget: null,
                    salary_min: null,
                    salary_max: null,
                    is_redacted: true,
                    redaction_reason: "NOT_VALIDATED"
                };
            } else if (!isSubscriber) {
                const createdAt = new Date(mission.created_at);
                const now = new Date();
                const hoursDiff = (now - createdAt) / 36e5;

                if (hoursDiff < 48) {
                    processedMission = {
                        ...mission,
                        description: null,
                        budget: null,
                        salary_min: null,
                        salary_max: null,
                        is_redacted: true,
                        redaction_reason: "RECENT_MISSION_PREMIUM_ONLY"
                    };
                } else if (mission.is_urgent) {
                    processedMission = {
                        ...mission,
                        description: null,
                        budget: null,
                        salary_min: null,
                        salary_max: null,
                        is_redacted: true,
                        redaction_reason: "URGENT_PREMIUM_ONLY"
                    };
                }
            }
        }

        res.status(200).json({ data: processedMission });
    } catch (error) {
        console.error("GET MISSION BY ID ERROR:", error);
        res.status(500).json({ message: "Failed to fetch mission" });
    }
};

//----------------------------- Get All Missions (Filtering + Pagination) -----------------------------//
export const getAllMissions = async (req, res) => {
    try {
        const user = req.user; // Can be undefined if public access is allowed
        const isWorker = user?.role === "WORKER";
        const isValidated = user?.status === "VALIDATED";

        // 1. Query Params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { search, city_id, contract_type, min_budget, is_urgent } = req.query;

        // 2. Build Where Clause
        const where = {
            status: "OPEN"
        };

        if (city_id) where.city_id = parseInt(city_id);
        if (contract_type) where.contract_type = contract_type;
        if (min_budget) where.budget = { gte: parseFloat(min_budget) };
        if (is_urgent === 'true') where.is_urgent = true;

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { establishment: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // 3. Fetch Subscription Status (for Redaction Logic)
        let isSubscriber = false;
        if (isWorker) {
            const sub = await prisma.subscription.findUnique({
                where: { user_id: user.user_id },
                include: { plan: true }
            });
            isSubscriber = sub?.status === 'ACTIVE' && sub?.plan?.code !== 'BASIC';
        }

        // 4. Fetch Privilege Settings (Dynamic from DB with cache)
        const privileges = await privilegeService.getPrivileges();
        const visibilityDelayHours = privileges.worker_visibility_delay_hours || 48;
        const urgentPremiumOnly = privileges.worker_urgent_access_premium_only !== false;

        // 5. Fetch Data with Pagination
        const [missions, total] = await Promise.all([
            prisma.mission.findMany({
                where,
                skip,
                take: limit,
                include: {
                    establishment: {
                        select: { user_id: true, name: true, slug: true, logo_url: true, city: { select: { name: true } } }
                    },
                    city: true
                },
                orderBy: [
                    { is_urgent: 'desc' },
                    { created_at: 'desc' }
                ]
            }),
            prisma.mission.count({ where })
        ]);

        // 6. Apply Redaction / Visibility Logic (using dynamic privileges)
        const processedMissions = missions.map(mission => {
            // If VISITOR (No User)
            if (!user) {
                return {
                    ...mission,
                    description: null,
                    budget: null,
                    establishment: { name: mission.establishment.name }, // No slug/link
                    location_details: null,
                    is_redacted: true,
                    redaction_reason: "VISITOR"
                };
            }

            // If WORKER
            if (isWorker) {
                // Not Validated
                if (!isValidated) {
                    return {
                        ...mission,
                        description: null,
                        budget: null,
                        location_details: null,
                        is_redacted: true,
                        redaction_reason: "NOT_VALIDATED"
                    };
                }

                // Validated but No Sub
                if (!isSubscriber) {
                    const createdAt = new Date(mission.created_at);
                    const now = new Date();
                    const hoursDiff = (now - createdAt) / 36e5;

                    // Recent Mission (using dynamic delay from privileges)
                    if (hoursDiff < visibilityDelayHours) {
                        return {
                            ...mission,
                            description: null,
                            budget: null,
                            is_redacted: true,
                            redaction_reason: "RECENT_MISSION_PREMIUM_ONLY"
                        };
                    }

                    // Urgent Mission (using dynamic setting)
                    if (mission.is_urgent && urgentPremiumOnly) {
                        return {
                            ...mission,
                            description: null,
                            budget: null,
                            is_redacted: true,
                            redaction_reason: "URGENT_PREMIUM_ONLY"
                        };
                    }
                }
            }

            // Logged in (Premium Worker OR Other roles) -> Full Access
            return mission;
        });

        res.status(200).json({
            status: "success",
            data: processedMissions,
            meta: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                role: user?.role || "VISITOR",
                isSubscriber,
                privileges: {
                    visibilityDelayHours,
                    urgentPremiumOnly
                }
            }
        });

    } catch (error) {
        console.error("GET ALL MISSIONS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch missions" });
    }
};

//----------------------------- Update Mission Status -----------------------------//
export const updateMissionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const establishment_id = req.user.user_id;

        const mission = await prisma.mission.findUnique({ where: { mission_id: parseInt(id) } });
        if (!mission) return res.status(404).json({ message: "Mission not found" });

        if (mission.establishment_id !== establishment_id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updated = await prisma.mission.update({
            where: { mission_id: parseInt(id) },
            data: { status } // Expects MissionStatus enum string
        });

        res.status(200).json({ message: "Status updated", data: updated });
    } catch (error) {
        console.error("UPDATE MISSION STATUS ERROR:", error);
        res.status(500).json({ message: "Failed to update status" });
    }
};
