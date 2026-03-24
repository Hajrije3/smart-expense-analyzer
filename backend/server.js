import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";
import analyticsRoutes from "./src/routes/analyticsRoutes.js";
import budgetRoutes from "./src/routes/budgetRoutes.js";
import insightsRoutes from "./src/routes/insightsRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.get("/", (req, res) => {
    res.send("API is running...");
});
app.use("/api/analytics", analyticsRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/settings", settingsRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    })
    .catch((err) => console.log(err));