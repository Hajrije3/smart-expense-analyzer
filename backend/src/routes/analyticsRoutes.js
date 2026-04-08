import express from "express";
import { getAnalytics, getCategoryBreakdown, getWeeklyComparison, getSpendingTrend, getSummaryStats, getDashboardStats, getQuickInsights, getPredictions, getYearOverYear } from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAnalytics);
router.get("/category-breakdown", protect, getCategoryBreakdown);
router.get("/weekly-comparison", protect, getWeeklyComparison);
router.get("/spending-trend", protect, getSpendingTrend);
router.get("/summary-stats", protect, getSummaryStats);
router.get("/dashboard-stats", protect, getDashboardStats);
router.get("/quick-insights", protect, getQuickInsights);
router.get("/predictions", protect, getPredictions);
router.get("/year-over-year", protect, getYearOverYear);

export default router;