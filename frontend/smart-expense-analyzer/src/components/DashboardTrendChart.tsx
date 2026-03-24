import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend,
    CartesianGrid, ResponsiveContainer, Dot,
} from "recharts";
import { getAnalytics, type AnalyticsItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const DashboardTrendChart = () => {
    const [data, setData] = useState<AnalyticsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt } = useAppearance();

    useEffect(() => {
        getAnalytics("1y")
            .then(setData)
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Monthly Spending Trend</h2>
            <p className="text-sm text-orange-400 mb-4">Income vs Expenses over time</p>

            {loading ? (
                <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">No data available</p>
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical horizontal />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => fmt(Number(v))} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="income"
                                name="Income"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                dot={<Dot r={4} fill="#10b981" stroke="#10b981" />}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Spending"
                                stroke="#6366f1"
                                strokeWidth={2.5}
                                dot={<Dot r={4} fill="#6366f1" stroke="#6366f1" />}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default DashboardTrendChart;
