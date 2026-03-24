import Transaction from "../models/Transaction.js";

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