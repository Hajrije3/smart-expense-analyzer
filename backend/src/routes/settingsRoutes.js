import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount,
    getNotifications,
    updateNotifications,
} from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.delete("/account", deleteAccount);
router.get("/notifications", getNotifications);
router.put("/notifications", updateNotifications);

export default router;
