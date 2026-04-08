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

    if (budgets.length === 0) return res.json([]);

    // Group budgets by period and do one aggregation per period type (max 3 queries)
    const periodGroups = {};
    budgets.forEach((b) => {
      if (!periodGroups[b.period]) periodGroups[b.period] = [];
      periodGroups[b.period].push(b);
    });

    const spentByBudgetId = {};
    await Promise.all(
      Object.entries(periodGroups).map(async ([period, periodBudgets]) => {
        const { start, end } = getPeriodRange(period);
        const hasAll = periodBudgets.some((b) => b.category === "all");
        const categories = periodBudgets.filter((b) => b.category !== "all").map((b) => b.category);

        const matchFilter = { user: req.user._id, type: "expense", date: { $gte: start, $lte: end } };
        if (!hasAll && categories.length > 0) matchFilter.category = { $in: categories };

        const results = await Transaction.aggregate([
          { $match: matchFilter },
          { $group: { _id: "$category", spent: { $sum: "$amount" } } },
        ]);

        const categorySpending = Object.fromEntries(results.map((r) => [r._id, r.spent]));
        const periodTotal = results.reduce((s, r) => s + r.spent, 0);

        periodBudgets.forEach((b) => {
          spentByBudgetId[b._id.toString()] =
            b.category === "all" ? periodTotal : (categorySpending[b.category] || 0);
        });
      })
    );

    const budgetsWithSpending = budgets.map((budget) => {
      const spent = spentByBudgetId[budget._id.toString()] || 0;
      const remaining = budget.amount - spent;
      const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
      return { ...budget.toObject(), spent, remaining, percentUsed };
    });

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
