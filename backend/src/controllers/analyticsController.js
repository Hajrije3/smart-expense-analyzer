import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

export const getCategoryBreakdown = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const results = await Transaction.aggregate([
            { $match: { user: userId, type: "expense", date: { $gte: startOfMonth } } },
            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
        ]);

        const total = results.reduce((s, r) => s + r.amount, 0);
        const breakdown = results.map((r) => ({
            category: r._id,
            amount: r.amount,
            percentage: total > 0 ? Math.round((r.amount / total) * 100) : 0,
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

        const weekGroup = {
            $min: [{ $ceil: { $divide: [{ $dayOfMonth: "$date" }, 7] } }, 4],
        };

        const [thisMonthData, lastMonthData] = await Promise.all([
            Transaction.aggregate([
                { $match: { user: userId, type: "expense", date: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
                { $group: { _id: weekGroup, total: { $sum: "$amount" } } },
            ]),
            Transaction.aggregate([
                { $match: { user: userId, type: "expense", date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
                { $group: { _id: weekGroup, total: { $sum: "$amount" } } },
            ]),
        ]);

        const toWeekMap = (data) => {
            const weeks = { 1: 0, 2: 0, 3: 0, 4: 0 };
            data.forEach((r) => { weeks[r._id] = r.total; });
            return weeks;
        };

        const thisWeeks = toWeekMap(thisMonthData);
        const lastWeeks = toWeekMap(lastMonthData);

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
        const trendStart = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const [monthlyExpenses, thisMonthStats] = await Promise.all([
            Transaction.aggregate([
                { $match: { user: userId, type: "expense", date: { $gte: trendStart } } },
                { $group: {
                    _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                    total: { $sum: "$amount" },
                }},
            ]),
            Transaction.aggregate([
                { $match: { user: userId, date: { $gte: thisMonthStart } } },
                { $group: {
                    _id: { type: "$type", category: "$category" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                }},
            ]),
        ]);

        const monthValues = monthlyExpenses.map((r) => r.total);
        const avgMonthlySpending = monthValues.length
            ? parseFloat((monthValues.reduce((a, b) => a + b, 0) / monthValues.length).toFixed(2))
            : 0;

        const categoryMap = {};
        let totalIncome = 0;
        let totalExpenses = 0;
        let expenseCount = 0;
        thisMonthStats.forEach((r) => {
            if (r._id.type === "expense") {
                categoryMap[r._id.category] = (categoryMap[r._id.category] || 0) + r.total;
                totalExpenses += r.total;
                expenseCount += r.count;
            } else {
                totalIncome += r.total;
            }
        });

        const highestEntry = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        const highestCategory = highestEntry ? highestEntry[0] : null;
        const highestCategoryAmount = highestEntry ? parseFloat(highestEntry[1].toFixed(2)) : 0;
        const savingsRate = totalIncome > 0
            ? parseFloat(((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1))
            : 0;
        const avgTransaction = expenseCount > 0
            ? parseFloat((totalExpenses / expenseCount).toFixed(2))
            : 0;

        res.json({ avgMonthlySpending, highestCategory, highestCategoryAmount, savingsRate, totalIncome, totalExpenses: parseFloat(totalExpenses.toFixed(2)), expenseCount, avgTransaction });
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

        const results = await Transaction.aggregate([
            { $match: { user: userId, type: "expense", date: { $gte: startDate } } },
            { $group: {
                _id: { year: { $year: "$date" }, month: { $month: "$date" } },
                spending: { $sum: "$amount" },
            }},
        ]);

        const monthMap = {};
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString("en-US", { month: "short" });
            monthMap[key] = 0;
        }

        results.forEach((r) => {
            const d = new Date(r._id.year, r._id.month - 1, 1);
            const key = d.toLocaleDateString("en-US", { month: "short" });
            if (key in monthMap) monthMap[key] = r.spending;
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
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const signedAmount = {
            $cond: [{ $eq: ["$type", "income"] }, "$amount", { $multiply: ["$amount", -1] }],
        };

        const [balanceAgg, thisMonthAgg, lastMonthAgg, budgets] = await Promise.all([
            Transaction.aggregate([
                { $match: { user: userId } },
                { $group: {
                    _id: null,
                    totalBalance: { $sum: signedAmount },
                    balanceLastMonth: {
                        $sum: {
                            $cond: [
                                { $lte: ["$date", lastMonthEnd] },
                                signedAmount,
                                0,
                            ],
                        },
                    },
                }},
            ]),
            Transaction.aggregate([
                { $match: { user: userId, date: { $gte: thisMonthStart } } },
                { $group: { _id: "$type", total: { $sum: "$amount" } } },
            ]),
            Transaction.aggregate([
                { $match: { user: userId, date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
                { $group: { _id: "$type", total: { $sum: "$amount" } } },
            ]),
            Budget.find({ user: userId }).lean(),
        ]);

        const totalBalance    = balanceAgg[0]?.totalBalance || 0;
        const balanceLastMonth = balanceAgg[0]?.balanceLastMonth || 0;
        const balanceChange   = balanceLastMonth !== 0
            ? parseFloat(((totalBalance - balanceLastMonth) / Math.abs(balanceLastMonth) * 100).toFixed(1))
            : null;

        const thisMonth = Object.fromEntries(thisMonthAgg.map((r) => [r._id, r.total]));
        const monthlySpending = thisMonth["expense"] || 0;
        const monthlyIncome   = thisMonth["income"] || 0;
        const savingsRate     = monthlyIncome > 0
            ? parseFloat(((monthlyIncome - monthlySpending) / monthlyIncome * 100).toFixed(1))
            : 0;

        const lastMonth = Object.fromEntries(lastMonthAgg.map((r) => [r._id, r.total]));
        const lastMonthSpending = lastMonth["expense"] || 0;
        const lastMonthIncome   = lastMonth["income"] || 0;
        const spendingChange    = lastMonthSpending > 0
            ? parseFloat(((monthlySpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(1))
            : null;
        const lastSavingsRate   = lastMonthIncome > 0
            ? parseFloat(((lastMonthIncome - lastMonthSpending) / lastMonthIncome * 100).toFixed(1))
            : null;
        const savingsRateChange = lastSavingsRate !== null
            ? parseFloat((savingsRate - lastSavingsRate).toFixed(1))
            : null;

        // Reduce N budget queries to at most 3 (one per period type)
        const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
        let totalSpent = 0;
        if (budgets.length > 0) {
            const periodGroups = {};
            budgets.forEach((b) => {
                if (!periodGroups[b.period]) periodGroups[b.period] = [];
                periodGroups[b.period].push(b);
            });

            const spentResults = await Promise.all(
                Object.entries(periodGroups).map(async ([period, periodBudgets]) => {
                    let start;
                    if (period === "weekly") {
                        start = new Date(now);
                        start.setDate(now.getDate() - now.getDay());
                        start.setHours(0, 0, 0, 0);
                    } else if (period === "yearly") {
                        start = new Date(now.getFullYear(), 0, 1);
                    } else {
                        start = new Date(now.getFullYear(), now.getMonth(), 1);
                    }

                    const hasAll = periodBudgets.some((b) => b.category === "all");
                    const categories = periodBudgets.filter((b) => b.category !== "all").map((b) => b.category);
                    const matchFilter = { user: userId, type: "expense", date: { $gte: start } };
                    if (!hasAll && categories.length > 0) matchFilter.category = { $in: categories };

                    const results = await Transaction.aggregate([
                        { $match: matchFilter },
                        { $group: { _id: "$category", spent: { $sum: "$amount" } } },
                    ]);

                    const categorySpending = Object.fromEntries(results.map((r) => [r._id, r.spent]));
                    const periodTotal = results.reduce((s, r) => s + r.spent, 0);

                    return periodBudgets.reduce((s, b) =>
                        s + (b.category === "all" ? periodTotal : (categorySpending[b.category] || 0)), 0);
                })
            );
            totalSpent = spentResults.reduce((s, r) => s + r, 0);
        }
        const budgetStatus = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        res.json({
            totalBalance:    parseFloat(totalBalance.toFixed(2)),
            balanceChange,
            monthlySpending: parseFloat(monthlySpending.toFixed(2)),
            spendingChange,
            savingsRate,
            savingsRateChange,
            budgetStatus,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPredictions = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const end   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

        const transactions = await Transaction.find({
            user: userId,
            type: "expense",
            date: { $gte: start, $lte: end },
        });

        const categoryMonths = {};
        transactions.forEach((tx) => {
            const d = new Date(tx.date);
            const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth()) - 1;
            if (monthsAgo < 0 || monthsAgo > 2) return;
            const idx = 2 - monthsAgo;
            if (!categoryMonths[tx.category]) categoryMonths[tx.category] = [0, 0, 0];
            categoryMonths[tx.category][idx] += tx.amount;
        });

        const predictions = Object.entries(categoryMonths)
            .map(([category, months]) => {
                const lastMonth = months[2];
                if (lastMonth === 0) return null;
                const weighted = months[2] * 0.5 + months[1] * 0.3 + months[0] * 0.2;
                const prevAvg = (months[0] + months[1]) / 2;
                const trend = prevAvg > 0 ? (months[2] - prevAvg) / prevAvg : 0;
                const predicted = parseFloat((weighted * (1 + trend * 0.3)).toFixed(2));
                const changePercent = lastMonth > 0
                    ? parseFloat(((predicted - lastMonth) / lastMonth * 100).toFixed(1))
                    : 0;
                return { category, lastMonth: parseFloat(lastMonth.toFixed(2)), predicted, changePercent };
            })
            .filter(Boolean)
            .sort((a, b) => b.lastMonth - a.lastMonth)
            .slice(0, 6);

        res.json(predictions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const range = req.query.range || "7d";

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

        const groupId = range === "7d"
            ? { year: { $year: "$date" }, month: { $month: "$date" }, day: { $dayOfMonth: "$date" } }
            : { year: { $year: "$date" }, month: { $month: "$date" } };

        const results = await Transaction.aggregate([
            { $match: { user: userId, date: { $gte: startDate } } },
            { $group: { _id: { ...groupId, type: "$type" }, total: { $sum: "$amount" } } },
        ]);

        const resultMap = {};
        results.forEach((r) => {
            const date = range === "7d"
                ? new Date(r._id.year, r._id.month - 1, r._id.day)
                : new Date(r._id.year, r._id.month - 1, 1);
            const key = date.toLocaleDateString("en-US", {
                month: "short",
                day: range === "7d" ? "numeric" : undefined,
            });
            if (!resultMap[key]) resultMap[key] = { income: 0, expense: 0 };
            if (r._id.type === "income") resultMap[key].income += r.total;
            else resultMap[key].expense += r.total;
        });

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

export const getYearOverYear = async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();
        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd   = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

        const [thisYearData, lastYearData] = await Promise.all([
            Transaction.aggregate([
                { $match: { user: userId, type: "expense", date: { $gte: thisYearStart } } },
                { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } },
            ]),
            Transaction.aggregate([
                { $match: { user: userId, type: "expense", date: { $gte: lastYearStart, $lte: lastYearEnd } } },
                { $group: { _id: { $month: "$date" }, total: { $sum: "$amount" } } },
            ]),
        ]);

        const hasLastYearData = lastYearData.length > 0;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const thisYearMap = Object.fromEntries(thisYearData.map((r) => [r._id, r.total]));
        const lastYearMap = Object.fromEntries(lastYearData.map((r) => [r._id, r.total]));

        const currentMonth = now.getMonth() + 1;
        const data = monthNames.slice(0, currentMonth).map((month, i) => ({
            month,
            thisYear: parseFloat((thisYearMap[i + 1] || 0).toFixed(2)),
            lastYear: parseFloat((lastYearMap[i + 1] || 0).toFixed(2)),
        }));

        res.json({ data, hasLastYearData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};