import { prisma } from "../config/db.js";
import { createNotification } from "../services/notificationService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//----------------------------- Get Worker Profile -----------------------------//
export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const workerProfile = await prisma.workerProfile.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            email: true,
            status: true,
            role: true,
          }
        },
        city: true,
        specialities: {
          include: {
            speciality: true
          }
        },
        diplomas: true,
        experiences: true,
        languages: true,
        documents: true,
        // We might want to add subscription status here if needed, 
        // but it's usually handled by a separate context/endpoint
      }
    });

    if (!workerProfile) {
      return res.status(404).json({
        message: "Profile not found"
      });
    }

    res.status(200).json({
      data: workerProfile
    });

  } catch (error) {
    console.error("GET WORKER PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch profile"
    });
  }
};

//----------------------------- Get Single Worker Profile by ID (for Establishments) -----------------------------//
export const getWorkerById = async (req, res) => {
  try {
    const { id } = req.params;
    const establishmentId = req.user.user_id;

    // Check if user is establishment
    if (req.user.role !== 'ESTABLISHMENT') {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch subscription to check access level
    const establishment = await prisma.user.findUnique({
      where: { user_id: establishmentId },
      include: { subscription: { include: { plan: true } } }
    });

    const isSubscriber = establishment?.subscription?.status === 'ACTIVE' &&
      ['PRO', 'PREMIUM'].includes(establishment.subscription.plan.code);

    // Fetch worker profile
    const worker = await prisma.workerProfile.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        user: { select: { email: isSubscriber ? true : false, status: true } }, // Hide email if not sub
        city: true,
        specialities: {
          include: { speciality: true }
        },
        diplomas: true,
        experiences: { orderBy: { start_date: 'desc' } },
        documents: { where: { status: 'VERIFIED' } } // Only verified docs
      }
    });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Add Profile View
    try {
      // Basic view tracking logic if needed
      // await prisma.profileView.create(...)
    } catch (err) { }

    res.status(200).json({ data: worker, isSubscriber });

  } catch (error) {
    console.error("GET WORKER BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch worker profile" });
  }
};

//----------------------------- Update Worker Profile -----------------------------//
export const updateWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const dataToUpdate = { ...req.body };

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, "../../uploads/avatars");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Base URL for manually served files (adjust PORT if needed or use relative)
    // Using relative path assuming frontend proxies /uploads or backend serves it at root
    const baseUrl = `${process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace('5173', '5001').replace('5174', '5001') : 'http://localhost:5001'}/uploads/avatars`;

    // Upload photo if exists
    if (req.files?.photo?.[0]) {
      const photoFile = req.files.photo[0];
      const fileName = `worker_${userId}_avatar_${Date.now()}.png`; // Force PNG or derive ext
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, photoFile.buffer);

      dataToUpdate.profile_pic_url = `${baseUrl}/${fileName}`;
    }

    // Upload banner if exists
    if (req.files?.banner?.[0]) {
      const bannerFile = req.files.banner[0];
      const fileName = `worker_${userId}_banner_${Date.now()}.png`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, bannerFile.buffer);

      dataToUpdate.banner_url = `${baseUrl}/${fileName}`;
    }

    const updatedProfile = await prisma.workerProfile.update({
      where: { user_id: userId },
      data: dataToUpdate,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};


//----------------------------- Add Worker Specialities -----------------------------//
export const addWorkerSpecialities = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { speciality_ids } = req.body;

    //  Vérifier que les spécialités existent
    const existingSpecialities = await prisma.speciality.findMany({
      where: {
        speciality_id: { in: speciality_ids },
      },
      select: { speciality_id: true },
    });

    if (existingSpecialities.length !== speciality_ids.length) {
      return res.status(400).json({
        message: "One or more specialities do not exist",
      });
    }

    //  Éviter les doublons (déjà associées)
    const alreadyLinked = await prisma.workerSpeciality.findMany({
      where: {
        user_id: userId,
        speciality_id: { in: speciality_ids },
      },
      select: { speciality_id: true },
    });

    const alreadyLinkedIds = alreadyLinked.map(
      (item) => item.speciality_id
    );

    const newSpecialities = speciality_ids.filter(
      (id) => !alreadyLinkedIds.includes(id)
    );

    if (newSpecialities.length === 0) {
      return res.status(200).json({
        message: "Specialities already added",
      });
    }

    //  Créer les relations
    await prisma.workerSpeciality.createMany({
      data: newSpecialities.map((specialityId) => ({
        user_id: userId,
        speciality_id: specialityId,
      })),
    });

    res.status(201).json({
      message: "Specialities added successfully",
      added_specialities: newSpecialities,
    });
  } catch (error) {
    console.error("ADD WORKER SPECIALITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to add specialities",
    });
  }
};

