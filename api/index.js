import mongoose from "mongoose";

// Must run BEFORE models are defined — dynamic import ensures this
mongoose.set("bufferCommands", false);

const { default: app } = await import("../backend/app.js");

let connectionPromise = null;

const connectDB = () => {
    if (!process.env.MONGO_URI) {
        return Promise.reject(new Error("MONGO_URI environment variable is not set"));
    }
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
        console.error("[DB] Connection failed:", err.message);
        return res.status(500).json({ message: "DB connection failed: " + err.message });
    }
    return app(req, res);
}
