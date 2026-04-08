import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: "monthly",
    },
  },
  { timestamps: true, bufferCommands: false }
);

budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
