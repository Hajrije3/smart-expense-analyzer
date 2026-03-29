import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

const getPeriodRange = (period) => {
  const now = new Date();
  let start, end;

  if (period === "weekly") {
    const day = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (period === "yearly") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
};

export const createBudget = async (req, res) => {
  try {
    const { category, amount, period } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ message: "Category and amount are required" });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      period: period || "monthly",
    });

    res.status(201).json(budget);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Budget for this category and period already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const { start, end } = getPeriodRange(budget.period);

        const filter = {
          user: req.user._id,
          type: "expense",
          date: { $gte: start, $lte: end },
        };

        if (budget.category !== "all") {
          filter.category = budget.category;
        }

        const result = await Transaction.aggregate([
          { $match: filter },
          { $group: { _id: null, spent: { $sum: "$amount" } } },
        ]);

        const spent = result[0]?.spent || 0;
        const remaining = budget.amount - spent;
        const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

        return { ...budget.toObject(), spent, remaining, percentUsed };
      })
    );

    res.json(budgetsWithSpending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const { start, end } = getPeriodRange(budget.period);
    const filter = {
      user: req.user._id,
      type: "expense",
      date: { $gte: start, $lte: end },
    };

    if (budget.category !== "all") {
      filter.category = budget.category;
    }

    const result = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: null, spent: { $sum: "$amount" } } },
    ]);

    const spent = result[0]?.spent || 0;
    res.json({
      ...budget.toObject(),
      spent,
      remaining: budget.amount - spent,
      percentUsed: budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const { category, amount, period } = req.body;
    if (category !== undefined) budget.category = category;
    if (amount !== undefined) budget.amount = amount;
    if (period !== undefined) budget.period = period;

    const updated = await budget.save();
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Budget for this category and period already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.json({ message: "Budget deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
