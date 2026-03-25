import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import type { AnalyticsItem } from "../services/analyticsApi";
import { useAppearance } from "../context/AppearanceContext";

type Props = { data: AnalyticsItem[] };

const AnalyticsChart = ({ data }: Props) => {
    const { fmt } = useAppearance();
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 h-full">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Year-over-Year Comparison</h2>
            <p className="text-sm text-gray-400 mb-5">Monthly spending trends</p>

            <div className="h-72">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barCategoryGap="35%" barGap={3} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                            <XAxis
                                dataKey="label"
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
                            <Bar
                                dataKey="expenses"
                                name="This Year"
                                fill="#a7f3d0"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="income"
                                name="Last Year"
                                fill="#e5e7eb"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">No data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsChart;
