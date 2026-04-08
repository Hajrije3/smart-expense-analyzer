import { useEffect, useState } from "react";
import { getSummaryStats, type SummaryStats as SummaryStatsData } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

type StatCardProps = {
    title: string;
    value: string;
    sub: string;
    subPositive?: boolean;
    subIsText?: boolean;
};

const StatCard = ({ title, sub, subPositive, subIsText, value }: StatCardProps) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{value}</p>
        {subIsText ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{sub}</p>
        ) : (
            <div className={`flex items-center gap-1 text-sm font-medium ${subPositive ? "text-[#16a34a]" : "text-[#16a34a]"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d={subPositive
                            ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                </svg>
                <span>{sub}</span>
            </div>
        )}
    </div>
);

const SummaryStats = () => {
    const [stats, setStats] = useState<SummaryStatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { fmt, t } = useAppearance();

    useEffect(() => {
        getSummaryStats().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const daysElapsed = new Date().getDate();
    const avgDaily = stats.avgMonthlySpending > 0 ? stats.avgMonthlySpending / daysElapsed : 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title={t("avg_daily_spending")}
                value={fmt(avgDaily)}
                sub="-5.2%"
                subPositive={false}
            />
            <StatCard
                title={t("top_category")}
                value={stats.highestCategory ?? "—"}
                sub={stats.highestCategoryAmount > 0 ? `${fmt(stats.highestCategoryAmount)} ${t("this_month")}` : t("no_data")}
                subIsText
            />
            <StatCard
                title={t("transactions")}
                value={stats.expenseCount > 0 ? `${stats.expenseCount}` : "—"}
                sub={t("this_month")}
                subIsText
            />
            <StatCard
                title={t("avg_transaction")}
                value={stats.avgTransaction > 0 ? fmt(stats.avgTransaction) : "—"}
                sub={t("per_expense_month")}
                subIsText
            />
        </div>
    );
};

export default SummaryStats;
