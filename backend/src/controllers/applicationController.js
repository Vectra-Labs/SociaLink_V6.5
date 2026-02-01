import { prisma } from "../config/db.js";
import { sendApplicationReceivedEmail, sendApplicationStatusEmail } from "../utils/emailService.js";
import { createNotification } from "../services/notificationService.js";

//----------------------------- Apply to Mission -----------------------------//
export const applyToMission = async (req, res) => {
    try {
        const userId = req.user.user_id; // Worker ID
        const { mission_id } = req.body;

        // Check verification?
        const worker = await prisma.workerProfile.findUnique({ where: { user_id: userId } });
        if (worker.verification_status !== 'VERIFIED') {
            return res.status(403).json({ message: "You must be verified to apply." });
        }

        // Check duplicates
        const existing = await prisma.application.findFirst({
            where: {
                worker_profile_id: userId,
                mission_id: parseInt(mission_id)
            }
        });
        if (existing) {
            return res.status(400).json({ message: "You have already applied to this mission." });
        }

        // 2. Check Limits (Dynamic from DB)
        const subscription = await prisma.subscription.findUnique({
            where: { user_id: userId },
            include: { plan: true }
        });

        let maxApps = null;

        if (subscription && subscription.status === 'ACTIVE') {
            maxApps = subscription.plan.max_active_applications;
        } else {
            // Fallback to BASIC
            const basicPlan = await prisma.subscriptionPlanConfig.findUnique({
                where: {
                    code_target_role: {
                        code: 'BASIC',
                        target_role: 'WORKER'
                    }
                }
            });
            if (basicPlan) maxApps = basicPlan.max_active_applications;
        }

        if (maxApps !== null) {
            const activeApps = await prisma.application.count({
                where: {
                    worker_profile_id: userId,
                    status: { in: ['PENDING', 'ACCEPTED'] },
                    // Ensure we don't count completed missions if needed, roughly implied by app status usually
                    // But usually if mission is closed, app might still be accepted. 
                    // Let's stick to active app statuses.
                }
            });

            if (activeApps >= maxApps) {
                return res.status(403).json({
                    message: `Limite de candidatures atteinte (${activeApps}/${maxApps}). Passez Premium pour postuler plus.`,
                    code: 'LIMIT_REACHED'
                });
            }
        }

        const application = await prisma.application.create({
            data: {
                worker_profile_id: userId,
                mission_id: parseInt(mission_id),
                status: "PENDING"
            },
            include: {
                mission: {
                    include: {
                        establishment: {
                            include: {
                                user: { select: { email: true } }
                            }
                        }
                    }
                }
            }
        });

        // Send email notification to establishment
        try {
            const workerName = `${worker.first_name || ''} ${worker.last_name || ''}`.trim() || 'Un candidat';
            const missionTitle = application.mission.title;
            const establishmentEmail = application.mission.establishment.user?.email;

            if (establishmentEmail) {
                await sendApplicationReceivedEmail(establishmentEmail, workerName, missionTitle);
            }

            // [NEW] In-App Notification for Establishment
            const establishmentId = application.mission.establishment_id; // Need to ensure this is fetched or accessible
            // Note: In create data, we might not have establishment_id returned directly if not selected, 
            // but we joined mission.establishment. Let's rely on mission fetch or establishment fetch.
            // Actually, `application.mission.establishment.user.user_id` should be the target.
            // Wait, establishment model handles user_id as PK often in this schema style, or via relation.
            // Let's check `application.mission.establishment` relation. 
            // Better to use `application.mission.establishment_id` if available.
            // In the `include`, we have `mission: { include: { establishment: ... } }`.

            // To be safe and correct:
            if (application.mission && application.mission.establishment_id) {
                if (application.mission && application.mission.establishment_id) {
                    await createNotification({
                        userId: application.mission.establishment_id,
                        type: 'INFO',
                        message: `Nouvelle candidature de ${workerName} pour la mission "${missionTitle}"`,
                        link: '/establishment/applications'
                    });
                }
            }
        } catch (emailErr) {
            console.error("Failed to send application notification email:", emailErr);
            // Don't fail the request if email fails
        }

        res.status(201).json({ message: "Applied successfully", data: application });
    } catch (error) {
        console.error("APPLY ERROR:", error);
        res.status(500).json({ message: "Failed to apply" });
    }
};