//----------------------------- Get Worker Specialities -----------------------------//
export const getWorkerSpecialities = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const workerSpecialities = await prisma.workerSpeciality.findMany({
      where: {
        user_id: userId,
      },
      include: {
        speciality: {
          select: {
            speciality_id: true,
            name: true,
          },
        },
      },
    });

    // Format response to return only speciality details
    const specialities = workerSpecialities.map((item) => ({
      speciality_id: item.speciality.speciality_id,
      name: item.speciality.name,
    }));

    res.status(200).json({
      data: specialities,
    });
  } catch (error) {
    console.error("GET WORKER SPECIALITIES ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch worker specialities",
    });
  }
};


//----------------------------- Remove Worker Speciality -----------------------------//
export const removeWorkerSpeciality = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const specialityId = Number(req.params.id);

    if (isNaN(specialityId)) {
      return res.status(400).json({
        message: "Invalid speciality id",
      });
    }

    // Vérifier si la relation existe
    const existing = await prisma.workerSpeciality.findUnique({
      where: {
        user_id_speciality_id: {
          user_id: userId,
          speciality_id: specialityId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Speciality not found for this worker",
      });
    }

    // Supprimer la relation
    await prisma.workerSpeciality.delete({
      where: {
        user_id_speciality_id: {
          user_id: userId,
          speciality_id: specialityId,
        },
      },
    });

    res.status(200).json({
      message: "Speciality removed successfully",
    });
  } catch (error) {
    console.error("REMOVE WORKER SPECIALITY ERROR:", error);
    res.status(500).json({
      message: "Failed to remove speciality",
    });
  }
};

//----------------------------- Submit Worker Profile for Review -----------------------------//
export const submitWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    //  Vérifier le profil worker
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { user_id: userId },
      include: {
        diplomas: true,
        specialities: true,
      },
    });

    if (!workerProfile) {
      return res.status(404).json({
        message: "Worker profile not found",
      });
    }

    //  Empêcher double soumission
    if (workerProfile.verification_status !== "PENDING") {
      return res.status(400).json({
        message: "Profile already submitted or reviewed",
      });
    }

    //  Vérifications métier minimales
    if (workerProfile.specialities.length === 0) {
      return res.status(400).json({
        message: "At least one speciality is required",
      });
    }

    if (workerProfile.diplomas.length === 0) {
      return res.status(400).json({
        message: "At least one diploma is required",
      });
    }

    //  Trouver un ADMIN 
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { user_id: true },
    });
    if (!admin) {
      return res.status(500).json({
        message: "No admin found to notify",
      });
    }

    // Update profile status
    await prisma.workerProfile.update({
      where: { user_id: userId },
      data: {
        verification_status: "UNDER_REVIEW",
      },
    });

    // Notify Admin via Service (DB + Socket)
    await createNotification({
      userId: admin.user_id,
      type: "INFO",
      message: "Un nouveau travailleur a soumis son profil pour validation",
      link: `/admin/verification/workers/${userId}`
    });

    res.status(200).json({
      message: "Profile submitted successfully. Awaiting admin review.",
    });
  } catch (error) {
    console.error("SUBMIT WORKER PROFILE ERROR:", error);
    res.status(500).json({
      message: "Failed to submit worker profile",
    });
  }
};

//----------------------------- Experience Management -----------------------------//

export const getExperiences = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const experiences = await prisma.experience.findMany({
      where: { user_id: userId },
      orderBy: { start_date: 'desc' }
    });

    res.status(200).json({
      message: "Experiences fetched successfully",
      data: experiences
    });
  } catch (error) {
    console.error("GET EXPERIENCES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch experiences" });
  }
};

export const addExperience = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { title, company, location, start_date, end_date, description, current } = req.body;

    const experience = await prisma.experience.create({
      data: {
        job_title: title,
        establishment_name: company,
        description,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        is_current_role: current || false,
        user_id: userId
      }
    });

    res.status(201).json({ message: "Experience added", data: experience });
  } catch (error) {
    console.error("ADD EXPERIENCE ERROR:", error);
    res.status(500).json({ message: "Failed to add experience" });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const experienceId = parseInt(req.params.id);

    // Verify ownership
    const experience = await prisma.experience.findFirst({
      where: {
        experience_id: experienceId,
        user_id: userId
      }
    });

    if (!experience) {
      return res.status(404).json({ message: "Experience not found or unauthorized" });
    }

    await prisma.experience.delete({
      where: { experience_id: experienceId }
    });

    res.status(200).json({ message: "Experience deleted" });
  } catch (error) {
    console.error("DELETE EXPERIENCE ERROR:", error);
    res.status(500).json({ message: "Failed to delete experience" });
  }
};

