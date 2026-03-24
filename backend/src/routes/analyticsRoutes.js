import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/analytics?range=7d
router.get("/", protect, getAnalytics);

export default router;