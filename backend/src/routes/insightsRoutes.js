import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getInsights } from "../controllers/insightsController.js";

const router = express.Router();

router.use(protect);

router.post("/", getInsights);

export default router;
