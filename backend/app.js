import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import budgetRoutes from "./src/routes/budgetRoutes.js";
import insightsRoutes from "./src/routes/insightsRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";

dotenv.config();

const app = express();

const allowedOrigins = [
    "https://smart-expense-analyzer-green.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// DB connection middleware — runs before every route using the same mongoose instance as models
let connectPromise = null;
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState === 1) return next();
    if (!process.env.MONGO_URI) {
        return res.status(500).json({ message: "MONGO_URI is not configured" });
    }
    try {
        if (!connectPromise) {
            connectPromise = mongoose
                .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
                .catch((err) => { connectPromise = null; throw err; });
        }
        await connectPromise;
        next();
    } catch (err) {
        console.error("[DB] Connection failed:", err.message);
        res.status(500).json({ message: "DB connection failed: " + err.message });
    }
});

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);

export default app;
