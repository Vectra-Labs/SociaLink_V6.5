import express from "express";
import { getEstablishmentProfile, updateEstablishmentProfile, getPublicEstablishmentProfile, updateEstablishmentSlugs, getEstablishmentStats, searchWorkers, getWorkerById, requestCV } from "../controllers/establishmentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";

const router = express.Router();

// Public route (for workers viewing establishment profiles) - supports slug or ID
router.get("/public/:identifier", authMiddleware, getPublicEstablishmentProfile);

// Admin route to generate slugs for existing establishments
router.post("/admin/generate-slugs", authMiddleware, roleMiddleware("ADMIN"), updateEstablishmentSlugs);

// Protected routes (for establishment owners)
router.use(authMiddleware, roleMiddleware("ESTABLISHMENT"));

router.get("/stats", getEstablishmentStats);
router.get("/search-workers", searchWorkers);
router.get("/profile", getEstablishmentProfile);
router.get("/worker/:id", getWorkerById);
router.post("/request-cv", requestCV);
router.put("/profile/update", uploadImage.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), updateEstablishmentProfile);

export default router;
