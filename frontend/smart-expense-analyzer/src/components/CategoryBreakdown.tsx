import { useEffect, useState } from "react";
import { getCategoryBreakdown, type CategoryBreakdownItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const COLORS: Record<string, string> = {
    groceries: "#22c55e",
    dining: "#3b82f6",
    shopping: "#8b5cf6",
    transportation: "#f59e0b",
    transport: "#f59e0b",
    health: "#ef4444",
    entertainment: "#06b6d4",
    food: "#22c55e",
};

const getColor = (category: string, index: number) => {
    const fallbacks = ["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#f97316", "#ec4899"];
    return COLORS[category.toLowerCase()] ?? fallbacks[index % fallbacks.length];
};

const CategoryBreakdown = () => {
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Spending by Category</h2>
            <p className="text-sm text-gray-400 mb-6">Current month breakdown</p>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                </div>
            ) : breakdown.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-10">No expense data this month</p>
            ) : (
                <div className="space-y-4">
                    {breakdown.map((item, i) => (
                        <div key={item.category} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getColor(item.category, i) }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{fmt(item.amount)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryBreakdown;