//----------------------------- Get Worker Stats -----------------------------//
export const getWorkerStats = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    // 1. Missions Completed: Applications Accepted where Mission is Completed
    const missionsCompleted = await prisma.application.count({
      where: {
        worker_profile_id: userId,
        status: "ACCEPTED",
        mission: {
          status: "COMPLETED",
        },
      },
    });

    // 2. Pending Applications
    const pendingApplications = await prisma.application.count({
      where: {
        worker_profile_id: userId,
        status: "PENDING",
      },
    });

    // 3. Active Applications (for limit tracking)
    const activeApplications = await prisma.application.count({
      where: {
        worker_profile_id: userId,
        status: { in: ["PENDING", "ACCEPTED"] },
        mission: {
          status: { in: ["OPEN", "IN_PROGRESS"] }
        }
      },
    });

    // 4. Average Rating
    const ratingAggregate = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
      where: {
        target_id: userId,
      },
    });
    const rating = ratingAggregate._avg.rating || 0;

    // 5. Profile Views (count from ProfileView if exists, else 0)
    let profileViews = 0;
    try {
      profileViews = await prisma.profileView.count({
        where: { worker_id: userId }
      });
    } catch (e) {
      // ProfileView table might not exist yet
      profileViews = 0;
    }

    // 6. Profile Views Last 7 Days
    let profileViewsLast7Days = 0;
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      profileViewsLast7Days = await prisma.profileView.count({
        where: {
          worker_id: userId,
          viewed_at: { gte: sevenDaysAgo }
        }
      });
    } catch (e) {
      profileViewsLast7Days = 0;
    }

    // 7. Estimated Earnings (sum of budgets from accepted missions)
    const earningsAggregate = await prisma.mission.aggregate({
      _sum: {
        budget: true
      },
      where: {
        applications: {
          some: {
            worker_profile_id: userId,
            status: "ACCEPTED"
          }
        }
      }
    });
    const estimatedEarnings = earningsAggregate._sum.budget || 0;

    // 8. Total Spent on subscriptions
    const paymentsAggregate = await prisma.payment.aggregate({
      _sum: {
        amount: true
      },
      where: {
        user_id: userId,
        status: "COMPLETED"
      }
    });
    const totalSpent = (paymentsAggregate._sum.amount || 0) / 100; // Convert from cents

    // 9. Documents count
    const documentsCount = await prisma.workerDocument.count({
      where: { worker_id: userId }
    });

    const verifiedDocuments = await prisma.workerDocument.count({
      where: { worker_id: userId, status: "VERIFIED" }
    });

    // 10. Reviews/Recommendations count
    const recommendationsCount = await prisma.review.count({
      where: { target_id: userId }
    });

    // === Subscription & Limitations ===
    const isValidated = user.status === "VALIDATED";
    const subscription = user.subscription;
    const plan = subscription?.plan;

    // Determine subscription tier
    const subscriptionTier = plan?.code || "BASIC";
    const isPremium = subscriptionTier === "PREMIUM" || subscriptionTier === "PRO";
    const isSubscribed = subscription && subscription.status === "ACTIVE" && isPremium;

    // Application limits based on plan
    const maxActiveApplications = plan?.max_active_applications || 3;
    const applicationsRemaining = Math.max(0, maxActiveApplications - activeApplications);
    const canApply = isValidated && (isPremium || activeApplications < maxActiveApplications);

    // Mission visibility
    const maxVisibleMissions = plan?.max_visible_missions || 3;

    res.status(200).json({
      data: {
        // Basic stats
        missionsCompleted,
        pendingApplications,
        profileViews,
        profileViewsLast7Days,
        rating: Number(rating.toFixed(1)),

        // Documents
        documentsCount,
        verifiedDocuments,
        recommendationsCount,

        // Financial
        estimatedEarnings,
        totalSpent,

        // Status & Limitations
        userStatus: user.status,
        isValidated,
        isSubscribed,
        isPremium,
        subscriptionTier,

        // Application limits
        activeApplications,
        maxActiveApplications: isPremium ? null : maxActiveApplications, // null = unlimited
        applicationsRemaining: isPremium ? null : applicationsRemaining,
        canApply,

        // Mission limits
        maxVisibleMissions: isPremium ? null : maxVisibleMissions,

        // Subscription info
        subscriptionEndDate: subscription?.end_date || null,
        trialEndDate: subscription?.trial_end_date || null,
      },
    });
  } catch (error) {
    console.error("GET WORKER STATS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch stats",
    });
  }
};

//----------------------------- Get Worker Reviews -----------------------------//
export const getWorkerReviews = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;

    const reviews = await prisma.review.findMany({
      where: { target_id: userId },
      include: {
        author: {
          select: {
            user_id: true,
            role: true,
            workerProfile: { select: { first_name: true, last_name: true } },
            establishmentProfile: { select: { name: true } }
          }
        },
        mission: { select: { title: true } }
      },
      orderBy: { created_at: 'desc' },
      take: limit
    });

    const formattedReviews = reviews.map(r => ({
      id: r.review_id,
      author: r.author.establishmentProfile?.name ||
        (r.author.workerProfile ? `${r.author.workerProfile.first_name} ${r.author.workerProfile.last_name}` : 'Utilisateur'),
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
      missionTitle: r.mission?.title
    }));

    res.status(200).json({
      message: "Reviews fetched successfully",
      data: formattedReviews,
    });
  } catch (error) {
    console.error("GET WORKER REVIEWS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch worker reviews",
    });
  }
};

