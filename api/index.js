import mongoose from "mongoose";
import app from "../backend/app.js";

mongoose.set("bufferCommands", false);

let connectionPromise = null;

const connectDB = () => {
    if (connectionPromise && mongoose.connection.readyState === 1) {
        return connectionPromise;
    }
    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
    }).catch((err) => {
        connectionPromise = null;
        throw err;
    });
    return connectionPromise;
};

export default async function handler(req, res) {
    try {
        await connectDB();
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        return res.status(500).json({ message: "DB connection failed: " + err.message });
    }
    return app(req, res);
}
