import { useState } from "react";
import Layout from "../components/Layout";
import { getInsights, type InsightsResponse, type InsightItem, type Recommendation } from "../services/insightsApi";
import { useAppearance } from "../context/AppearanceContext";

// ── Icon helpers ──────────────────────────────────────────────────────────────

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
);

const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const TrendUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const TipIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
);

// ── Insight type config ───────────────────────────────────────────────────────

const insightConfig = {
    warning: {
        border: "border-orange-400",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        iconBg: "bg-orange-100 dark:bg-orange-900/40",
        iconColor: "text-orange-500",
        titleColor: "text-orange-700 dark:text-orange-400",
        descColor: "text-orange-600 dark:text-orange-400",
        Icon: WarningIcon,
    },
    alert: {
        border: "border-red-400",
        bg: "bg-red-50 dark:bg-red-900/20",
        iconBg: "bg-red-100 dark:bg-red-900/40",
        iconColor: "text-red-500",
        titleColor: "text-red-700 dark:text-red-400",
        descColor: "text-red-600 dark:text-red-400",
        Icon: AlertIcon,
    },
    positive: {
        border: "border-green-400",
        bg: "bg-green-50 dark:bg-green-900/20",
        iconBg: "bg-green-100 dark:bg-green-900/40",
        iconColor: "text-green-600",
        titleColor: "text-green-700 dark:text-green-400",
        descColor: "text-green-600 dark:text-green-400",
        Icon: TrendUpIcon,
    },
    tip: {
        border: "border-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        titleColor: "text-indigo-700 dark:text-indigo-400",
        descColor: "text-indigo-600 dark:text-indigo-400",
        Icon: TipIcon,
    },
};

const healthColor: Record<string, string> = {
    excellent: "text-green-600",
    good: "text-indigo-600",
    fair: "text-yellow-600",
    poor: "text-red-500",
};


// ── Sub-components ────────────────────────────────────────────────────────────

const InsightCard = ({ insight }: { insight: InsightItem }) => {
    const cfg = insightConfig[insight.type] ?? insightConfig.tip;
    const { Icon } = cfg;
    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border-l-4 ${cfg.border} ${cfg.bg}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
                <Icon />
            </div>
            <div>
                <p className={`font-semibold text-sm ${cfg.titleColor}`}>{insight.title}</p>
                <p className={`text-sm mt-0.5 ${cfg.descColor}`}>{insight.description}</p>
            </div>
        </div>
    );
};

const RecommendationCard = ({ rec }: { rec: Recommendation }) => {
    const { fmt } = useAppearance();
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-750 hover:shadow-sm transition-shadow">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${rec.priority === "high" ? "bg-red-400" : rec.priority === "medium" ? "bg-yellow-400" : "bg-green-400"}`} />
            <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{rec.title}</p>
                    {rec.potentialMonthlySaving != null && rec.potentialMonthlySaving > 0 && (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Save {fmt(rec.potentialMonthlySaving)}/mo
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rec.description}</p>
            </div>
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Insights() {
    const { fmt, t } = useAppearance();
    const [data, setData] = useState<InsightsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [question, setQuestion] = useState("");

    const fetchInsights = async (q?: string) => {
        setLoading(true);
        setError("");
        try {
            const result = await getInsights(q);
            setData(result);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? t("no_data"));
        } finally {
            setLoading(false);
        }
    };

    const totalSavings = data?.recommendations.reduce(
        (sum, r) => sum + (r.potentialMonthlySaving ?? 0),
        0
    ) ?? 0;

    const opportunityCount = data?.recommendations.filter(
        (r) => r.potentialMonthlySaving != null && r.potentialMonthlySaving > 0
    ).length ?? 0;

    return (
        <Layout>
            <div className="space-y-6 max-w-3xl">

                {/* ── Header ── */}
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <SparkleIcon />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("insights")}</h1>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 ml-[52px]">{t("ai_powered")}</p>
                </div>

                {/* ── Ask a question + Generate button ── */}
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder={t("ask_placeholder")}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && fetchInsights(question || undefined)}
                        className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button
                        onClick={() => fetchInsights(question || undefined)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                    >
                        {loading ? (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <RefreshIcon />
                        )}
                        {loading ? t("analyzing") : data ? t("refresh") : t("generate_insights")}
                    </button>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>
                )}

                {/* ── Empty state ── */}
                {!data && !loading && !error && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center text-gray-400 dark:text-gray-500">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                            <div className="text-indigo-400"><SparkleIcon /></div>
                        </div>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{t("no_insights_title")}</p>
                        <p className="text-sm mt-1">{t("no_insights_desc")}</p>
                    </div>
                )}

                {/* ── Loading skeleton ── */}
                {loading && (
                    <div className="space-y-4 animate-pulse">
                        <div className="h-36 bg-indigo-100 rounded-2xl" />
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <div className="h-5 bg-gray-100 rounded w-1/3" />
                            <div className="h-16 bg-gray-100 rounded-xl" />
                            <div className="h-16 bg-gray-100 rounded-xl" />
                            <div className="h-16 bg-gray-100 rounded-xl" />
                        </div>
                    </div>
                )}

                {/* ── Results ── */}
                {data && !loading && (
                    <>
                        {/* Potential Savings Banner */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 p-6 text-white">
                            <div>
                                <p className="text-sm text-white/80 font-medium">{t("ai_powered")}</p>
                                <p className="text-5xl font-bold mt-1">{fmt(totalSavings)}</p>
                                <p className="text-sm text-white/70 mt-2">
                                    {t("based_on_ops")} {opportunityCount} {opportunityCount === 1 ? t("opportunity") : t("opportunities")} {t("identified")}
                                </p>
                            </div>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <DollarIcon />
                            </div>
                        </div>

                        {/* Health Score */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t("financial_health")}</p>
                                <p className={`text-2xl font-bold capitalize mt-0.5 ${healthColor[data.financialHealth] ?? "text-gray-800"}`}>
                                    {data.financialHealth}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{data.summary}</p>
                            </div>
                            <div className="flex-shrink-0 w-16 h-16 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                                <span className="text-xl font-bold text-indigo-600">{data.healthScore}</span>
                            </div>
                        </div>

                        {/* Financial Insights */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("financial_insights")}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("financial_insights_desc")}</p>
                            <div className="space-y-3">
                                {data.insights.map((insight, i) => (
                                    <InsightCard key={i} insight={insight} />
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {data.recommendations.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("recommendations")}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("recommendations_desc")}</p>
                                <div className="space-y-3">
                                    {data.recommendations.map((rec, i) => (
                                        <RecommendationCard key={i} rec={rec} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Spending Patterns */}
                        {data.spendingPatterns.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("spending_patterns")}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("spending_patterns_desc")}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.spendingPatterns.map((sp, i) => (
                                        <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{sp.pattern}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{sp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center pb-2">
                            Generated {new Date(data.generatedAt).toLocaleString()} · Based on {data.dataContext.transactionCount} transactions ({data.dataContext.period})
                        </p>
                    </>
                )}
            </div>
        </Layout>
    );
}
