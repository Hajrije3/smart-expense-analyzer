import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({ message: "Name and email are required." });
        }

        const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: req.user._id } });
        if (existing) {
            return res.status(400).json({ message: "Email is already in use by another account." });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name: name.trim(), email: email.toLowerCase().trim() },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters." });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password updated successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("notifications");
        res.json(user.notifications ?? { emailNotifications: true, pushNotifications: true, budgetAlerts: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateNotifications = async (req, res) => {
    try {
        const { emailNotifications, pushNotifications, budgetAlerts } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { notifications: { emailNotifications, pushNotifications, budgetAlerts } },
            { new: true }
        ).select("notifications");
        res.json(user.notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required to delete your account." });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password." });
        }

        const { default: Transaction } = await import("../models/Transaction.js");
        const { default: Budget } = await import("../models/Budget.js");

        await Promise.all([
            Transaction.deleteMany({ user: req.user._id }),
            Budget.deleteMany({ user: req.user._id }),
            User.findByIdAndDelete(req.user._id),
        ]);

        res.json({ message: "Account deleted successfully." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