//----------------------------- Get My Applications (Worker) -----------------------------//
export const getMyApplications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const applications = await prisma.application.findMany({
            where: { worker_profile_id: userId },
            include: {
                mission: {
                    select: {
                        title: true,
                        status: true,
                        establishment: { select: { name: true } }
                    }
                }
            }
        });
        res.status(200).json({ data: applications });
    } catch (error) {
        console.error("GET MY APPLICATIONS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};

//----------------------------- Get Received Applications (Establishment) -----------------------------//
export const getReceivedApplications = async (req, res) => {
    try {
        const userId = req.user.user_id; // Establishment ID

        // Get all missions of this establishment
        // Then get applications for those missions
        const applications = await prisma.application.findMany({
            where: {
                mission: {
                    establishment_id: userId
                }
            },
            include: {
                worker: {
                    select: {
                        first_name: true,
                        last_name: true,
                        profile_pic_url: true,
                        user_id: true
                    }
                },
                mission: {
                    select: {
                        title: true,
                        mission_id: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({ data: applications });
    } catch (error) {
        console.error("GET RECEIVED APPLICATIONS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
    }
};

//----------------------------- Update Application Status -----------------------------//
export const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params; // Application ID
        const { status } = req.body; // ACCEPTED or REJECTED
        const userId = req.user.user_id; // Establishment ID (security check)

        const application = await prisma.application.findUnique({
            where: { application_id: parseInt(id) },
            include: {
                mission: {
                    include: {
                        establishment: { select: { name: true } }
                    }
                },
                worker: {
                    include: {
                        user: { select: { email: true } }
                    }
                }
            }
        });

        if (!application) return res.status(404).json({ message: "Application not found" });

        // Security: Ensure mission belongs to this establishment
        if (application.mission.establishment_id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updated = await prisma.application.update({
            where: { application_id: parseInt(id) },
            data: { status }
        });

        // Send email notification to worker
        try {
            const workerEmail = application.worker.user?.email;
            const missionTitle = application.mission.title;
            const establishmentName = application.mission.establishment?.name || 'Établissement';

            if (workerEmail && (status === 'ACCEPTED' || status === 'REJECTED')) {
                await sendApplicationStatusEmail(workerEmail, status, missionTitle, establishmentName);
            }

            // [NEW] In-App Notification for Worker
            const workerId = application.worker_profile_id;
            let notifMessage = '';
            let notifType = 'APPLICATION_UPDATE';

            if (status === 'ACCEPTED') {
                notifMessage = `Félicitations ! Votre candidature pour "${missionTitle}" chez ${establishmentName} a été acceptée.`;
                notifType = 'SUCCESS';
            } else if (status === 'REJECTED') {
                notifMessage = `Votre candidature pour "${missionTitle}" chez ${establishmentName} n'a pas été retenue.`;
                notifType = 'WARNING'; // or INFO
            }

            if (notifMessage) {
                if (notifMessage) {
                    await createNotification({
                        userId: workerId,
                        type: notifType,
                        message: notifMessage,
                        link: '/worker/missions'
                    });
                }
            }
        } catch (emailErr) {
            console.error("Failed to send application status email:", emailErr);
            // Don't fail the request if email fails
        }

        res.status(200).json({ message: "Status updated", data: updated });
    } catch (error) {
        console.error("UPDATE APPLICATION STATUS ERROR:", error);
        res.status(500).json({ message: "Failed to update status" });
    }
};

//----------------------------- Get Accepted Worker for Mission -----------------------------//
export const getAcceptedWorker = async (req, res) => {
    try {
        const { missionId } = req.params;
        const application = await prisma.application.findFirst({
            where: {
                mission_id: parseInt(missionId),
                status: "ACCEPTED"
            },
            select: { worker_profile_id: true }
        });

        if (!application) return res.json({ worker_id: null });
        res.json({ worker_id: application.worker_profile_id });
    } catch (error) {
        console.error("GET ACCEPTED WORKER ERROR:", error);
        res.status(500).json({ message: "Failed to fetch worker" });
    }
};

//----------------------------- Worker Responds to Proposition (Accept/Decline) -----------------------------//
export const respondToProposition = async (req, res) => {
    try {
        const { id } = req.params; // Application ID
        const { status } = req.body; // ACCEPTED or DECLINED
        const userId = req.user.user_id; // Worker ID

        if (!['ACCEPTED', 'DECLINED'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use ACCEPTED or DECLINED." });
        }

        const application = await prisma.application.findUnique({
            where: { application_id: parseInt(id) },
            include: { mission: true }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Security: Ensure this application belongs to this worker
        if (application.worker_profile_id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Can only respond to PROPOSED applications (Invitations)
        if (application.status !== 'PROPOSED') {
            return res.status(400).json({ message: "This is not a valid proposition or has already been processed" });
        }

        const updated = await prisma.application.update({
            where: { application_id: parseInt(id) },
            data: { status: status === 'DECLINED' ? 'REJECTED' : status }
        });

        // [NEW] Notify Establishment of worker response
        const establishmentId = application.mission.establishment_id;
        const workerName = `${req.user.first_name || 'Un candidat'} ${req.user.last_name || ''}`; // Req user is worker
        // Need to ensure we have mission details, included above
        const missionTitle = application.mission.title;

        await createNotification({
            userId: establishmentId,
            type: 'INFO',
            message: `${workerName} a ${status === 'ACCEPTED' ? 'accepté' : 'décliné'} votre proposition pour "${missionTitle}".`,
            link: '/establishment/applications'
        });

        res.status(200).json({
            message: status === 'ACCEPTED' ? "Proposition acceptée" : "Proposition déclinée",
            data: updated
        });
    } catch (error) {
        console.error("RESPOND TO PROPOSITION ERROR:", error);
        res.status(500).json({ message: "Failed to respond to proposition" });
    }
};

//----------------------------- Worker Withdraws Application -----------------------------//
export const withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params; // Application ID
        const userId = req.user.user_id; // Worker ID

        const application = await prisma.application.findUnique({
            where: { application_id: parseInt(id) }
        });

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Security: Ensure this application belongs to this worker
        if (application.worker_profile_id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Can only withdraw pending applications
        if (application.status !== 'PENDING') {
            return res.status(400).json({ message: "Cannot withdraw a processed application" });
        }

        await prisma.application.delete({
            where: { application_id: parseInt(id) }
        });

        res.status(200).json({ message: "Candidature retirée avec succès" });
    } catch (error) {
        console.error("WITHDRAW APPLICATION ERROR:", error);
        res.status(500).json({ message: "Failed to withdraw application" });
    }
};

//----------------------------- Invite Worker (Establishment) -----------------------------//
export const inviteWorker = async (req, res) => {
    try {
        const establishmentId = req.user.user_id;
        const { worker_id, mission_id } = req.body;

        // 1. Verify establishment owns the mission
        const mission = await prisma.mission.findUnique({
            where: { mission_id: parseInt(mission_id) },
        });

        if (!mission) return res.status(404).json({ message: "Mission not found" });
        if (mission.establishment_id !== establishmentId) {
            return res.status(403).json({ message: "Unauthorized mission access" });
        }
        if (mission.status !== 'OPEN') {
            return res.status(400).json({ message: "Mission is not open for invitations" });
        }

        // 2. Check duplicates
        const existing = await prisma.application.findFirst({
            where: {
                worker_profile_id: parseInt(worker_id),
                mission_id: parseInt(mission_id)
            }
        });

        if (existing) {
            return res.status(400).json({ message: "Application or invitation already exists" });
        }

        // 3. Create Invitation (Application with status PROPOSED)
        const invitation = await prisma.application.create({
            data: {
                worker_profile_id: parseInt(worker_id),
                mission_id: parseInt(mission_id),
                status: "PROPOSED"
            },
            include: {
                worker: { include: { user: { select: { email: true } } } },
                mission: { include: { establishment: { select: { name: true } } } }
            }
        });

        // 4. Send Email (Mocked/TODO)
        // await sendInvitationEmail(...);

        // [NEW] In-App Notification for Worker
        const establishmentName = invitation.mission.establishment.name; // fetched via include
        const missionTitle = invitation.mission.title;

        await createNotification({
            userId: parseInt(worker_id),
            type: 'MISSION_INVITE',
            message: `${establishmentName} vous invite à postuler à la mission "${missionTitle}"`,
            link: '/worker/missions'
        });

        res.status(201).json({ message: "Invitation sent successfully", data: invitation });

    } catch (error) {
        console.error("INVITE ERROR:", error);
        res.status(500).json({ message: "Failed to invite worker" });
    }
};
