import Layout from "../components/Layout";
import AnalyticsChart from "../components/AnalyticsChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import SummaryStats from "../components/SummaryStats";
import SpendingTrend from "../components/SpendingTrend";
import DashboardQuickInsights from "../components/DashboardQuickInsights";
import { useAnalytics } from "../hooks/useAnalytics";
import { useAppearance } from "../context/AppearanceContext";

const Analytics = () => {
    const { data, loading } = useAnalytics("1y");
    const { t } = useAppearance();

    return (
        <Layout>
            <div className="space-y-6">

                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("analytics")}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t("deep_dive")}</p>
                </div>

                <SummaryStats />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 h-80 animate-pulse" />
                        ) : (
                            <AnalyticsChart data={data || []} />
                        )}
                    </div>
                    <div className="lg:col-span-2">
                        <CategoryBreakdown />
                    </div>
                </div>

                <SpendingTrend />

                <DashboardQuickInsights />

            </div>
        </Layout>
    );
};

export default Analytics;
