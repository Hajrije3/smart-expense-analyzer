import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import type { AnalyticsItem } from "../services/analyticsApi";

type Props = {
    data: AnalyticsItem[];
};

const AnalyticsChart = ({ data }: Props) => {
    const hasData = data && data.length > 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-2">
                Income vs Expenses
            </h2>
            <p className="text-gray-500 mb-4">
                Track your financial health over time
            </p>

            <div className="h-[300px] w-full">
                {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Legend />

                        <Bar dataKey="income" fill="#10b981" />
                        <Bar dataKey="expenses" fill="#ef4444" />
                        <Bar dataKey="savings" fill="#6366f1" />
                    </BarChart>
                </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500">No data available</p>
                    )}
            </div>
        </div>
    );
};
export default AnalyticsChart;