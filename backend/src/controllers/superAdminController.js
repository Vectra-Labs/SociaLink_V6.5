import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { createNotification } from "../services/notificationService.js";

/**
 * Get all admins (Super Admin & Admin)
 */
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN']
                }
            },
            select: {
                user_id: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
                admin_permissions: true,
                adminProfile: {
                    select: {
                        first_name: true,
                        last_name: true,
                        profile_pic_url: true,
                        department: true,
                        phone: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Create a new Admin (with optional profile data)
 */
export const createAdmin = async (req, res) => {
    try {
        const { email, password, permissions, role, profile } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Transaction to create User + AdminProfile + Log
        const result = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: role || 'ADMIN',
                    status: 'VALIDATED',
                    admin_permissions: permissions || [],
                }
            });

            // Create admin profile if profile data provided
            if (profile && (profile.first_name || profile.last_name)) {
                await tx.adminProfile.create({
                    data: {
                        user_id: newUser.user_id,
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        phone: profile.phone || null,
                        department: profile.department || null,
                    }
                });
            }

            // Log action
            await tx.adminLog.create({
                data: {
                    admin_id: req.user.user_id,
                    action: 'CREATE_ADMIN',
                    target_type: 'USER',
                    target_id: newUser.user_id.toString(),
                    details: { email, role: newUser.role, permissions, profile }
                }
            });

            return newUser;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: "Erreur lors de la création de l'admin" });
    }
};

/**
 * Update Admin (Permissions, Status, Profile)
 */
