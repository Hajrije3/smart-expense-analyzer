import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

type Insight = {
    type: "warning" | "alert" | "positive" | "tip";
    title: string;
    description: string;
};

const cardStyle: Record<Insight["type"], string> = {
    positive: "bg-[#f0fdf4] border border-[#bbf7d0]",
    tip:      "bg-[#eff6ff] border border-[#bfdbfe]",
    warning:  "bg-[#fefce8] border border-[#fde68a]",
    alert:    "bg-[#faf5ff] border border-[#e9d5ff]",
};

const titleStyle: Record<Insight["type"], string> = {
    positive: "text-gray-900",
    tip:      "text-gray-900",
    warning:  "text-gray-900",
    alert:    "text-gray-900",
};

const descStyle: Record<Insight["type"], string> = {
    positive: "text-gray-600",
    tip:      "text-gray-600",
    warning:  "text-gray-600",
    alert:    "text-gray-600",
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
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Key Insights</h2>
                <button
                    onClick={() => navigate("/insights")}
                    className="text-sm text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors"
                >
                    View All
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                </div>
            ) : insights.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No insights available</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {insights.slice(0, 4).map((insight, i) => (
                        <div
                            key={i}
                            className={`rounded-xl p-4 ${cardStyle[insight.type] ?? cardStyle.tip}`}
                        >
                            <p className={`font-bold text-sm mb-1.5 ${titleStyle[insight.type]}`}>
                                {insight.title}
                            </p>
                            <p className={`text-sm leading-relaxed ${descStyle[insight.type]}`}>
                                {insight.description}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardQuickInsights;
