import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { getYearOverYear, type YearOverYearItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

const AnalyticsChart = () => {
    const { fmt, t } = useAppearance();
    const [data, setData] = useState<YearOverYearItem[]>([]);
    const [hasLastYear, setHasLastYear] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getYearOverYear()
            .then((res) => {
                setData(res.data);
                setHasLastYear(res.hasLastYearData);
            })
            .catch(() => setData([]))
            .finally(() => setLoading(false));
    }, []);

    const hasData = data.some((d) => d.thisYear > 0 || d.lastYear > 0);
    const currentYear = new Date().getFullYear();

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full">
                <div className="h-72 animate-pulse bg-gray-100 dark:bg-gray-700 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{t("year_over_year_title")}</h2>
            <p className="text-sm text-gray-400 mb-5">{t("monthly_expenses_subtitle")} {currentYear} vs {currentYear - 1}</p>

            <div className="h-72">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barCategoryGap="35%" barGap={3} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#9ca3af" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                formatter={(v, name) => [fmt(Number(v)), String(name)]}
                                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Bar
                                dataKey="thisYear"
                                name={`${currentYear}`}
                                fill="#a7f3d0"
                                radius={[4, 4, 0, 0]}
                            />
                            {hasLastYear && (
                                <Bar
                                    dataKey="lastYear"
                                    name={`${currentYear - 1}`}
                                    fill="#e5e7eb"
                                    radius={[4, 4, 0, 0]}
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">{t("no_data")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsChart;
