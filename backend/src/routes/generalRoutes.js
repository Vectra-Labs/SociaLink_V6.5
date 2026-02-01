import express from "express";
import { getCities } from "../controllers/generalController.js";
import { getPublicWorkerProfile } from "../controllers/workerController.js";

const router = express.Router();

router.get("/cities", getCities);
router.get("/worker/:id/public", getPublicWorkerProfile);

export default router;
