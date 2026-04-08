import mongoose from "mongoose";
import app from "../backend/app.js";

let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected || mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
    }
    return app(req, res);
}
