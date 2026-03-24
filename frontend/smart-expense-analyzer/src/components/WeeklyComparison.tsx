import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getWeeklyComparison, type WeeklyComparisonResponse } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const WeeklyComparison = () => {
    const [data, setData] = useState<WeeklyComparisonResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const { fmt, t } = useAppearance();

    useEffect(() => {
        getWeeklyComparison().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("weekly_comparison")}</h2>
            <p className="text-sm mb-4">
                <span className="text-gray-500 dark:text-gray-400">{t("this_month_label")}</span>{" "}
                <span className="text-gray-400 dark:text-gray-500">{t("vs_label")}</span>{" "}
                <span className="text-amber-500">{t("last_month_label")}</span>
            </p>

            {loading ? (
                <p className="text-gray-400">{t("loading")}</p>
            ) : !data ? (
                <p className="text-gray-400">{t("no_data")}</p>
            ) : (
                <>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weeks} barCategoryGap="30%">
                                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(v) => fmt(Number(v))} />
                                <Legend />
                                <Bar dataKey="thisMonth" name={t("this_month_label")} fill="#6366f1" radius={[4,4,0,0]} />
                                <Bar dataKey="lastMonth" name={t("last_month_label")} fill="#c7d2fe" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("avg_this_month")}</p>
                            <p className="text-xl font-bold text-indigo-600">{fmt(data.avgThisMonth)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("avg_last_month")}</p>
                            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{fmt(data.avgLastMonth)}</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WeeklyComparison;
