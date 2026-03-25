import API from "./api";

export type AnalyticsItem = {
    label: string;
    income: number;
    expenses: number;
    savings: number;
};

export type CategoryBreakdownItem = {
    category: string;
    amount: number;
    percentage: number;
};

export type CategoryBreakdownResponse = {
    breakdown: CategoryBreakdownItem[];
    total: number;
};

export type WeeklyComparisonWeek = {
    week: string;
    thisMonth: number;
    lastMonth: number;
};

export type WeeklyComparisonResponse = {
    weeks: WeeklyComparisonWeek[];
    avgThisMonth: number;
    avgLastMonth: number;
};

export const getAnalytics = async (range: string = "7d") => {
    const { data } = await API.get(`/analytics?range=${range}`);
    return data as AnalyticsItem[];
};

export const getCategoryBreakdown = async (): Promise<CategoryBreakdownResponse> => {
    const { data } = await API.get("/analytics/category-breakdown");
    return data;
};

export const getWeeklyComparison = async (): Promise<WeeklyComparisonResponse> => {
    const { data } = await API.get("/analytics/weekly-comparison");
    return data;
};

export type SpendingTrendItem = {
    month: string;
    spending: number;
};

export const getSpendingTrend = async (): Promise<SpendingTrendItem[]> => {
    const { data } = await API.get("/analytics/spending-trend");
    return data;
};

export type SummaryStats = {
    avgMonthlySpending: number;
    highestCategory: string | null;
    highestCategoryAmount: number;
    savingsRate: number;
    totalIncome: number;
};

export const getSummaryStats = async (): Promise<SummaryStats> => {
    const { data } = await API.get("/analytics/summary-stats");
    return data;
};

export type DashboardStats = {
    totalBalance: number;
    monthlySpending: number;
    savingsRate: number;
    budgetStatus: number;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const { data } = await API.get("/analytics/dashboard-stats");
    return data;
};

export type PredictionItem = {
    category: string;
    lastMonth: number;
    predicted: number;
    changePercent: number;
};

export const getPredictions = async (): Promise<PredictionItem[]> => {
    const { data } = await API.get("/analytics/predictions");
    return data;
};