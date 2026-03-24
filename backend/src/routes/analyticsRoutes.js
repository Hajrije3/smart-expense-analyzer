import express from "express";
import { getAnalytics, getCategoryBreakdown, getWeeklyComparison, getSpendingTrend, getSummaryStats, getDashboardStats, getQuickInsights } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/analytics?range=7d
router.get("/", protect, getAnalytics);
router.get("/category-breakdown", protect, getCategoryBreakdown);
router.get("/weekly-comparison", protect, getWeeklyComparison);
router.get("/spending-trend", protect, getSpendingTrend);
router.get("/summary-stats", protect, getSummaryStats);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/quick-insights", protect, getQuickInsights);

export default router;