export const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { permissions, status, role, profile } = req.body;

        const targetId = parseInt(id);

        // Prevent modifying self status (to avoid locking oneself out)
        if (targetId === req.user.user_id && status && status !== 'VALIDATED') {
            return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre statut" });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            // Update user
            const u = await tx.user.update({
                where: { user_id: targetId },
                data: {
                    admin_permissions: permissions,
                    status: status,
                    role: role
                },
                select: { user_id: true, email: true, admin_permissions: true, status: true, role: true }
            });

            // Update or create admin profile if profile data provided
            if (profile) {
                await tx.adminProfile.upsert({
                    where: { user_id: targetId },
                    update: {
                        first_name: profile.first_name,
                        last_name: profile.last_name,
                        phone: profile.phone || null,
                        department: profile.department || null,
                        profile_pic_url: profile.profile_pic_url || null,
                    },
                    create: {
                        user_id: targetId,
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        phone: profile.phone || null,
                        department: profile.department || null,
                        profile_pic_url: profile.profile_pic_url || null,
                    }
                });
            }

            await tx.adminLog.create({
                data: {
                    admin_id: req.user.user_id,
                    action: 'UPDATE_ADMIN',
                    target_type: 'USER',
                    target_id: id.toString(),
                    details: { changes: { permissions, status, role, profile } }
                }
            });

            return u;
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

/**
 * Get Audit Logs
 */
export const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.adminLog.findMany({
            take: 100, // Limit to last 100 logs
            orderBy: {
                created_at: 'desc'
            },
            include: {
                admin: {
                    select: {
                        user_id: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Get Dashboard Stats
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Parallel fetching for performance
        const [
            workersCount,
            establishmentsCount,
            pendingValidationsCount,
            missionsCount,
            activeSubscriptions,
            recentLogs
        ] = await Promise.all([
            // 1. Users Counts
            prisma.user.count({ where: { role: 'WORKER' } }),
            prisma.user.count({ where: { role: 'ESTABLISHMENT' } }),
            prisma.user.count({ where: { status: 'PENDING' } }),

            // 2. Missions Counts
            prisma.mission.groupBy({
                by: ['status'],
                _count: { mission_id: true }
            }),

            // 3. Subscriptions (for Revenue)
            prisma.subscription.findMany({
                where: { status: 'ACTIVE' },
                include: { plan: true }
            }),

            // 4. Recent Logs for Activity Feed
            prisma.adminLog.findMany({
                take: 5,
                orderBy: { created_at: 'desc' },
                include: { admin: { select: { email: true } } }
            })
        ]);

        // Process Missions Stats
        const missionsStats = {
            total: 0,
            active: 0,
            completed: 0
        };
        missionsCount.forEach(group => {
            missionsStats.total += group._count.mission_id;
            if (group.status === 'OPEN' || group.status === 'IN_PROGRESS') missionsStats.active += group._count.mission_id;
            if (group.status === 'COMPLETED') missionsStats.completed += group._count.mission_id;
        });

        // Process Revenue (MRR)
        let totalRevenue = 0;
        let workerRevenue = 0;
        let establishmentRevenue = 0;

        activeSubscriptions.forEach(sub => {
            if (sub.plan?.price_monthly) {
                // Price is in cents, convert to DH
                const amount = sub.plan.price_monthly; // Assuming schema says price_monthly is int
                totalRevenue += amount;
                if (sub.plan.target_role === 'WORKER') workerRevenue += amount;
                if (sub.plan.target_role === 'ESTABLISHMENT') establishmentRevenue += amount;
            }
        });

        res.json({
            users: {
                workers: workersCount,
                establishments: establishmentsCount,
                pending: pendingValidationsCount
            },
            missions: missionsStats,
            revenue: {
                total: totalRevenue,
                workers: workerRevenue,
                establishments: establishmentRevenue
            },
            recentActivity: recentLogs
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: "Erreur lors du chargement des statistiques" });
    }
};

/**
 * Get All Subscription Plans
 */
export const getPlans = async (req, res) => {
    try {
        const plans = await prisma.subscriptionPlanConfig.findMany({
            orderBy: { price_monthly: 'asc' },
            include: {
                _count: {
                    select: { subscriptions: true }
                }
            }
        });
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Update Subscription Plan
 */
export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const planId = parseInt(id);

        // Remove ID from data if present to avoid error
        delete data.plan_id;
        delete data.created_at;
        delete data.updated_at;
        delete data._count;

        const updatedPlan = await prisma.$transaction(async (tx) => {
            const plan = await tx.subscriptionPlanConfig.update({
                where: { plan_id: planId },
                data: data
            });

            await tx.adminLog.create({
                data: {
                    admin_id: req.user.user_id,
                    action: 'UPDATE_PLAN',
                    target_type: 'PLAN',
                    target_id: id.toString(),
                    details: { name: plan.name, role: plan.target_role }
                }
            });

            return plan;
        });

        res.json(updatedPlan);
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du plan" });
    }
};

/**
 * Create Subscription Plan
 */
export const createPlan = async (req, res) => {
    try {
        const data = req.body;

        const newPlan = await prisma.$transaction(async (tx) => {
            const plan = await tx.subscriptionPlanConfig.create({
                data: data
            });

            await tx.adminLog.create({
                data: {
                    admin_id: req.user.user_id,
                    action: 'CREATE_PLAN',
                    target_type: 'PLAN',
                    target_id: plan.plan_id.toString(),
                    details: { name: plan.name, role: plan.target_role }
                }
            });

            return plan;
        });

        res.status(201).json(newPlan);
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ message: "Erreur lors de la création du plan" });
    }
};

/**
 * Get Marketing Banners
 */
export const getBanners = async (req, res) => {
    try {
        const banners = await prisma.marketingBanner.findMany({
            orderBy: { priority: 'desc' },
        });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Create/Update Banner
 */
export const upsertBanner = async (req, res) => {
    try {
        const { id } = req.params; // if updating
        const data = req.body;

        // Remove meta fields
        delete data.banner_id;
        delete data.created_at;

        if (id) {
            const updated = await prisma.marketingBanner.update({
                where: { banner_id: parseInt(id) },
                data
            });
            await prisma.adminLog.create({
                data: {
                    admin_id: req.user.user_id,
                    action: 'UPDATE_BANNER',
                    target_type: 'BANNER',
                    target_id: id,
                    details: { title: updated.title }
                }
            });
            return res.json(updated);
        } else {
            const created = await prisma.marketingBanner.create({ data });
            await prisma.adminLog.create({
                data: {
                    admin_id: req.user.user_id,
                    action: 'CREATE_BANNER',
                    target_type: 'BANNER',
                    target_id: created.banner_id.toString(),
                    details: { title: created.title }
                }
            });
            return res.json(created);
        }
    } catch (error) {
        console.error('Error upserting banner:', error);
        res.status(500).json({ message: "Erreur lors de la sauvegarde" });
    }
};

/**
 * Delete Banner
 */
export const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.marketingBanner.delete({ where: { banner_id: parseInt(id) } });
        res.json({ message: "Bannière supprimée" });
    } catch (error) {
        res.status(500).json({ message: "Erreur suppression" });
    }
};

/**
 * Send Mass Notification
 */
export const sendGlobalNotification = async (req, res) => {
    try {
        const { title, message, target_role, target_status } = req.body;

        // 1. Find Users
        const whereClause = {};
        if (target_role && target_role !== 'ALL') whereClause.role = target_role;
        if (target_status) whereClause.status = target_status;

        const users = await prisma.user.findMany({
            where: whereClause,
            select: { user_id: true }
        });

        if (users.length === 0) return res.status(404).json({ message: "Aucun utilisateur cible trouvé." });

        // 2. Create Notifications Batch
        const notifications = users.map(u => ({
            user_id: u.user_id,
            type: 'SYSTEM_ALERT', // or INFO
            message: `${title}: ${message}`,
            is_read: false,
            created_at: new Date()
        }));

        // Use Promise.all to send parallel notifications via service
        await Promise.all(notifications.map(n => createNotification({
            userId: n.user_id,
            type: n.type,
            message: n.message,
            link: '/dashboard' // or generic link
        })));

        // Log
        await prisma.adminLog.create({
            data: {
                admin_id: req.user.user_id,
                action: 'SEND_NOTIFICATION',
                target_type: 'USER_BATCH',
                details: { count: users.length, title, role: target_role || 'ALL' }
            }
        });

        res.json({ message: `${users.length} notifications envoyées avec succès.` });

    } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ message: "Erreur lors de l'envoi des notifications" });
    }
};

