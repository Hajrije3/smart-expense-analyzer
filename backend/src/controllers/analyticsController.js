import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

export const getCategoryBreakdown = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const transactions = await Transaction.find({
            user: userId,
            type: "expense",
            date: { $gte: startOfMonth },
        });

        const categoryMap = {};
        let total = 0;

        transactions.forEach((tx) => {
            if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
            categoryMap[tx.category] += tx.amount;
            total += tx.amount;
        });

        const breakdown = Object.entries(categoryMap).map(([category, amount]) => ({
            category,
            amount,
            percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        }));

        res.json({ breakdown, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWeeklyComparison = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const [thisMonthTx, lastMonthTx] = await Promise.all([
            Transaction.find({ user: userId, type: "expense", date: { $gte: thisMonthStart, $lte: thisMonthEnd } }),
            Transaction.find({ user: userId, type: "expense", date: { $gte: lastMonthStart, $lte: lastMonthEnd } }),
        ]);

        const groupByWeek = (transactions) => {
            const weeks = { 1: 0, 2: 0, 3: 0, 4: 0 };
            transactions.forEach((tx) => {
                const day = new Date(tx.date).getDate();
                const week = Math.min(Math.ceil(day / 7), 4);
                weeks[week] += tx.amount;
            });
            return weeks;
        };

        const thisWeeks = groupByWeek(thisMonthTx);
        const lastWeeks = groupByWeek(lastMonthTx);

        const weeks = [1, 2, 3, 4].map((w) => ({
            week: `Week ${w}`,
            thisMonth: parseFloat(thisWeeks[w].toFixed(2)),
            lastMonth: parseFloat(lastWeeks[w].toFixed(2)),
        }));

        const avgThisMonth = parseFloat((Object.values(thisWeeks).reduce((a, b) => a + b, 0) / 4).toFixed(2));
        const avgLastMonth = parseFloat((Object.values(lastWeeks).reduce((a, b) => a + b, 0) / 4).toFixed(2));

        res.json({ weeks, avgThisMonth, avgLastMonth });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSummaryStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        // Last 7 months of expenses for avg monthly spending
        const trendStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const allExpenses = await Transaction.find({
            user: userId,
            type: "expense",
            date: { $gte: trendStart },
        });

        const monthTotals = {};
        allExpenses.forEach((tx) => {
            const key = new Date(tx.date).toLocaleDateString("en-US", { year: "numeric", month: "short" });
            if (!monthTotals[key]) monthTotals[key] = 0;
            monthTotals[key] += tx.amount;
        });
        const monthValues = Object.values(monthTotals);
        const avgMonthlySpending = monthValues.length
            ? parseFloat((monthValues.reduce((a, b) => a + b, 0) / monthValues.length).toFixed(2))
            : 0;

        // Current month category breakdown for highest category
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthExpenses = await Transaction.find({
            user: userId,
            type: "expense",
            date: { $gte: thisMonthStart },
        });

        const categoryMap = {};
        thisMonthExpenses.forEach((tx) => {
            if (!categoryMap[tx.category]) categoryMap[tx.category] = 0;
            categoryMap[tx.category] += tx.amount;
        });
        const highestEntry = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        const highestCategory = highestEntry ? highestEntry[0] : null;
        const highestCategoryAmount = highestEntry ? parseFloat(highestEntry[1].toFixed(2)) : 0;

        // Savings rate = (income - expenses) / income * 100 for current month
        const thisMonthIncome = await Transaction.find({
            user: userId,
            type: "income",
            date: { $gte: thisMonthStart },
        });
        const totalIncome = thisMonthIncome.reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpenses = thisMonthExpenses.reduce((sum, tx) => sum + tx.amount, 0);
        const savingsRate = totalIncome > 0
            ? parseFloat(((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1))
            : 0;

        res.json({ avgMonthlySpending, highestCategory, highestCategoryAmount, savingsRate, totalIncome });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSpendingTrend = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const months = 7;
        const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

        const transactions = await Transaction.find({
            user: userId,
            type: "expense",
            date: { $gte: startDate },
        });

        const monthMap = {};
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString("en-US", { month: "short" });
            monthMap[key] = 0;
        }

        transactions.forEach((tx) => {
            const key = new Date(tx.date).toLocaleDateString("en-US", { month: "short" });
            if (key in monthMap) monthMap[key] += tx.amount;
        });

        const trend = Object.entries(monthMap).map(([month, spending]) => ({
            month,
            spending: parseFloat(spending.toFixed(2)),
        }));

        res.json(trend);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getQuickInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const [budgets, thisMonthTx, weekTx] = await Promise.all([
            Budget.find({ user: userId }),
            Transaction.find({ user: userId, date: { $gte: thisMonthStart } }),
            Transaction.find({ user: userId, type: "expense", date: { $gte: weekStart } }),
        ]);

        const insights = [];

        // Budget exceeded / warning insights
        for (const budget of budgets) {
            const spent = thisMonthTx
                .filter((tx) => tx.type === "expense" && tx.category === budget.category)
                .reduce((s, tx) => s + tx.amount, 0);
            const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

            if (spent > budget.amount) {
                insights.push({
                    type: "warning",
                    title: `${budget.category} Budget Exceeded`,
                    description: `You've spent $${spent.toFixed(2)} out of your $${budget.amount} budget for ${budget.category} this month.`,
                });
            } else if (pct >= 80) {
                insights.push({
                    type: "alert",
                    title: `${budget.category} Budget Almost Full`,
                    description: `You've used ${pct}% of your ${budget.category} budget. Only $${(budget.amount - spent).toFixed(2)} remaining.`,
                });
            }
        }

        // Savings progress
        const monthlyIncome = thisMonthTx
            .filter((tx) => tx.type === "income")
            .reduce((s, tx) => s + tx.amount, 0);
        const monthlyExpenses = thisMonthTx
            .filter((tx) => tx.type === "expense")
            .reduce((s, tx) => s + tx.amount, 0);
        const savings = monthlyIncome - monthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? Math.round((savings / monthlyIncome) * 100) : 0;

        if (savingsRate > 10) {
            insights.push({
                type: "positive",
                title: "Great Savings Progress",
                description: `You're saving ${savingsRate}% of your income this month — you're on track!`,
            });
        } else if (savingsRate < 0) {
            insights.push({
                type: "alert",
                title: "Spending Exceeds Income",
                description: `Your expenses exceed your income by $${Math.abs(savings).toFixed(2)} this month.`,
            });
        }

        // Unusual weekly spending by category
        const weekByCategory = {};
        weekTx.forEach((tx) => {
            weekByCategory[tx.category] = (weekByCategory[tx.category] || 0) + tx.amount;
        });
        const monthByCategory = {};
        thisMonthTx.filter((tx) => tx.type === "expense").forEach((tx) => {
            monthByCategory[tx.category] = (monthByCategory[tx.category] || 0) + tx.amount;
        });

        for (const [cat, weekAmount] of Object.entries(weekByCategory)) {
            const weeklyAvg = (monthByCategory[cat] || 0) / 4;
            if (weeklyAvg > 0 && weekAmount > weeklyAvg * 1.25) {
                const pctAbove = Math.round(((weekAmount - weeklyAvg) / weeklyAvg) * 100);
                insights.push({
                    type: "tip",
                    title: `Unusual ${cat} Spending`,
                    description: `You spent ${pctAbove}% more on ${cat} this week compared to your average.`,
                });
            }
        }

        // Default tip if no insights
        if (insights.length === 0) {
            insights.push({
                type: "positive",
                title: "All Good!",
                description: "Your spending looks healthy. Keep tracking your transactions to get personalized tips.",
            });
        }

        res.json(insights.slice(0, 4));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [allTx, thisMonthTx, budgets] = await Promise.all([
            Transaction.find({ user: userId }),
            Transaction.find({ user: userId, date: { $gte: thisMonthStart } }),
            Budget.find({ user: userId }),
        ]);

        // Total balance = all-time income - all-time expenses
        const totalBalance = allTx.reduce((sum, tx) => tx.type === "income" ? sum + tx.amount : sum - tx.amount, 0);

        // Monthly spending = current month expenses
        const monthlySpending = thisMonthTx
            .filter((tx) => tx.type === "expense")
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Monthly income
        const monthlyIncome = thisMonthTx
            .filter((tx) => tx.type === "income")
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Savings rate = (income - expenses) / income * 100
        const savingsRate = monthlyIncome > 0
            ? parseFloat(((monthlyIncome - monthlySpending) / monthlyIncome * 100).toFixed(1))
            : 0;

        // Budget status = overall % of total budget used (calculate spent from transactions)
        const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
        let totalSpent = 0;
        if (budgets.length > 0) {
            const spentResults = await Promise.all(
                budgets.map((b) => {
                    const now = new Date();
                    let start;
                    if (b.period === "weekly") {
                        start = new Date(now);
                        start.setDate(now.getDate() - now.getDay());
                        start.setHours(0, 0, 0, 0);
                    } else if (b.period === "yearly") {
                        start = new Date(now.getFullYear(), 0, 1);
                    } else {
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                    }
                    return Transaction.aggregate([
                        { $match: { user: userId, type: "expense", category: b.category, date: { $gte: start } } },
                        { $group: { _id: null, spent: { $sum: "$amount" } } },
                    ]);
                })
            );
            totalSpent = spentResults.reduce((s, r) => s + (r[0]?.spent || 0), 0);
        }
        const budgetStatus = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        res.json({
            totalBalance: parseFloat(totalBalance.toFixed(2)),
            monthlySpending: parseFloat(monthlySpending.toFixed(2)),
            savingsRate,
            budgetStatus,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const range = req.query.range || "7d";

        // 🧠 Determine date range
        const now = new Date();
        let startDate = new Date();

        switch (range) {
            case "7d":
                startDate.setDate(now.getDate() - 7);
                break;
            case "1m":
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "3m":
                startDate.setMonth(now.getMonth() - 3);
                break;
            case "6m":
                startDate.setMonth(now.getMonth() - 6);
                break;
            case "1y":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // 📊 Aggregate data
        const transactions = await Transaction.find({
            user: userId,
            date: { $gte: startDate },
        });

        // 🧠 Group by month/day
        const resultMap = {};

        transactions.forEach((tx) => {
            const date = new Date(tx.date);
            const key = date.toLocaleDateString("en-US", {
                month: "short",
                day: range === "7d" ? "numeric" : undefined,
            });

            if (!resultMap[key]) {
                resultMap[key] = {
                    income: 0,
                    expense: 0,
                };
            }

            if (tx.type === "income") {
                resultMap[key].income += tx.amount;
            } else {
                resultMap[key].expense += tx.amount;
            }
        });

        // 📦 Format response
        const analytics = Object.entries(resultMap).map(([label, data]) => ({
            label,
            income: data.income,
            expenses: data.expense,
            savings: data.income - data.expense,
        }));

        res.json(analytics);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};