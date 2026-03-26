import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAppearance } from "../context/AppearanceContext";
import DashboardCategoryChart from "../components/DashboardCategoryChart";
import DashboardTrendChart from "../components/DashboardTrendChart";
import DashboardRecentTransactions from "../components/DashboardRecentTransactions";
import DashboardQuickInsights from "../components/DashboardQuickInsights";
import { getDashboardStats, type DashboardStats } from "../services/analyticsApi";

const StatCard = ({
    title,
    value,
    change,
    changePositive,
    icon,
    iconBg,
    extra,
}: {
    title: string;
    value: string;
    change?: string;
    changePositive?: boolean;
    icon: React.ReactNode;
    iconBg: string;
    extra?: React.ReactNode;
}) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                {icon}
            </div>
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{value}</div>
        {extra}
        {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${changePositive ? "text-[#16a34a]" : "text-red-500"}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                        d={changePositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                </svg>
                <span>{change} vs last month</span>
            </div>
        )}
    </div>
);

const Dashboard = () => {
    const { t, fmt } = useAppearance();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats()
            .then(setStats)
            .catch(() => setStats(null))
            .finally(() => setLoading(false));
    }, []);

    const skeleton = <div className="h-8 w-28 bg-gray-100 rounded-lg animate-pulse mb-2" />;

    return (
        <Layout>
            <div className="space-y-6">

                {/* Page header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t("welcome")}, {user?.name || "John"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t("finances_today")}</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Total Balance */}
                    <StatCard
                        title={t("total_balance")}
                        value={loading ? "—" : (stats ? fmt(stats.totalBalance) : "—")}
                        change={stats?.balanceChange != null ? `${stats.balanceChange > 0 ? "+" : ""}${stats.balanceChange}%` : undefined}
                        changePositive={stats?.balanceChange != null ? stats.balanceChange >= 0 : undefined}
                        iconBg="bg-[#f0fdf4]"
                        icon={
                            <svg className="w-5 h-5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                        extra={loading ? skeleton : undefined}
                    />

                    {/* Monthly Spending */}
                    <StatCard
                        title={t("monthly_spending")}
                        value={loading ? "—" : (stats ? fmt(stats.monthlySpending) : "—")}
                        change={stats?.spendingChange != null ? `${stats.spendingChange > 0 ? "+" : ""}${stats.spendingChange}%` : undefined}
                        changePositive={stats?.spendingChange != null ? stats.spendingChange <= 0 : undefined}
                        iconBg="bg-[#fff1f2]"
                        icon={
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                            </svg>
                        }
                        extra={loading ? skeleton : undefined}
                    />

                    {/* Savings Rate */}
                    <StatCard
                        title={t("savings_rate")}
                        value={loading ? "—" : (stats ? `${stats.savingsRate}%` : "—")}
                        change={stats?.savingsRateChange != null ? `${stats.savingsRateChange > 0 ? "+" : ""}${stats.savingsRateChange}pp` : undefined}
                        changePositive={stats?.savingsRateChange != null ? stats.savingsRateChange >= 0 : undefined}
                        iconBg="bg-[#eff6ff]"
                        icon={
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                        extra={loading ? skeleton : undefined}
                    />

                    {/* Budget Usage */}
                    <StatCard
                        title={t("budget_status")}
                        value={loading ? "—" : (stats ? `${stats.budgetStatus}%` : "—")}
                        iconBg="bg-[#fff7ed]"
                        icon={
                            <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth={1.8} />
                                <circle cx="12" cy="12" r="6" strokeWidth={1.8} />
                                <circle cx="12" cy="12" r="2" strokeWidth={1.8} />
                            </svg>
                        }
                        extra={
                            loading ? skeleton : (
                                <div className="mb-2">
                                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#22c55e] rounded-full transition-all"
                                            style={{ width: `${Math.min(stats?.budgetStatus ?? 0, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    />
                </div>

                {/* Charts row — Spending Trend (wide) + Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3">
                        <DashboardTrendChart />
                    </div>
                    <div className="lg:col-span-2">
                        <DashboardCategoryChart />
                    </div>
                </div>

                {/* Widgets row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DashboardRecentTransactions />
                    <DashboardQuickInsights />
                </div>

            </div>
        </Layout>
    );
};

export default Dashboard;
