import mongoose from "mongoose";
import app from "../backend/app.js";

let connectPromise = null;

async function connectDB() {
    if (mongoose.connection.readyState === 1) return;

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is not set");
    }

    if (!connectPromise) {
        connectPromise = mongoose
            .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
            .catch((err) => {
                connectPromise = null;
                throw err;
            });
    }

    await connectPromise;

    if (mongoose.connection.readyState !== 1) {
        throw new Error(`DB connected but readyState is ${mongoose.connection.readyState}`);
    }
}

export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error("[DB] Error:", err.message);
        return res.status(500).json({ message: err.message });
    }
    return app(req, res);
}
