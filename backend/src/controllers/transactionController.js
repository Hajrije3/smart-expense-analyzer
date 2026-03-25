import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import Notification from "../models/Notification.js";
import { sendBudgetAlertEmail } from "../services/emailService.js";

// After creating an expense, check budgets and send alert if needed
// user = req.user (already has email, name, notifications loaded by authMiddleware)
const checkBudgetAlert = async (user, category) => {
    try {
        // Default all prefs to true for accounts created before notifications were added
        const prefs = user?.notifications ?? {};
        const budgetAlerts       = prefs.budgetAlerts       !== false;
        const emailNotifications = prefs.emailNotifications !== false;

        console.log(`[BudgetAlert] user=${user.email} category=${category} budgetAlerts=${budgetAlerts} emailNotifications=${emailNotifications}`);

        if (!budgetAlerts || !emailNotifications) return;

        const budget = await Budget.findOne({ user: user._id, category });
        if (!budget) {
            console.log(`[BudgetAlert] no budget found for category="${category}"`);
            return;
        }

        const now = new Date();
        let start;
        if (budget.period === "weekly") {
            start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0);
        } else if (budget.period === "yearly") {
            start = new Date(now.getFullYear(), 0, 1);
        } else {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const agg = await Transaction.aggregate([
            { $match: { user: user._id, type: "expense", category, date: { $gte: start } } },
            { $group: { _id: null, spent: { $sum: "$amount" } } },
        ]);
        const spent = agg[0]?.spent ?? 0;
        const percentUsed = Math.round((spent / budget.amount) * 100);

        console.log(`[BudgetAlert] category=${category} spent=${spent} limit=${budget.amount} percent=${percentUsed}%`);

        if (percentUsed >= 80) {
            const isExceeded = percentUsed >= 100;
            const title = isExceeded
                ? `Budget exceeded: ${category}`
                : `Budget alert: ${category} at ${percentUsed}%`;
            const message = isExceeded
                ? `You've exceeded your ${category} budget. Spent $${spent.toFixed(2)} of $${budget.amount.toFixed(2)}.`
                : `You've used ${percentUsed}% of your ${category} budget. Spent $${spent.toFixed(2)} of $${budget.amount.toFixed(2)}.`;

            // Always create in-app notification if budget alerts are on
            if (budgetAlerts) {
                await Notification.create({
                    user: user._id,
                    title,
                    message,
                    type: isExceeded ? "budget_exceeded" : "budget_alert",
                });
                console.log(`[BudgetAlert] in-app notification created`);
            }

            // Send email only if email notifications are also on
            if (budgetAlerts && emailNotifications) {
                console.log(`[BudgetAlert] sending email to ${user.email}`);
                await sendBudgetAlertEmail({
                    to: user.email,
                    name: user.name,
                    category,
                    spent,
                    limit: budget.amount,
                    percentUsed,
                });
                console.log(`[BudgetAlert] email sent successfully`);
            }
        }
    } catch (err) {
        console.error("[BudgetAlert] check failed:", err.message);
    }
};

// CREATE TRANSACTION
export const createTransaction = async (req, res) => {
    try {
        const { amount, category, type, description } = req.body;

        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            category,
            type,
            description: description || "",
        });

        // Fire budget alert check asynchronously (non-blocking)
        if (type === "expense") {
            checkBudgetAlert(req.user, category);
        }

        res.status(201).json(transaction);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET USER TRANSACTIONS
export const getTransactions = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const { search, type, category } = req.query;

        let query = { user: req.user._id };

        // 🔍 SEARCH (category or description)
        if (search) {
            query.$or = [
                { category: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        // 📊 TYPE FILTER
        if (type && type !== "all") {
            query.type = type;
        }

        // 🧩 CATEGORY FILTER
        if (category && category !== "all") {
            query.category = category;
        }

        const total = await Transaction.countDocuments(query);

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            transactions,
            page,
            pages: Math.ceil(total / limit),
            total,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE TRANSACTION
export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, type, date, description } = req.body;

        // Find transaction
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Make sure user owns the transaction
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Update fields (only if provided)
        transaction.amount = amount ?? transaction.amount;
        transaction.category = category ?? transaction.category;
        transaction.type = type ?? transaction.type;
        transaction.date = date ?? transaction.date;
        transaction.description = description ?? transaction.description;

        const updatedTransaction = await transaction.save();

        res.json(updatedTransaction);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE TRANSACTION
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        // Find transaction first
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // 🔐 Check ownership (VERY IMPORTANT)
        if (transaction.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // 🗑 Delete
        await transaction.deleteOne();

        res.json({ message: "Transaction deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};