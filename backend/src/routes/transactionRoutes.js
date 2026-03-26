import express from "express";
import {
    createTransaction,
    deleteTransaction,
    exportTransactions,
    getTransactions,
    updateTransaction
} from "../controllers/transactionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTransaction);
router.get("/export", protect, exportTransactions);
router.get("/", protect, getTransactions);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);
export default router;