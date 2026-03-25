import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getInsights, type InsightsResponse, type InsightItem, type Recommendation } from "../services/insightsApi";
import { getPredictions, type PredictionItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

// ── Icons ─────────────────────────────────────────────────────────────────────

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/>
        <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75z"/>
        <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z"/>
    </svg>
);

const TrendUpIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
    </svg>
);

const WarningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

const BulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18"/>
        <line x1="10" y1="22" x2="14" y2="22"/>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
);

const TargetIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
    </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
);

// ── Card config ───────────────────────────────────────────────────────────────

type CardType = "positive" | "warning" | "tip" | "alert";

const cardCfg: Record<CardType, {
    bg: string; border: string; iconBg: string; iconColor: string;
    metricColor: string; actionLabel: string; actionPath: string;
    Icon: () => JSX.Element;
}> = {
    positive: {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        iconBg: "bg-white dark:bg-green-900/40",
        iconColor: "text-green-600",
        metricColor: "text-green-600",
        actionLabel: "View Savings",
        actionPath: "/analytics",
        Icon: TrendUpIcon,
    },
    warning: {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800",
        iconBg: "bg-white dark:bg-yellow-900/40",
        iconColor: "text-orange-500",
        metricColor: "text-orange-500",
        actionLabel: "See Details",
        actionPath: "/analytics",
        Icon: WarningIcon,
    },
    tip: {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        iconBg: "bg-white dark:bg-blue-900/40",
        iconColor: "text-blue-500",
        metricColor: "text-green-600",
        actionLabel: "Optimize",
        actionPath: "/budgets",
        Icon: BulbIcon,
    },
    alert: {
        bg: "bg-teal-50 dark:bg-teal-900/20",
        border: "border-teal-200 dark:border-teal-800",
        iconBg: "bg-white dark:bg-teal-900/40",
        iconColor: "text-teal-600",
        metricColor: "text-teal-600",
        actionLabel: "View Budget",
        actionPath: "/budgets",
        Icon: TargetIcon,
    },
};

// extract a short metric string from insight description (e.g. "8.2%" or "$89")
const extractMetric = (description: string): string => {
    const pct = description.match(/(\+?-?\d+\.?\d*%)/);
    if (pct) return pct[1].startsWith("+") || pct[1].startsWith("-") ? pct[1] : "+" + pct[1];
    const dollar = description.match(/\$[\d,]+(?:\/mo)?/);
    if (dollar) return dollar[0];
    return "";
};

// ── Insight card ─────────────────────────────────────────────────────────────

const InsightCard = ({ insight }: { insight: InsightItem }) => {
    const navigate = useNavigate();
    const cfg = cardCfg[insight.type] ?? cardCfg.tip;
    const { Icon } = cfg;
    const metric = extractMetric(insight.description);

    return (
        <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${cfg.iconBg} ${cfg.iconColor}`}>
                        <Icon />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{insight.title}</p>
                </div>
                {metric && (
                    <span className={`text-sm font-bold flex-shrink-0 ${cfg.metricColor}`}>{metric}</span>
                )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{insight.description}</p>
            <button
                onClick={() => navigate(cfg.actionPath)}
                className="mt-auto text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 text-left transition-colors"
            >
                {cfg.actionLabel} &rsaquo;
            </button>
        </div>
    );
};

// ── Recommendation card (same style) ─────────────────────────────────────────

const RecommendationCard = ({ rec }: { rec: Recommendation }) => {
    const { fmt } = useAppearance();
    const navigate = useNavigate();
    const metric = rec.potentialMonthlySaving && rec.potentialMonthlySaving > 0
        ? `${fmt(rec.potentialMonthlySaving)}/mo`
        : "";
    const cfg = cardCfg.tip;
    const { Icon } = cfg;

    return (
        <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${cfg.iconBg} ${cfg.iconColor}`}>
                        <Icon />
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{rec.title}</p>
                </div>
                {metric && (
                    <span className="text-sm font-bold flex-shrink-0 text-green-600">{metric}</span>
                )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{rec.description}</p>
            <button
                onClick={() => navigate("/budgets")}
                className="mt-auto text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 text-left transition-colors"
            >
                Optimize &rsaquo;
            </button>
        </div>
    );
};

