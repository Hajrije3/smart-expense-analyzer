import Groq from "groq-sdk";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";

const getGroq = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const lastNMonths = (n) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - n);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
};

const fmt = (n) => `$${Number(n).toFixed(2)}`;

const buildFinancialContext = async (userId) => {
    const { start, end } = lastNMonths(3);

    const transactions = await Transaction.find({
        user: userId,
        date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const monthlyAgg = await Transaction.aggregate([
        { $match: { user: userId, date: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: {
                    year: { $year: "$date" },
                    month: { $month: "$date" },
                    type: "$type",
                },
                total: { $sum: "$amount" },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const categoryAgg = await Transaction.aggregate([
        {
            $match: {
                user: userId,
                type: "expense",
                date: { $gte: start, $lte: end },
            },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
    ]);

    const budgets = await Budget.find({ user: userId });
    const nowStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const nowEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const budgetStatus = await Promise.all(
        budgets.map(async (b) => {
            const res = await Transaction.aggregate([
                {
                    $match: {
                        user: userId,
                        type: "expense",
                        date: { $gte: nowStart, $lte: nowEnd },
                        ...(b.category !== "all" ? { category: b.category } : {}),
                    },
                },
                { $group: { _id: null, spent: { $sum: "$amount" } } },
            ]);
            const spent = res[0]?.spent || 0;
            return {
                category: b.category,
                budgetLimit: b.amount,
                period: b.period,
                spent,
                percentUsed: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
            };
        })
    );

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate =
        totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : "0";

    const monthlyMap = {};
    for (const row of monthlyAgg) {
        const key = `${row._id.year}-${String(row._id.month).padStart(2, "0")}`;
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expenses: 0 };
        monthlyMap[key][row._id.type === "income" ? "income" : "expenses"] = row.total;
    }

    const monthlySummary = Object.entries(monthlyMap).map(([month, data]) => ({
        month,
        income: fmt(data.income),
        expenses: fmt(data.expenses),
        net: fmt(data.income - data.expenses),
    }));

    const topCategories = categoryAgg.slice(0, 6).map((c) => ({
        category: c._id,
        total: fmt(c.total),
    }));

    return {
        period: "Last 3 months",
        totalIncome: fmt(totalIncome),
        totalExpenses: fmt(totalExpenses),
        netSavings: fmt(netSavings),
        savingsRate: `${savingsRate}%`,
        transactionCount: transactions.length,
        monthlySummary,
        topSpendingCategories: topCategories,
        budgetStatus,
    };
};

export const getInsights = async (req, res) => {
    try {
        const financialData = await buildFinancialContext(req.user._id);

        if (financialData.transactionCount === 0) {
            return res.status(200).json({
                financialHealth: "unknown",
                healthScore: null,
                summary:
                    "No transaction data found for the past 3 months. Add some transactions to get personalized insights.",
                insights: [],
                recommendations: [],
                spendingPatterns: [],
            });
        }

        const userQuestion = req.body?.question || null;

        const systemPrompt = `You are an expert personal finance advisor. You will analyze a user's financial data and provide personalized, actionable insights. Always respond with a valid JSON object — no markdown fences, no extra text outside the JSON.

Required JSON schema:
{
  "financialHealth": "excellent" | "good" | "fair" | "poor",
  "healthScore": number (0-100),
  "summary": string (2-3 sentences, conversational tone),
  "insights": [
    {
      "type": "positive" | "warning" | "alert" | "tip",
      "title": string,
      "description": string,
      "impact": "high" | "medium" | "low"
    }
  ],
  "recommendations": [
    {
      "title": string,
      "description": string,
      "potentialMonthlySaving": number | null,
      "priority": "high" | "medium" | "low"
    }
  ],
  "spendingPatterns": [
    {
      "pattern": string,
      "description": string
    }
  ]
}

Rules:
- Insights array: 3-6 items covering positives, warnings, and tips
- Recommendations array: 3-5 actionable items, ordered by priority
- Spending patterns: 2-4 observable patterns from the data
- Be specific — reference actual numbers from the data
- Be empathetic and constructive, never judgmental`;

        const userMessage = `Here is my financial data for the past 3 months:

${JSON.stringify(financialData, null, 2)}

${userQuestion ? `My specific question: ${userQuestion}` : "Please provide a comprehensive financial analysis with actionable recommendations."}`;

        const response = await getGroq().chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
            ],
            max_tokens: 4096,
            temperature: 0.7,
        });

        const text = response.choices[0]?.message?.content || "";

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                parsed = JSON.parse(match[0]);
            } else {
                throw new Error("Could not parse AI response as JSON");
            }
        }

        res.json({
            ...parsed,
            generatedAt: new Date().toISOString(),
            dataContext: {
                period: financialData.period,
                transactionCount: financialData.transactionCount,
            },
        });
    } catch (err) {
        console.error("Insights error:", err);
        res.status(500).json({ message: err.message });
    }
};
