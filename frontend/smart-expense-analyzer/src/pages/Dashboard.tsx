import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAppearance } from "../context/AppearanceContext";
import DashboardCategoryChart from "../components/DashboardCategoryChart";
import DashboardTrendChart from "../components/DashboardTrendChart";
import DashboardRecentTransactions from "../components/DashboardRecentTransactions";
import DashboardQuickInsights from "../components/DashboardQuickInsights";
import { getDashboardStats, type DashboardStats } from "../services/analyticsApi";

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

    const skeletonCls = "h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1";

    return (
        <Layout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {t("welcome")}, {user?.name || "User"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{t("finances_today")}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("total_balance")}</p>
                        {loading ? <div className={skeletonCls} /> : (
                            <h2 className={`text-2xl font-bold mt-1 ${stats && stats.totalBalance >= 0 ? "text-gray-900 dark:text-white" : "text-red-500"}`}>
                                {stats ? fmt(stats.totalBalance) : "—"}
                            </h2>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">All-time net</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("monthly_spending")}</p>
                        {loading ? <div className={skeletonCls} /> : (
                            <h2 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                                {stats ? fmt(stats.monthlySpending) : "—"}
                            </h2>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">This month</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("savings_rate")}</p>
                        {loading ? <div className={skeletonCls} /> : (
                            <h2 className={`text-2xl font-bold mt-1 ${stats && stats.savingsRate >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                {stats ? `${stats.savingsRate}%` : "—"}
                            </h2>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Income vs expenses</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t("budget_status")}</p>
                        {loading ? <div className={skeletonCls} /> : (
                            <h2 className={`text-2xl font-bold mt-1 ${stats && stats.budgetStatus >= 90 ? "text-red-500" : stats && stats.budgetStatus >= 70 ? "text-yellow-500" : "text-gray-900 dark:text-white"}`}>
                                {stats ? `${stats.budgetStatus}%` : "—"}
                            </h2>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Of budgets used</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCategoryChart />
                    <DashboardTrendChart />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardRecentTransactions />
                    <DashboardQuickInsights />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
