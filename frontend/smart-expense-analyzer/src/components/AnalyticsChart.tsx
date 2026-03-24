import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import type { AnalyticsItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

type Props = { data: AnalyticsItem[] };

const AnalyticsChart = ({ data }: Props) => {
    const { fmt, t } = useAppearance();
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{t("income_vs_expenses")}</h2>
            <p className="text-indigo-500 text-sm mb-4">{t("track_health")}</p>

            <div className="h-[300px] w-full">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barCategoryGap="30%" barGap={4} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v, name) => [fmt(Number(v)), String(name).charAt(0).toUpperCase() + String(name).slice(1)]} />
                            <Legend />
                            <Bar dataKey="income" name={t("income")} radius={[4,4,0,0]}>
                                {data.map((_, i) => <Cell key={i} fill="#10b981" />)}
                            </Bar>
                            <Bar dataKey="expenses" name={t("expense")} radius={[4,4,0,0]}>
                                {data.map((_, i) => <Cell key={i} fill="#ef4444" />)}
                            </Bar>
                            <Bar dataKey="savings" name={t("savings_rate")} radius={[4,4,0,0]}>
                                {data.map((_, i) => <Cell key={i} fill="#6366f1" />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">{t("no_data_period")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsChart;
