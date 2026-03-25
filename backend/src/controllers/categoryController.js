import Category from "../models/Category.js";

const DEFAULTS = [
    { name: "Food & Dining",  icon: "🍔", color: "#f97316" },
    { name: "Transport",      icon: "🚗", color: "#3b82f6" },
    { name: "Shopping",       icon: "🛍️", color: "#a855f7" },
    { name: "Entertainment",  icon: "🎬", color: "#ec4899" },
    { name: "Housing",        icon: "🏠", color: "#6366f1" },
    { name: "Health",         icon: "💊", color: "#ef4444" },
    { name: "Education",      icon: "📚", color: "#eab308" },
    { name: "Travel",         icon: "✈️", color: "#14b8a6" },
    { name: "Utilities",      icon: "💡", color: "#22c55e" },
    { name: "Income",         icon: "💰", color: "#16a34a" },
    { name: "Other",          icon: "📦", color: "#6b7280" },
];

// GET /api/categories
export const getCategories = async (req, res) => {
    try {
        let categories = await Category.find({ user: req.user._id }).sort({ createdAt: 1 });

        // Seed defaults for new users
        if (categories.length === 0) {
            categories = await Category.insertMany(
                DEFAULTS.map((d) => ({ ...d, user: req.user._id }))
            );
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/categories
export const createCategory = async (req, res) => {
    try {
        const { name, icon, color } = req.body;
        if (!name?.trim()) return res.status(400).json({ message: "Name is required" });

        // Prevent duplicates
        const existing = await Category.findOne({
            user: req.user._id,
            name: { $regex: `^${name.trim()}$`, $options: "i" },
        });
        if (existing) return res.status(400).json({ message: "Category already exists" });

        const category = await Category.create({
            user: req.user._id,
            name: name.trim(),
            icon: icon || "📦",
            color: color || "#6b7280",
        });
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
    try {
        await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