// ── Health score helpers ──────────────────────────────────────────────────────

const healthColor: Record<string, string> = {
    excellent: "text-green-600", good: "text-blue-600",
    fair: "text-yellow-600",     poor: "text-red-500",
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Insights() {
    const { fmt, t } = useAppearance();
    const [data, setData] = useState<InsightsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [question, setQuestion] = useState("");
    const [predictions, setPredictions] = useState<PredictionItem[]>([]);

    useEffect(() => {
        getPredictions().then(setPredictions).catch(() => setPredictions([]));
    }, []);

    const fetchInsights = async (q?: string) => {
        setLoading(true); setError("");
        try { setData(await getInsights(q)); }
        catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? t("no_data"));
        } finally { setLoading(false); }
    };

    const totalSavings = data?.recommendations.reduce((s, r) => s + (r.potentialMonthlySaving ?? 0), 0) ?? 0;
    const oppCount     = data?.recommendations.filter(r => (r.potentialMonthlySaving ?? 0) > 0).length ?? 0;

    // combine all cards: insights first, then recommendations (up to 4 total for grid)
    const allCards = data ? [
        ...data.insights.map(i => ({ kind: "insight" as const, data: i })),
        ...data.recommendations.map(r => ({ kind: "rec" as const, data: r })),
    ] : [];

    return (
        <Layout>
            <div className="space-y-6">

                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SparkleIcon />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Insights</h1>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Personalized recommendations to optimize your finances</p>
                </div>

                {/* Ask + Generate */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        placeholder={t("ask_placeholder")}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && fetchInsights(question || undefined)}
                        className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                        onClick={() => fetchInsights(question || undefined)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
                    >
                        {loading
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <RefreshIcon />
                        }
                        {loading ? t("analyzing") : data ? t("refresh") : t("generate_insights")}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
                )}

                {/* Empty state */}
                {!data && !loading && !error && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                        <div className="flex justify-center mb-4"><SparkleIcon /></div>
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{t("no_insights_title")}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t("no_insights_desc")}</p>
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
                        {[1,2,3,4].map(i => <div key={i} className="h-44 rounded-2xl bg-gray-100 dark:bg-gray-700" />)}
                    </div>
                )}

                {/* Results */}
                {data && !loading && (
                    <>
                        {/* Health + Savings summary row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t("financial_health")}</p>
                                    <p className={`text-2xl font-bold capitalize mt-0.5 ${healthColor[data.financialHealth] ?? "text-gray-800"}`}>
                                        {data.financialHealth}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[180px] line-clamp-2">{data.summary}</p>
                                </div>
                                <div className="w-14 h-14 rounded-full border-4 border-green-100 dark:border-green-900 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl font-bold text-green-600">{data.healthScore}</span>
                                </div>
                            </div>
                            {totalSavings > 0 && (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("potential_savings")}</p>
                                        <p className="text-2xl font-bold text-green-600 mt-0.5">{fmt(totalSavings)}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            {t("based_on_ops")} {oppCount} {oppCount === 1 ? t("opportunity") : t("opportunities")} {t("identified")}
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Insight + Recommendation cards grid */}
                        {allCards.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {allCards.map((card, i) =>
                                    card.kind === "insight"
                                        ? <InsightCard key={i} insight={card.data as InsightItem} />
                                        : <RecommendationCard key={i} rec={card.data as Recommendation} />
                                )}
                            </div>
                        )}

                        {/* Spending Patterns */}
                        {data.spendingPatterns.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">{t("spending_patterns")}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t("spending_patterns_desc")}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                {/* Next Month Predictions */}
                {predictions.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6">
                        <h2 className="font-bold text-gray-900 dark:text-white text-base mb-0.5">Next Month Predictions</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">AI-powered spending forecasts</p>
                        <div className="space-y-3">
                            {predictions.map((p) => (
                                <div key={p.category} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 px-4 py-3">
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{p.category}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Last month: {fmt(p.lastMonth)}</span>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span className={`text-xs font-semibold ${p.changePercent <= 0 ? "text-green-600" : "text-red-500"}`}>
                                                {p.changePercent > 0 ? "+" : ""}{p.changePercent}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Predicted</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{fmt(p.predicted)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
