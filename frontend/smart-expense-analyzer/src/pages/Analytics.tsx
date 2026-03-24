import Layout from "../components/Layout";
import AnalyticsChart from "../components/AnalyticsChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import WeeklyComparison from "../components/WeeklyComparison";
import SpendingTrend from "../components/SpendingTrend";
import SummaryStats from "../components/SummaryStats";
import { useAnalytics } from "../hooks/useAnalytics";
import { useState } from "react";
import { useAppearance } from "../context/AppearanceContext";

const RANGE_KEYS: Record<string, string> = {
    "7d": "range_7d", "1m": "range_1m", "3m": "range_3m", "6m": "range_6m", "1y": "range_1y",
};
const RANGE_VALUES = ["7d", "1m", "3m", "6m", "1y"];

const Analytics = () => {
    const [range, setRange] = useState("7d");
    const { data, loading } = useAnalytics(range);
    const { t } = useAppearance();

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("analytics")}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t("deep_dive")}</p>
                    </div>
                    <div className="flex gap-2">
                        {RANGE_VALUES.map((v) => (
                            <button
                                key={v}
                                onClick={() => setRange(v)}
                                className={`px-4 py-2 rounded-lg border dark:border-gray-600 transition-colors ${
                                    range === v
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                }`}
                            >
                                {t(RANGE_KEYS[v])}
                            </button>
                        ))}
                    </div>
                </div>

                <SummaryStats />

                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-gray-400">Loading...</div>
                ) : (
                    <AnalyticsChart data={data || []} />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CategoryBreakdown />
                    <WeeklyComparison />
                </div>

                <SpendingTrend />
            </div>
        </Layout>
    );
};

export default Analytics;
