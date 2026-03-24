import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

type Insight = {
    type: "warning" | "alert" | "positive" | "tip";
    title: string;
    description: string;
};

const config = {
    warning: { bar: "bg-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", title: "text-gray-900 dark:text-white", desc: "text-gray-600 dark:text-gray-300" },
    alert:   { bar: "bg-red-400",    bg: "bg-red-50 dark:bg-red-900/20",       title: "text-gray-900 dark:text-white", desc: "text-gray-600 dark:text-gray-300" },
    positive:{ bar: "bg-green-400",  bg: "bg-green-50 dark:bg-green-900/20",   title: "text-gray-900 dark:text-white", desc: "text-gray-600 dark:text-gray-300" },
    tip:     { bar: "bg-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20",     title: "text-gray-900 dark:text-white", desc: "text-gray-600 dark:text-gray-300" },
};

const DashboardQuickInsights = () => {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/analytics/quick-insights")
            .then((res) => setInsights(res.data))
            .catch(() => setInsights([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Smart Insights</h2>
                <button
                    onClick={() => navigate("/insights")}
                    className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                >
                    View All
                </button>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">AI-powered financial tips</p>

            {loading ? (
                <div className="space-y-3">
                    {[1,2,3].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                    ))}
                </div>
            ) : insights.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No insights available</p>
            ) : (
                <div className="space-y-3">
                    {insights.map((insight, i) => {
                        const c = config[insight.type] ?? config.tip;
                        return (
                            <div key={i} className={`flex gap-0 rounded-xl overflow-hidden ${c.bg}`}>
                                <div className={`w-1.5 flex-shrink-0 ${c.bar}`} />
                                <div className="px-4 py-3">
                                    <p className={`text-sm font-bold ${c.title}`}>{insight.title}</p>
                                    <p className={`text-sm mt-0.5 ${c.desc}`}>{insight.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DashboardQuickInsights;