/**
 * Get All Users (Paginated & Filtered)
 */
export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * 20;

        const where = {};
        if (role && role !== 'ALL') where.role = role;
        if (status && status !== 'all') {
            let dbStatus = status.toUpperCase();
            if (dbStatus === 'APPROVED') dbStatus = 'OPEN'; // Map frontend APPROVED to backend OPEN
            where.status = dbStatus;
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { nom: { contains: search, mode: 'insensitive' } },
                { prenom: { contains: search, mode: 'insensitive' } },
                { nom_etablissement: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: 20,
                orderBy: { created_at: 'desc' },
                include: {
                    subscription: { include: { plan: true } }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / 20)
            }
        });
    } catch (error) {
        console.error('Get Users Error:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Update User Status (Suspend/Validate)
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        const updatedUser = await prisma.user.update({
            where: { user_id: parseInt(id) },
            data: { status }
        });

        // Log Action
        await prisma.adminLog.create({
            data: {
                admin_id: req.user.user_id,
                action: 'UPDATE_USER_STATUS',
                target_type: 'USER',
                target_id: id,
                details: {
                    new_status: status,
                    reason,
                    email: updatedUser.email
                }
            }
        });

        // Notify User (Optional)
        await createNotification({
            userId: parseInt(id),
            type: 'SYSTEM_ALERT',
            message: `Votre compte a été passé au statut : ${status}. ${reason ? `Raison : ${reason}` : ''}`
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update User Status Error:', error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
};

/**
 * Get Single User Details
 */
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { user_id: parseInt(id) },
            include: {
                workerProfile: {
                    include: {
                        experiences: true,
                        diplomas: true,
                        specialities: {
                            include: { speciality: true }
                        }
                    }
                },
                establishmentProfile: true,
                subscription: {
                    include: { plan: true }
                },
                notifications: {
                    take: 5,
                    orderBy: { created_at: 'desc' }
                },
                // Add missions if needed, but might be heavy. 
                // Just counts might suffice, which we can calculate if not in usage stats.
            }
        });

        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        res.json(user);
    } catch (error) {
        console.error('Get User Details Error:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Get Financial Overview
 */
export const getFinancialStats = async (req, res) => {
    try {
        // 1. Calculate MRR (Active Subscriptions)
        const activeSubs = await prisma.subscription.findMany({
            where: { status: 'ACTIVE' },
            include: { plan: true }
        });
        const mrrCents = activeSubs.reduce((sum, sub) => sum + (sub.plan.price_monthly || 0), 0);

        // 2. Total Revenue
        const totalRev = await prisma.payment.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        });
        const totalRevenueCents = totalRev._sum.amount || 0;

        // 3. Chart Data (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentPayments = await prisma.payment.findMany({
            where: {
                status: 'COMPLETED',
                created_at: { gte: sixMonthsAgo }
            },
            select: { amount: true, created_at: true }
        });

        // Group by Month
        const chartData = {};
        recentPayments.forEach(p => {
            const month = new Date(p.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
            chartData[month] = (chartData[month] || 0) + (p.amount / 100);
        });

        res.json({
            mrr: mrrCents / 100,
            totalRevenue: totalRevenueCents / 100,
            activeSubscriptions: activeSubs.length,
            chartData: Object.entries(chartData).map(([name, value]) => ({ name, value }))
        });

    } catch (error) {
        console.error('Finance Stats Error:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Get Transactions List
 */
export const getTransactions = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * 20;

        const [transactions, total] = await Promise.all([
            prisma.payment.findMany({
                skip,
                take: 20,
                orderBy: { created_at: 'desc' },
                include: {
                    user: {
                        select: {
                            email: true,
                            workerProfile: { select: { first_name: true, last_name: true } },
                            establishmentProfile: { select: { name: true, contact_first_name: true, contact_last_name: true } }
                        }
                    }
                }
            }),
            prisma.payment.count()
        ]);

        res.json({
            transactions: transactions.map(t => ({
                ...t,
                amount: t.amount / 100, // Convert to DH
                user: {
                    ...t.user,
                    nom: t.user.workerProfile?.last_name || t.user.establishmentProfile?.contact_last_name || t.user.establishmentProfile?.name || '',
                    prenom: t.user.workerProfile?.first_name || t.user.establishmentProfile?.contact_first_name || ''
                }
            })),
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / 20)
            }
        });
    } catch (error) {
        console.error('Transactions Error:', error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Quality Control Logic
 */
export const getQualityStats = async (req, res) => {
    try {
        const [totalWorkers, verifiedWorkers, totalEst, verifiedEst] = await Promise.all([
            prisma.workerProfile.count(),
            prisma.workerProfile.count({ where: { verification_status: 'VERIFIED' } }),
            prisma.establishmentProfile.count(),
            prisma.establishmentProfile.count({ where: { verification_status: 'VERIFIED' } }),
        ]);

        const workerScore = Math.round((verifiedWorkers / (totalWorkers || 1)) * 100);
        const estScore = Math.round((verifiedEst / (totalEst || 1)) * 100);

        res.json({
            globalScore: Math.round((workerScore + estScore) / 2),
            workerVerificationRate: workerScore,
            establishmentVerificationRate: estScore,
            pendingCount: (totalWorkers - verifiedWorkers) + (totalEst - verifiedEst) // Crude, better use actual pending count below
        });
    } catch (error) {
        console.error("Quality Stats Error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const getPendingVerifications = async (req, res) => {
    try {
        const { status } = req.query; // pending, in_review, verified, rejected, or undefined for all
        console.log('[DEBUG] getPendingVerifications called with status:', status);

        // Map frontend status to profile verification_status
        const mapStatus = (s) => {
            if (!s || s === 'all') return undefined;
            switch (s.toLowerCase()) {
                case 'pending': return 'PENDING';
                case 'in_review': return 'PENDING'; // In review still has PENDING verification
                case 'validated':
                case 'verified': return 'VERIFIED';
                case 'rejected': return 'REJECTED';
                default: return 'PENDING';
            }
        };

        const verificationStatus = mapStatus(status);
        console.log('[DEBUG] verificationStatus filter:', verificationStatus);

        const [workers, establishments] = await Promise.all([
            prisma.workerProfile.findMany({
                where: verificationStatus ? { verification_status: verificationStatus } : {},
                include: {
                    user: {
                        select: {
                            user_id: true,
                            email: true,
                            status: true,
                            created_at: true
                        }
                    },
                    city: { select: { name: true } },
                    diplomas: { select: { diploma_id: true, name: true, verification_status: true, file_path: true } },
                    experiences: { select: { experience_id: true, establishment_name: true, job_title: true } },
                    specialities: { include: { speciality: { select: { name: true } } } },
                    documents: { select: { document_id: true, type: true, name: true, status: true } }
                },
                take: 50
            }),
            prisma.establishmentProfile.findMany({
                where: verificationStatus ? { verification_status: verificationStatus } : {},
                include: {
                    user: {
                        select: {
                            user_id: true,
                            email: true,
                            status: true,
                            created_at: true
                        }
                    },
                    city: { select: { name: true } },
                    documents: { select: { document_id: true, type: true, file_url: true, status: true } } // status, not verification_status, type not doc_type
                },
                take: 50
            })
        ]);

        console.log('[DEBUG] Workers fetched:', workers.length, 'Establishments:', establishments.length);

        // Get counts for stats using profile verification_status
        const [pendingWorkers, pendingEst, verifiedWorkers, verifiedEst, rejectedWorkers, rejectedEst] = await Promise.all([
            prisma.workerProfile.count({ where: { verification_status: 'PENDING' } }),
            prisma.establishmentProfile.count({ where: { verification_status: 'PENDING' } }),
            prisma.workerProfile.count({ where: { verification_status: 'VERIFIED' } }),
            prisma.establishmentProfile.count({ where: { verification_status: 'VERIFIED' } }),
            prisma.workerProfile.count({ where: { verification_status: 'REJECTED' } }),
            prisma.establishmentProfile.count({ where: { verification_status: 'REJECTED' } })
        ]);

        // Format queue for frontend
        const queue = [
            ...workers.map(w => ({
                user_id: w.user_id,
                type: 'WORKER',
                role: 'WORKER',
                status: w.verification_status, // Use profile verification status
                verification_status: w.verification_status,
                displayName: `${w.first_name || ''} ${w.last_name || ''}`.trim() || w.user?.email || 'Unknown',
                prenom: w.first_name || '',
                nom: w.last_name || '',
                name: `${w.first_name || ''} ${w.last_name || ''}`.trim(),
                email: w.user?.email,
                created_at: w.user?.created_at,
                profile_pic_url: w.profile_pic_url,
                city: w.city,
                title: w.title,
                experience_years: w.experience_years,
                bio: w.bio,
                phone: w.phone,
                address: w.address,
                documentsCount: (w.diplomas?.length || 0) + (w.documents?.length || 0),
                diplomasCount: w.diplomas?.length || 0,
                experiencesCount: w.experiences?.length || 0,
                specialities: w.specialities?.map(s => s.speciality.name) || [],
                profileCompleteness: calculateProfileCompleteness(w)
            })),
            ...establishments.map(e => ({
                user_id: e.user_id,
                type: 'ESTABLISHMENT',
                role: 'ESTABLISHMENT',
                status: e.verification_status, // Use profile verification status
                verification_status: e.verification_status,
                displayName: e.name || `${e.contact_first_name || ''} ${e.contact_last_name || ''}`.trim() || e.user?.email || 'Unknown',
                prenom: e.contact_first_name || '',
                nom: e.contact_last_name || e.name || '',
                name: e.name,
                email: e.user?.email,
                created_at: e.user?.created_at,
                logo_url: e.logo_url,
                city: e.city,
                ice_number: e.ice_number,
                rc_number: e.rc_number,
                phone: e.phone,
                website: e.website,
                description: e.description,
                documentsCount: e.documents?.length || 0
            }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Most recent first

        res.json({
            items: queue,
            stats: {
                pending: pendingWorkers + pendingEst,
                in_review: 0, // IN_REVIEW is tracked on User.status, not profile
                validated: verifiedWorkers + verifiedEst,
                rejected: rejectedWorkers + rejectedEst
            }
        });
    } catch (error) {
        console.error("=== Pending Verifications Error ===");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Helper function to calculate profile completeness
function calculateProfileCompleteness(worker) {
    let score = 0;
    const fields = [
        worker.first_name, worker.last_name, worker.title, worker.bio,
        worker.phone, worker.address, worker.profile_pic_url, worker.city_id
    ];
    fields.forEach(f => { if (f) score += 10; });

    // Bonus for experiences and specialities
    if (worker.experiences && worker.experiences.length > 0) score += 10;
    if (worker.specialities && worker.specialities.length > 0) score += 10;

    return Math.min(100, score);
}

// Get Full Worker Details for Verification
export const getWorkerFullDetails = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const worker = await prisma.workerProfile.findUnique({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                        created_at: true,
                        role: true
                    }
                },
                city: true,
                specialities: {
                    include: {
                        speciality: true
                    }
                },
                diplomas: {
                    orderBy: {
                        obtained_at: 'desc'
                    }
                },
                experiences: {
                    orderBy: {
                        start_date: 'desc'
                    }
                },
                documents: true,
                languages: { // Assuming this relation exists or similar
                    include: {
                        language: true
                    }
                }
            }
        });

        if (!worker) {
            return res.status(404).json({ message: "Worker profile not found" });
        }

        // Format specialized data if needed
        const formattedWorker = {
            ...worker,
            email: worker.user.email,
            userStatus: worker.user.status,
            role: worker.user.role,
            createdAt: worker.user.created_at,
            specialities: worker.specialities.map(ws => ws.speciality.name),
            // Ensure diplomas and experiences are arrays
            diplomas: worker.diplomas || [],
            experiences: worker.experiences || [],
            documents: worker.documents || []
        };

        res.json({
            worker: formattedWorker,
            diplomas: formattedWorker.diplomas,
            experiences: formattedWorker.experiences,
            documents: formattedWorker.documents
        });
    } catch (error) {
        console.error("Error fetching worker details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get Full Establishment Details for Verification
export const getEstablishmentFullDetails = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const establishment = await prisma.establishmentProfile.findUnique({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        email: true,
                        status: true,
                        created_at: true,
                        role: true
                    }
                },
                city: true,
                structure: true,
                documents: {
                    orderBy: {
                        uploaded_at: 'desc'
                    }
                }
            }
        });

        if (!establishment) {
            return res.status(404).json({ message: "Establishment profile not found" });
        }

        // Format specialized data
        const formattedEstablishment = {
            ...establishment,
            email: establishment.user.email,
            userStatus: establishment.user.status,
            role: establishment.user.role,
            createdAt: establishment.user.created_at,
            documents: establishment.documents || []
        };

        res.json({
            establishment: formattedEstablishment,
            documents: formattedEstablishment.documents
        });

    } catch (error) {
        console.error("Error fetching establishment full details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const reviewProfile = async (req, res) => {
    try {
        const { type, id } = req.params; // type: 'WORKER' | 'ESTABLISHMENT'
        const { action, reason, notes } = req.body; // action: 'take_charge' | 'validate' | 'reject'
        const adminId = req.user.user_id;
        const userId = parseInt(id);

        let newStatus;
        let notificationMessage;
        let notificationType;

        switch (action) {
            case 'take_charge':
                newStatus = 'IN_REVIEW';
                notificationMessage = "Votre dossier est en cours de vérification par un administrateur.";
                notificationType = 'INFO';
                break;
            case 'validate':
                newStatus = 'VALIDATED';
                notificationMessage = "Félicitations ! Votre profil a été vérifié et approuvé par un administrateur.";
                notificationType = 'SUCCESS';
                break;
            case 'reject':
                newStatus = 'REJECTED';
                notificationMessage = `Votre demande de vérification a été rejetée. Motif: ${reason || 'Non spécifié'}`;
                notificationType = 'WARNING';
                break;
            default:
                return res.status(400).json({ message: "Action invalide" });
        }

        // Update User.status
        await prisma.user.update({
            where: { user_id: userId },
            data: { status: newStatus }
        });

        // Also update profile verification_status for backward compatibility
        const verificationStatus = newStatus === 'VALIDATED' ? 'VERIFIED' :
            newStatus === 'REJECTED' ? 'REJECTED' : 'PENDING';

        if (type === 'WORKER') {
            await prisma.workerProfile.update({
                where: { user_id: userId },
                data: { verification_status: verificationStatus }
            });
        } else if (type === 'ESTABLISHMENT') {
            await prisma.establishmentProfile.update({
                where: { user_id: userId },
                data: { verification_status: verificationStatus }
            });
        }

        // Log the action
        await prisma.adminLog.create({
            data: {
                admin_id: adminId,
                action: `VERIFICATION_${action.toUpperCase()}`,
                target_type: type,
                target_id: id,
                details: {
                    new_status: newStatus,
                    reason: reason || null,
                    notes: notes || null
                }
            }
        });

        // Notify User
        await createNotification({
            userId: userId,
            type: notificationType,
            message: notificationMessage,
            link: type === 'WORKER' ? '/worker/dashboard' : '/establishment/dashboard'
        });

        res.json({
            message: "Profil mis à jour",
            status: newStatus,
            user_id: userId
        });
    } catch (error) {
        console.error("Review Profile Error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * System Settings
 */
export const getSystemSettings = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        // Convert array to object { key: value }
        const config = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(config);
    } catch (error) {
        console.error("Get Settings Error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * Public endpoint for Hero Stats (no authentication required)
 */
export const getPublicHeroStats = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['hero_stat_experts', 'hero_stat_partenaires', 'hero_stat_satisfaction'] }
            }
        });

        // Convert to object with defaults
        const stats = {
            experts: 1200,
            partenaires: 350,
            satisfaction: 98
        };

        settings.forEach(s => {
            if (s.key === 'hero_stat_experts') stats.experts = parseInt(s.value) || 1200;
            if (s.key === 'hero_stat_partenaires') stats.partenaires = parseInt(s.value) || 350;
            if (s.key === 'hero_stat_satisfaction') stats.satisfaction = parseInt(s.value) || 98;
        });

        res.json(stats);
    } catch (error) {
        console.error("Get Hero Stats Error:", error);
        // Return defaults on error
        res.json({ experts: 1200, partenaires: 350, satisfaction: 98 });
    }
};

/**
 * Public endpoint for Feature Flags (no authentication required)
 * Used by Messages.jsx to check if audio/video calls are enabled
 */
export const getPublicFeatures = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['feature_audio_calls', 'feature_video_calls'] }
            }
        });

        // Default: all features disabled
        const features = {
            audio_calls: false,
            video_calls: false
        };

        settings.forEach(s => {
            if (s.key === 'feature_audio_calls') features.audio_calls = s.value === 'true';
            if (s.key === 'feature_video_calls') features.video_calls = s.value === 'true';
        });

        res.json(features);
    } catch (error) {
        console.error("Get Features Error:", error);
        // Return defaults (disabled) on error
        res.json({ audio_calls: false, video_calls: false });
    }
};

