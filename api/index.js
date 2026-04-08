import mongoose from "mongoose";
import app from "../backend/app.js";

let isConnected = false;

export default async function handler(req, res) {
    if (!process.env.MONGO_URI) {
        return res.status(500).json({ message: "MONGO_URI is not set in environment variables" });
    }

    if (!isConnected || mongoose.connection.readyState !== 1) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 8000,
            });
            isConnected = true;
            console.log("[DB] Connected successfully");
        } catch (err) {
            isConnected = false;
            console.error("[DB] Connection failed:", err.message);
            return res.status(500).json({ message: "DB connection failed: " + err.message });
        }
    }

    return app(req, res);
}
