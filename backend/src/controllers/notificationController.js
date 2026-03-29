import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const markRead = async (req, res) => {
    try {
        await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { read: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
