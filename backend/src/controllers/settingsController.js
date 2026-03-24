import bcrypt from "bcryptjs";
import User from "../models/User.js";

// GET /api/settings/profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /api/settings/profile  — update name and/or email
export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({ message: "Name and email are required." });
        }

        // Check email not taken by another user
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

// PUT /api/settings/password  — change password
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

// DELETE /api/settings/account  — delete account and all user data
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

        // Import models inline to avoid circular deps
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
