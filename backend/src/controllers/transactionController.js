import Transaction from "../models/Transaction.js";

// CREATE TRANSACTION
export const createTransaction = async (req, res) => {
    try {
        const { amount, category, type } = req.body;

        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            category,
            type,
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

        // 🔍 SEARCH (category text)
        if (search) {
            query.category = { $regex: search, $options: "i" };
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