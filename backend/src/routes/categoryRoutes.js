import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCategories, createCategory, deleteCategory } from "../controllers/categoryController.js";

const router = express.Router();
router.use(protect);

router.get("/", getCategories);
router.post("/", createCategory);
router.delete("/:id", deleteCategory);

export default router;
