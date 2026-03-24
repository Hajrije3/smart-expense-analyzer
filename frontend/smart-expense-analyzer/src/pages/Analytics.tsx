import Layout from "../components/Layout";
import AnalyticsChart from "../components/AnalyticsChart";
import { useAnalytics } from "../hooks/useAnalytics";
import { useState } from "react";

const ranges = [
    { label: "7 Days", value: "7d" },
    { label: "1 Month", value: "1m" },
    { label: "3 Months", value: "3m" },
    { label: "6 Months", value: "6m" },
    { label: "1 Year", value: "1y" },
];

const Analytics = () => {
    const [range, setRange] = useState("7d");
    const { data, loading } = useAnalytics(range);

    return (
        <Layout>
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Analytics</h1>
                        <p className="text-gray-500">
                            Deep dive into your spending patterns
                        </p>
                    </div>

                    {/* RANGE FILTER */}
                    <div className="flex gap-2">
                        {ranges.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRange(r.value)}
                                className={`px-4 py-2 rounded-lg border ${
                                    range === r.value
                                        ? "bg-indigo-600 text-white"
                                        : ""
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CHART */}
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <AnalyticsChart data={data || []} />
                )}
            </div>
        </Layout>
    );
};

export default Analytics;