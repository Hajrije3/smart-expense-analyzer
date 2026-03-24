import { useEffect, useState } from "react";
import { getSummaryStats, type SummaryStats as SummaryStatsData } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const SummaryStats = () => {
    const [stats, setStats] = useState<SummaryStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { fmt, t } = useAppearance();

    useEffect(() => {
        getSummaryStats().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="h-24 bg-white dark:bg-gray-800 rounded-xl shadow animate-pulse" />;
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("avg_monthly")}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{fmt(stats.avgMonthlySpending)}</p>
                <p className="text-sm text-amber-500 mt-1">{t("based_last_7")}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("highest_category")}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.highestCategory ?? "—"}</p>
                <p className="text-sm text-indigo-500 mt-1">
                    {stats.highestCategoryAmount > 0
                        ? `${fmt(stats.highestCategoryAmount)} ${t("this_month")}`
                        : t("no_expenses_month")}
                </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("savings_rate")}</p>
                <p className="text-3xl font-bold text-emerald-500">{stats.savingsRate}%</p>
                <p className="text-sm text-indigo-500 mt-1">{t("of_monthly_income")}</p>
            </div>
        </div>
    );
};

export default SummaryStats;
