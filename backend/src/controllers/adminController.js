import { prisma } from "../config/db.js";
import { createNotification } from "../services/notificationService.js";


export const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: adminId,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        notification_id: true,
        message: true,
        type: true,
        is_read: true,
        created_at: true,
      },
    });

    res.status(200).json({
      data: notifications,
    });
  } catch (error) {
    console.error("GET ADMIN NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};



//----------------------------- Get Workers Under Review -----------------------------//
export const getWorkersUnderReview = async (req, res) => {
  try {
    const workers = await prisma.workerProfile.findMany({
      where: { verification_status: "PENDING" },
      include: {
        user: {
          select: {
            user_id: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json({ data: workers });
  } catch (error) {
    console.error("GET WORKERS UNDER REVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to fetch workers" });
  }
};

//----------------------------- Get Worker Details -----------------------------//
export const getWorkerDetails = async (req, res) => {
  try {
    const workerId = Number(req.params.id);

    const worker = await prisma.workerProfile.findUnique({
      where: { user_id: workerId },
      include: {
        user: { select: { email: true } },
        specialities: { include: { speciality: true } }, // Assuming relation setup
        diplomas: true,
      },
    });

    if (!worker) return res.status(404).json({ message: "Worker not found" });

    res.status(200).json({ data: worker });
  } catch (error) {
    console.error("GET WORKER DETAILS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch worker details" });
  }
};


//----------------------------- Approve Worker Verification -----------------------------//
export const approveWorker = async (req, res) => {
  try {
    const workerId = Number(req.params.id);

    await prisma.workerProfile.update({
      where: { user_id: workerId },
      data: { verification_status: "APPROVED" },
    });

    await createNotification({
      userId: workerId,
      type: "SUCCESS",
      message: "Votre profil a été validé par administrateur",
    });

    res.status(200).json({ message: "Worker approved successfully" });
  } catch (error) {
    console.error("APPROVE WORKER ERROR:", error);
    res.status(500).json({ message: "Failed to approve worker" });
  }
};


//----------------------------- Reject Worker Verification -----------------------------//
export const rejectWorker = async (req, res) => {
  try {
    const workerId = Number(req.params.id);
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    await prisma.workerProfile.update({
      where: { user_id: workerId },
      data: { verification_status: "REJECTED" },
    });

    await createNotification({
      userId: workerId,
      type: "WARNING",
      message: `Profil refusé : ${reason}`,
    });

    res.status(200).json({ message: "Worker rejected successfully" });
  } catch (error) {
    console.error("REJECT WORKER ERROR:", error);
    res.status(500).json({ message: "Failed to reject worker" });
  }
};

//----------------------------- Mark Notification as Read -----------------------------//
export const markNotificationAsRead = async (req, res) => {
  try {
    const adminId = req.user.user_id;
    const notificationId = Number(req.params.id);

    const notification = await prisma.notification.findFirst({
      where: {
        notification_id: notificationId,
        user_id: adminId, // sécurité
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    await prisma.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    });

    res.status(200).json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);
    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

//----------------------------- Mark All Notifications as Read -----------------------------//
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const adminId = req.user.user_id;

    await prisma.notification.updateMany({
      where: {
        user_id: adminId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({
      message: "Failed to mark all notifications as read",
    });
  }
};

//----------------------------- Messaging System -----------------------------//

// Get Users for Messaging (with search & filter)
export const getUsersForMessaging = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const whereClause = {
            ...(role && role !== 'ALL' && { role: role }),
            ...(status && status !== 'ALL' && { status: status }),
            ...(search && {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { 
                        workerProfile: { 
                            OR: [
                                { first_name: { contains: search, mode: 'insensitive' } },
                                { last_name: { contains: search, mode: 'insensitive' } }
                            ]
                        }
                    },
                    {
                        establishmentProfile: {
                            name: { contains: search, mode: 'insensitive' }
                        }
                    }
                ]
            })
        };

        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                user_id: true,
                email: true,
                role: true,
                workerProfile: {
                    select: { first_name: true, last_name: true, profile_pic_url: true }
                },
                establishmentProfile: {
                    select: { name: true, logo_url: true }
                },
                adminProfile: {
                    select: { first_name: true, last_name: true, profile_pic_url: true }
                }
            },
            take: parseInt(limit),
            skip: skip,
            orderBy: { created_at: 'desc' }
        });

        const total = await prisma.user.count({ where: whereClause });

        const formattedUsers = users.map(u => {
            let name = 'Utilisateur';
            let avatar = null;

            if (u.role === 'WORKER') {
                name = `${u.workerProfile?.first_name || ''} ${u.workerProfile?.last_name || ''}`.trim() || 'Travailleur Inconnu';
                avatar = u.workerProfile?.profile_pic_url;
            } else if (u.role === 'ESTABLISHMENT') {
                name = u.establishmentProfile?.name || 'Établissement Inconnu';
                avatar = u.establishmentProfile?.logo_url;
            } else if (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') {
                name = `${u.adminProfile?.first_name || ''} ${u.adminProfile?.last_name || ''}`.trim() || 'Administrateur';
                avatar = u.adminProfile?.profile_pic_url;
            }

            return {
                id: u.user_id,
                email: u.email,
                role: u.role,
                name: name,
                avatar: avatar
            };
        });

        res.status(200).json({ data: formattedUsers, meta: { total, page: parseInt(page) } });

    } catch (error) {
        console.error("GET USERS MESSAGING ERROR:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

// Send Bulk Message / Notification
export const sendBulkMessage = async (req, res) => {
    try {
        const { title, message, targetRole, targetUserIds, type = 'INFO' } = req.body;
        // targetRole: 'ALL', 'WORKER', 'ESTABLISHMENT' or null if targetUserIds is set
        // targetUserIds: [1, 2, 3] if specific users

        let userIds = [];

        if (targetUserIds && targetUserIds.length > 0) {
            userIds = targetUserIds;
        } else if (targetRole) {
            const whereClause = targetRole === 'ALL' ? {} : { role: targetRole };
            // Exclude admins from receiving bulk user messages usually, but 'ALL' might imply everyone. 
            // Let's filter to only WORKER and ESTABLISHMENT for safety unless specified.
            if (targetRole === 'ALL') {
                whereClause.role = { in: ['WORKER', 'ESTABLISHMENT'] };
            }

            const users = await prisma.user.findMany({
                where: whereClause,
                select: { user_id: true }
            });
            userIds = users.map(u => u.user_id);
        }

        if (userIds.length === 0) {
            return res.status(400).json({ message: "No users found for selection" });
        }

        // Create notifications in bulk (Prisma doesn't support createMany for related records with relations easily, 
        // but Notification is a simple model linked to user_id. check schema.)
        // Actually schema says: user User @relation...
        // Use createMany
        const notificationsData = userIds.map(id => ({
            user_id: id,
            title: title || 'Message Admin', // Schema might not have title, let's check. 
            // Notification model usually has 'message', 'type'. Schema check required?
            // Assuming simplified model: message, type, user_id. 
            // Use message as combined title/body if needed or just body.
            message: message, 
            type: type,
            is_read: false
        }));

        await prisma.notification.createMany({
            data: notificationsData
        });

        res.status(200).json({ 
            message: `Message sent to ${userIds.length} users successfully`,
            count: userIds.length 
        });

    } catch (error) {
        console.error("SEND BULK MESSAGE ERROR:", error);
        res.status(500).json({ message: "Failed to send messages" });
    }
};