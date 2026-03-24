import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Dot } from "recharts";
import { getSpendingTrend, type SpendingTrendItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const SpendingTrend = () => {
    const [data, setData] = useState<SpendingTrendItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt, t } = useAppearance();

    useEffect(() => {
        getSpendingTrend().then(setData).catch(() => setData([])).finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("spending_trend")}</h2>
            <p className="text-indigo-500 text-sm mb-4">{t("monthly_patterns")}</p>

            {loading ? (
                <p className="text-gray-400">{t("loading")}</p>
            ) : data.length === 0 ? (
                <p className="text-gray-400">{t("no_data")}</p>
            ) : (
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical horizontal />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v) => [fmt(Number(v)), t("spending_trend")]} />
                            <Legend />
                            <Line type="monotone" dataKey="spending" name={t("spending_trend")} stroke="#6366f1" strokeWidth={2.5}
                                dot={<Dot r={5} fill="#6366f1" stroke="#6366f1" />} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default SpendingTrend;
