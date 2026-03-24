import Transaction from "../models/Transaction.js";

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