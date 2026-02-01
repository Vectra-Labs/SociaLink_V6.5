import express from "express";
import { createReview, getUserReviews } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createReview);
router.get("/user/:userId", getUserReviews);

export default router;
