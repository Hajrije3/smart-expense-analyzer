import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    notifications: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications:  { type: Boolean, default: true },
        budgetAlerts:       { type: Boolean, default: true },
    },
}, { timestamps: true, bufferCommands: false });

export default mongoose.model("User", userSchema);