//----------------------------- Get Recommended Missions (Advanced Matching) -----------------------------//
export const getRecommendedMissions = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const limit = parseInt(req.query.limit) || 3;

    // 1. Get worker profile with criteria
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { user_id: userId },
      select: { 
          city_id: true,
          specialities: { select: { speciality_id: true } },
          skills: true // ["Permis B", "Gériatrie"]
      }
    });

    const specialityIds = workerProfile?.specialities.map(s => s.speciality_id) || [];
    const workerCityId = workerProfile?.city_id;
    const workerSkills = workerProfile?.skills || [];

    // 2. Get missions already applied
    const appliedMissions = await prisma.application.findMany({
      where: { worker_profile_id: userId },
      select: { mission_id: true }
    });
    const appliedMissionIds = appliedMissions.map(a => a.mission_id);

    // 3. Fetch Candidate Missions (Broad Filter first)
    // We fetch a bit more than limit to allow re-ranking by score
    const candidateMissions = await prisma.mission.findMany({
      where: {
        status: 'OPEN', // Only OPEN missions
        mission_id: { notIn: appliedMissionIds },
        // Basic match: Must match either City OR Speciality to be considered relevant
        OR: [
            { city_id: workerCityId },
            { speciality_id: { in: specialityIds } }
        ]
      },
      include: {
        establishment: {
          select: {
            name: true,
            logo_url: true,
            city: { select: { name: true } }
          }
        },
        speciality: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 50 // Fetch pool for scoring
    });

    // 4. Scoring Logic
    const scoredMissions = candidateMissions.map(mission => {
        let score = 0;
        const debug = [];

        // A. City Match (High priority)
        if (mission.city_id === workerCityId) {
            score += 10;
            debug.push('City Match (+10)');
        }

        // B. Speciality Match (Critical)
        if (specialityIds.includes(mission.speciality_id)) {
            score += 20;
            debug.push('Speciality Match (+20)');
        }

        // C. Skills/Tags Match (The "Advanced" part)
        // Check intersection of worker.skills and mission.skills
        const missionSkills = mission.skills || [];
        const matchingSkills = missionSkills.filter(skill => workerSkills.includes(skill));
        
        if (matchingSkills.length > 0) {
            const points = matchingSkills.length * 5; // 5 points per matching skill
            score += points;
            debug.push(`Skills Match: ${matchingSkills.join(', ')} (+${points})`);
        }

        // D. Urgency Bonus
        if (mission.is_urgent) {
            score += 5;
            debug.push('Urgent (+5)');
        }

        return { ...mission, matchScore: score, matchDebug: debug };
    });

    // 5. Sort by Score DESC
    scoredMissions.sort((a, b) => b.matchScore - a.matchScore);

    // 6. Format for Frontend
    const finalMissions = scoredMissions.slice(0, limit).map(m => ({
      id: m.mission_id,
      title: m.title,
      establishment: m.establishment?.name || 'Entreprise',
      logo: m.establishment?.logo_url,
      location: m.establishment?.city?.name || 'France',
      speciality: m.speciality?.name,
      salary: m.salary_min && m.salary_max ?
        `${m.salary_min}DH - ${m.salary_max}DH` : // Changed to DH
        (m.salary_min ? `À partir de ${m.salary_min}DH` : 'Non spécifié'),
      type: m.contract_type,
      tags: m.skills, // Show matched tags
      createdAt: m.created_at,
      score: m.matchScore // Optional: show score match %
    }));

    res.status(200).json({
      message: "Recommended missions fetched successfully",
      data: finalMissions,
    });
  } catch (error) {
    console.error("GET RECOMMENDED MISSIONS ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch recommended missions",
    });
  }
};

//----------------------------- Get Public Worker Profile -----------------------------//
export const getPublicWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await prisma.workerProfile.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        user: { select: { status: true } }, // No email required for public
        city: true,
        specialities: {
          include: { speciality: true }
        },
        diplomas: true,
        experiences: { orderBy: { start_date: 'desc' } },
        languages: true, // Include languages
      }
    });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // Hide sensitive data manually
    worker.phone = null;
    worker.address = null;

    res.status(200).json({ data: worker });

  } catch (error) {
    console.error("GET PUBLIC WORKER PROFILE ERROR:", error);
    res.status(500).json({ message: "Failed to fetch public profile" });
  }
};