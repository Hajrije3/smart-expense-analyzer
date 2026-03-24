import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getCategoryBreakdown, type CategoryBreakdownItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const COLORS = ["#10b981","#f59e0b","#ef4444","#3b82f6","#06b6d4","#8b5cf6","#f97316","#ec4899"];

const CategoryBreakdown = () => {
    const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt, t } = useAppearance();

    useEffect(() => {
        getCategoryBreakdown().then((r) => setBreakdown(r.breakdown)).catch(() => setBreakdown([])).finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("category_breakdown")}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t("where_money_goes")}</p>

            {loading ? (
                <p className="text-gray-400">{t("loading")}</p>
            ) : breakdown.length === 0 ? (
                <p className="text-gray-400">{t("no_expense_data")}</p>
            ) : (
                <>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={breakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={90}
                                    label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`} labelLine>
                                    {breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v) => fmt(Number(v))} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {breakdown.map((item, i) => (
                            <div key={item.category} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-200">{fmt(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default CategoryBreakdown;