export const updateSystemSettings = async (req, res) => {
    try {
        const settings = req.body; // { key: value, key2: value2 }

        const updates = Object.entries(settings).map(([key, value]) => {
            return prisma.systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value), category: 'GENERAL' }
            });
        });

        await Promise.all(updates);

        // Administrator Action Log
        await prisma.adminLog.create({
            data: {
                admin_id: req.user.user_id,
                action: 'UPDATE_SETTINGS',
                target_type: 'SYSTEM',
                details: settings
            }
        });

        res.json({ message: "Paramètres mis à jour" });
    } catch (error) {
        console.error("Update Settings Error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};



// --- ADMIN MESSAGING SYSTEM ---

// Get conversation with another admin or list of all messages
export const getAdminMessages = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { targetId } = req.query;

        if (targetId) {
            // Get conversation with specific user
            const messages = await prisma.adminMessage.findMany({
                where: {
                    OR: [
                        { sender_id: userId, receiver_id: parseInt(targetId) },
                        { sender_id: parseInt(targetId), receiver_id: userId }
                    ]
                },
                orderBy: { created_at: 'asc' },
                include: {
                    sender: { select: { user_id: true, email: true, role: true, workerProfile: { select: { first_name: true, last_name: true } }, establishmentProfile: { select: { name: true } } } },
                    receiver: { select: { user_id: true, email: true, role: true, workerProfile: { select: { first_name: true, last_name: true } }, establishmentProfile: { select: { name: true } } } }
                }
            });
            res.json(messages);
        } else {
            // Get list of unique conversations (latest message per contact)
            // Simplified: Fetch all recent messages and aggregate in memory (efficient enough for admin volume)
            const messages = await prisma.adminMessage.findMany({
                where: {
                    OR: [
                        { sender_id: userId },
                        { receiver_id: userId }
                    ]
                },
                orderBy: { created_at: 'desc' },
                include: {
                    sender: { select: { user_id: true, email: true, role: true, workerProfile: { select: { first_name: true, last_name: true } }, establishmentProfile: { select: { name: true } } } },
                    receiver: { select: { user_id: true, email: true, role: true, workerProfile: { select: { first_name: true, last_name: true } }, establishmentProfile: { select: { name: true } } } }
                }
            });
            res.json(messages);
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

export const sendAdminMessage = async (req, res) => {
    try {
        const senderId = req.user.user_id;
        const { receiverId, content } = req.body;

        if (!content || !receiverId) {
            return res.status(400).json({ error: "Missing receiver or content" });
        }

        const message = await prisma.adminMessage.create({
            data: {
                sender_id: senderId,
                receiver_id: parseInt(receiverId),
                content: content
            },
            include: {
                sender: { select: { user_id: true, email: true } }
            }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Failed to send message" });
    }
};

export const markMessageRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        const message = await prisma.adminMessage.updateMany({
            where: {
                message_id: parseInt(id),
                receiver_id: userId // Only receiver can mark as read
            },
            data: { is_read: true }
        });

        res.json({ success: true, count: message.count });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark as read" });
    }
};

export const markConversationRead = async (req, res) => {
    try {
        // Mark all messages from specific sender as read
        const userId = req.user.user_id;
        const { senderId } = req.body;

        await prisma.adminMessage.updateMany({
            where: {
                receiver_id: userId,
                sender_id: parseInt(senderId),
                is_read: false
            },
            data: { is_read: true }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to mark conversation read" });
    }
};

/**
 * Public endpoint for UI Features (no authentication required)
 * Used by frontend to check if dark mode and language switcher are enabled
 */
export const getUIFeatures = async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['ui_dark_mode_enabled', 'ui_language_switch_enabled'] }
            }
        });

        // Default: all features enabled
        const features = {
            dark_mode_enabled: true,
            language_switch_enabled: true
        };

        settings.forEach(s => {
            if (s.key === 'ui_dark_mode_enabled') features.dark_mode_enabled = s.value === 'true';
            if (s.key === 'ui_language_switch_enabled') features.language_switch_enabled = s.value === 'true';
        });

        res.json(features);
    } catch (error) {
        console.error("Get UI Features Error:", error);
        // Return defaults (enabled) on error
        res.json({ dark_mode_enabled: true, language_switch_enabled: true });
    }
};

