import express from "express";
import { applyToMission, getMyApplications, getReceivedApplications, updateApplicationStatus, getAcceptedWorker, respondToProposition, withdrawApplication, inviteWorker } from "../controllers/applicationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Worker Routes
router.post("/apply", roleMiddleware("WORKER"), applyToMission);
router.get("/my-applications", roleMiddleware("WORKER"), getMyApplications);
router.patch("/:id/respond", roleMiddleware("WORKER"), respondToProposition);
router.delete("/:id", roleMiddleware("WORKER"), withdrawApplication);

// Establishment Routes
router.get("/received", roleMiddleware("ESTABLISHMENT"), getReceivedApplications);
router.patch("/:id/status", roleMiddleware("ESTABLISHMENT"), updateApplicationStatus);
router.post("/invite", roleMiddleware("ESTABLISHMENT"), inviteWorker);
router.get("/mission/:missionId/accepted", getAcceptedWorker);

export default router;

