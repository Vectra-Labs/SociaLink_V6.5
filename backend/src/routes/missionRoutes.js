import express from "express";
import { createMission, getMyMissions, getAllMissions, getMissionById, updateMissionStatus, updateMission } from "../controllers/missionController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public / Visitor / Worker (Filtered)
router.get("/all", optionalAuthMiddleware, getAllMissions);

// Protected Routes (Establishment & strict auth)
router.use(authMiddleware);

// Establishment specific - MUST be before /:id to avoid conflicts
router.post("/create", roleMiddleware("ESTABLISHMENT"), createMission);
router.get("/my-missions", roleMiddleware("ESTABLISHMENT"), getMyMissions);
router.patch("/:id/status", roleMiddleware("ESTABLISHMENT"), updateMissionStatus);
router.put("/:id", roleMiddleware("ESTABLISHMENT"), updateMission);

// Single mission by ID - MUST be last (parameterized route)
router.get("/:id", optionalAuthMiddleware, getMissionById);

export default router;