/**
 * MISSION VALIDATION
 */

// Get Missions for Admin (with filtering and stats)
export const getAdminMissions = async (req, res) => {
    try {
        const { status = 'all', page = 1, limit = 10, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter
        const where = {};
        if (status !== 'all') {
            let dbStatus = status.toUpperCase();
            if (dbStatus === 'APPROVED') dbStatus = 'OPEN'; // Map frontend APPROVED to backend OPEN
            where.status = dbStatus;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { establishment: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Fetch missions
        const missions = await prisma.mission.findMany({
            where,
            include: {
                establishment: {
                    select: {
                        user_id: true,
                        name: true,
                        logo_url: true,
                        city: { select: { name: true } }
                    }
                },
                city: { select: { name: true } }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: parseInt(limit)
        });

        // Calculate stats
        const [pending, approved, rejected, total] = await Promise.all([
            prisma.mission.count({ where: { status: 'PENDING' } }),
            prisma.mission.count({ where: { status: 'OPEN' } }), // Validated = OPEN
            prisma.mission.count({ where: { status: 'REJECTED' } }),
            prisma.mission.count()
        ]);

        // Format response
        const formattedMissions = missions.map(m => ({
            id: m.mission_id,
            title: m.title,
            category: m.sector || 'Non spécifié',
            establishment_name: m.establishment.name,
            establishment_logo: m.establishment.logo_url,
            location: m.city.name,
            start_date: new Date(m.start_date).toLocaleDateString('fr-FR'),
            end_date: new Date(m.end_date).toLocaleDateString('fr-FR'),
            salary: m.budget ? `${m.budget}` : (m.salary_min ? `${m.salary_min}${m.salary_max ? '-' + m.salary_max : ''}` : 'Non spécifié'),
            description: m.description,
            status: m.status === 'OPEN' ? 'APPROVED' : m.status,
            created_at: m.created_at,
            // Enhanced details
            contract_type: m.contract_type,
            work_mode: m.work_mode,
            experience_level: m.experience_level,
            is_urgent: m.is_urgent,
            benefits: m.benefits || [],
            skills: m.skills || [],
            positions_count: m.positions_count,
            application_deadline: m.application_deadline ? new Date(m.application_deadline).toLocaleDateString('fr-FR') : null,
            start_date_raw: m.start_date,
            end_date_raw: m.end_date,
            salary_min: m.salary_min,
            salary_max: m.salary_max,
            budget: m.budget
        }));

        res.json({
            items: formattedMissions,
            stats: {
                pending,
                approved,
                rejected,
                all: total
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: await prisma.mission.count({ where })
            }
        });

    } catch (error) {
        console.error("Get Admin Missions Error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Review Mission (Approve/Reject)
export const reviewMission = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body; // status: 'APPROVED' | 'REJECTED'
        const adminId = req.user.user_id;

        const missionId = parseInt(id);

        // Map frontend status to backend enum
        let newStatus;
        let notificationMessage;
        let notificationType;

        if (status === 'APPROVED') {
            newStatus = 'OPEN';
            notificationMessage = "Votre mission a été validée et publiée avec succès.";
            notificationType = 'SUCCESS';
        } else if (status === 'REJECTED') {
            newStatus = 'REJECTED';
            notificationMessage = `Votre mission a été rejetée. Motif : ${reason || 'Non spécifié'}`;
            notificationType = 'WARNING';
        } else {
            return res.status(400).json({ message: "Statut invalide" });
        }

        // Update Mission
        const mission = await prisma.mission.update({
            where: { mission_id: missionId },
            data: {
                status: newStatus,
                published_at: newStatus === 'OPEN' ? new Date() : null
            },
            include: { establishment: true }
        });

        // Log Admin Action
        await prisma.adminLog.create({
            data: {
                admin_id: adminId,
                action: status === 'APPROVED' ? 'VALIDATE_MISSION' : 'REJECT_MISSION',
                target_type: 'MISSION',
                target_id: missionId.toString(),
                details: { status: newStatus, reason }
            }
        });

        // Notify Establishment
        await createNotification({
            userId: mission.establishment_id,
            type: notificationType,
            message: notificationMessage,
            link: `/establishment/missions`
        });

        res.json({
            message: "Mission mise à jour",
            status: status
        });

    } catch (error) {
        console.error("Review Mission Error:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

/**
 * DISPUTE MANAGEMENT
 */

// Get All Disputes (Admin/Super Admin)
export const getDisputes = async (req, res) => {
    try {
        const { status = 'all', page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status !== 'all') {
            where.status = status.toUpperCase();
        }

        const disputes = await prisma.dispute.findMany({
            where,
            include: {
                reporter: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        role: true,
                        avatar: true
                    }
                },
                target: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        role: true,
                        avatar: true
                    }
                },
                mission: {
                    select: {
                        mission_id: true,
                        title: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: parseInt(limit)
        });

        // Calculate stats
        const [open, inProgress, resolved, total] = await Promise.all([
            prisma.dispute.count({ where: { status: 'OPEN' } }),
            prisma.dispute.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.dispute.count({ where: { status: 'RESOLVED' } }),
            prisma.dispute.count()
        ]);

        res.json({
            items: disputes.map(d => ({
                id: d.dispute_id,
                status: d.status,
                type: d.type,
                description: d.description,
                resolution: d.resolution,
                created_at: d.created_at,
                reporter: {
                    id: d.reporter.user_id,
                    name: `${d.reporter.first_name} ${d.reporter.last_name}`,
                    role: d.reporter.role,
                    email: d.reporter.email
                },
                target: {
                    id: d.target.user_id,
                    name: `${d.target.first_name} ${d.target.last_name}`,
                    role: d.target.role,
                    email: d.target.email
                },
                mission: d.mission ? {
                    id: d.mission.mission_id,
                    title: d.mission.title
                } : null
            })),
            stats: {
                open,
                in_progress: inProgress,
                resolved,
                total
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: await prisma.dispute.count({ where })
            }
        });

    } catch (error) {
        console.error("Get Disputes Error:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des litiges" });
    }
};

// Resolve Dispute
export const resolveDispute = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution } = req.body; // status: RESOLVED, DISMISSED, IN_PROGRESS
        const adminId = req.user.user_id;

        const currentDispute = await prisma.dispute.findUnique({ where: { dispute_id: parseInt(id) } });
        if (!currentDispute) return res.status(404).json({ message: "Litige introuvable" });

        const updatedDispute = await prisma.dispute.update({
            where: { dispute_id: parseInt(id) },
            data: {
                status,
                resolution,
                updated_at: new Date()
            }
        });

        // Admin Log
        await prisma.adminLog.create({
            data: {
                admin_id: adminId,
                action: 'RESOLVE_DISPUTE',
                target_type: 'DISPUTE',
                target_id: id.toString(),
                details: { status, resolution }
            }
        });

        res.json({ success: true, dispute: updatedDispute });

    } catch (error) {
        console.error("Resolve Dispute Error:", error);
        res.status(500).json({ message: "Erreur lors de la résolution du litige" });
    }
};
