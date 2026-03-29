import { useEffect, useState } from "react";
import { getAnalytics, type AnalyticsItem } from "../services/analyticsApi";

export const useAnalytics = (range: string = "7d") => {
    const [data, setData] = useState<AnalyticsItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await getAnalytics(range);
            setData(res || []);
        } catch (err) {
            console.error(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [range]);
    console.log("DATA:", data);
    return { data, loading, refetch: fetchAnalytics };
};