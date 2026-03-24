import API from "./api";

export type AnalyticsItem = {
    label: string;
    income: number;
    expenses: number;
    savings: number;
};

export const getAnalytics = async (range: string = "7d") => {
    const { data } = await API.get(`/analytics?range=${range}`);
    return data as AnalyticsItem[];
};