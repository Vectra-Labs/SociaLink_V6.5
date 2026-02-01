import express from "express";
import { uploadImage } from "../middleware/uploadImageMiddleware.js";
import { uploadDocument as uploadDocumentMiddleware, handleMulterError } from "../middleware/uploadDocumentMiddleware.js";
import { updateWorkerProfile, addWorkerSpecialities, getWorkerSpecialities, removeWorkerSpeciality, submitWorkerProfile, getWorkerProfile, getExperiences, addExperience, deleteExperience, getWorkerStats, getWorkerReviews, getRecommendedMissions } from "../controllers/workerController.js";
import { getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, getHolidays, toggleAvailability } from "../controllers/calendarController.js";
import { getDocuments, uploadDocument, updateDocument, deleteDocument } from "../controllers/documentController.js";
import { getLanguages, addLanguage, updateLanguage, deleteLanguage } from "../controllers/languageController.js";
import { validate } from "../validators/authValidator.js"; // Reuse the validate helper
import { updateWorkerProfileSchema, addWorkerSpecialitiesSchema } from "../validators/workerValidator.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";


const router = express.Router();

// Protection globale WORKER
router.use(authMiddleware, roleMiddleware("WORKER"));

router.get("/stats", getWorkerStats);
router.get("/profile", getWorkerProfile);
router.get("/recommended-missions", getRecommendedMissions);
router.put("/profile/update", uploadImage.fields([{ name: 'photo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), validate(updateWorkerProfileSchema), updateWorkerProfile);
router.post("/add/specialities", validate(addWorkerSpecialitiesSchema), addWorkerSpecialities);
router.get("/specialities", getWorkerSpecialities);
router.delete("/specialities/:id", removeWorkerSpeciality);
router.post("/submit", submitWorkerProfile);
router.get("/reviews", getWorkerReviews);

// Experiences
router.get("/experiences", getExperiences);
router.post("/experience", addExperience);
router.delete("/experience/:id", deleteExperience);

// Calendar
router.get("/calendar", getCalendarEvents);
router.post("/calendar", createCalendarEvent);
router.put("/calendar/:id", updateCalendarEvent);
router.delete("/calendar/:id", deleteCalendarEvent);
router.get("/calendar/holidays/:year", getHolidays);
router.post("/calendar/toggle-availability", toggleAvailability);

// Documents (avec upload fichier)
router.get("/documents", getDocuments);
router.post("/documents", uploadDocumentMiddleware.single("file"), handleMulterError, uploadDocument);
router.put("/documents/:id", updateDocument);
router.delete("/documents/:id", deleteDocument);

// Languages
router.get("/languages", getLanguages);
router.post("/language", addLanguage);
router.put("/language/:id", updateLanguage);
router.delete("/language/:id", deleteLanguage);

export default router;