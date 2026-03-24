import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getCategoryBreakdown, type CategoryBreakdownItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const COLORS = ["#10b981", "#f97316", "#ef4444", "#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899"];

const DashboardCategoryChart = () => {
    const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt } = useAppearance();

    useEffect(() => {
        getCategoryBreakdown()
            .then((r) => setBreakdown(r.breakdown))
            .catch(() => setBreakdown([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Spending by Category</h2>
            <p className="text-sm text-indigo-500 mb-4">Distribution of your expenses this month</p>

            {loading ? (
                <div className="h-56 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
            ) : breakdown.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">No expense data this month</p>
            ) : (
                <>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakdown}
                                    dataKey="amount"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={95}
                                    strokeWidth={2}
                                >
                                    {breakdown.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => fmt(Number(v))} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3">
                        {breakdown.map((item, i) => (
                            <div key={item.category} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                                    />
                                    <span className="text-gray-600 dark:text-gray-300">{item.category}</span>
                                </div>
                                <span className="font-medium text-gray-800 dark:text-gray-200 ml-2">{fmt(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardCategoryChart;
