import { prisma } from "../config/db.js";

//----------------------------- Create Review -----------------------------//
export const createReview = async (req, res) => {
    try {
        // author_id is the logged in user
        const author_id = req.user.user_id;
        const { mission_id, target_id, rating, comment } = req.body;

        // 1. Check if mission exists and is COMPLETED
        const mission = await prisma.mission.findUnique({
            where: { mission_id: parseInt(mission_id) }
        });

        if (!mission) return res.status(404).json({ message: "Mission not found" });
        if (mission.status !== "COMPLETED") {
            return res.status(400).json({ message: "Mission must be COMPLETED to leave a review." });
        }

        // 2. Verify participation (Author must be Establishment or Worker involved)
        // Check if author is the establishment
        const isEstablishment = mission.establishment_id === author_id;

        // Check if author is the accepted worker
        // We find the accepted application for this mission
        const acceptedApp = await prisma.application.findFirst({
            where: { mission_id: parseInt(mission_id), status: "ACCEPTED" }
        });

        if (!acceptedApp) return res.status(400).json({ message: "No accepted worker for this mission." });

        const isWorker = acceptedApp.worker_profile_id === author_id;

        if (!isEstablishment && !isWorker) {
            return res.status(403).json({ message: "You were not involved in this mission." });
        }

        // 3. Verify target (If author is Establishment, target must be Worker, and vice-versa)
        if (isEstablishment && parseInt(target_id) !== acceptedApp.worker_profile_id) {
            return res.status(400).json({ message: "You can only review the worker who performed the mission." });
        }
        if (isWorker && parseInt(target_id) !== mission.establishment_id) {
            return res.status(400).json({ message: "You can only review the establishment." });
        }

        // 4. Check if already reviewed
        const existing = await prisma.review.findFirst({
            where: {
                mission_id: parseInt(mission_id),
                author_id
            }
        });
        if (existing) {
            return res.status(400).json({ message: "You have already reviewed this mission." });
        }

        // 5. Create Review
        const review = await prisma.review.create({
            data: {
                mission_id: parseInt(mission_id),
                author_id,
                target_id: parseInt(target_id),
                rating: parseInt(rating),
                comment
            }
        });

        // Optional: Update average rating on Profile (Worker or Establishment)
        // For now, we'll calculate it on the fly or add it later.

        res.status(201).json({ message: "Review created successfully", data: review });

    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);
        res.status(500).json({ message: "Failed to create review" });
    }
};

//----------------------------- Get Reviews for User -----------------------------//
export const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { target_id: parseInt(userId) },
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
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({ data: reviews });
    } catch (error) {
        console.error("GET USER REVIEWS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch reviews" });
    }
};
