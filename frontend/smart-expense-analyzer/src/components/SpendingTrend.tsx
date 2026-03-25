import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    CartesianGrid, ResponsiveContainer, Dot,
} from "recharts";
import { getSpendingTrend, type SpendingTrendItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const SpendingTrend = () => {
    const [data, setData] = useState<SpendingTrendItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt } = useAppearance();

    useEffect(() => {
        getSpendingTrend().then(setData).catch(() => setData([])).finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">6-Month Spending Trend</h2>
            <p className="text-sm text-blue-400 mb-5">Track your spending over time</p>

            {loading ? (
                <div className="h-72 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-16">No data available</p>
            ) : (
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                formatter={(v) => [fmt(Number(v)), "Spending"]}
                                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="spending"
                                name="Spending"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                dot={<Dot r={5} fill="#22c55e" stroke="#fff" strokeWidth={2} />}
                                activeDot={{ r: 7, fill: "#22c55e" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default SpendingTrend;
