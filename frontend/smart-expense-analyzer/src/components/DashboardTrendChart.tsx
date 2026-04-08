import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip,
    CartesianGrid, ResponsiveContainer, Dot,
} from "recharts";
import { getAnalytics, type AnalyticsItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const DashboardTrendChart = () => {
    const [data, setData] = useState<AnalyticsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt, t } = useAppearance();

    useEffect(() => {
        getAnalytics("6m")
            .then(setData)
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 h-full">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t("spending_trend")}</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">{t("last_6_months")}</p>

            {loading ? (
                <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
            ) : data.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-16">{t("no_data")}</p>
            ) : (
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                            <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                            <Line
                                type="monotone"
                                dataKey="expenses"
                                name="Spending"
                                stroke="#22c55e"
                                strokeWidth={2.5}
                                dot={<Dot r={4} fill="#22c55e" stroke="#fff" strokeWidth={2} />}
                                activeDot={{ r: 6, fill: "#22c55e" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default DashboardTrendChart;
