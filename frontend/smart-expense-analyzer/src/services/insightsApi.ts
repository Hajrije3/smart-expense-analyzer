import API from "./api";

export type InsightItem = {
    type: "positive" | "warning" | "alert" | "tip";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
};

export type Recommendation = {
    title: string;
    description: string;
    potentialMonthlySaving: number | null;
    priority: "high" | "medium" | "low";
};

export type SpendingPattern = {
    pattern: string;
    description: string;
};

export type InsightsResponse = {
    financialHealth: "excellent" | "good" | "fair" | "poor";
    healthScore: number;
    summary: string;
    insights: InsightItem[];
    recommendations: Recommendation[];
    spendingPatterns: SpendingPattern[];
    generatedAt: string;
    dataContext: {
        period: string;
        transactionCount: number;
    };
};

export const getInsights = async (question?: string): Promise<InsightsResponse> => {
    const { data } = await API.post("/insights", question ? { question } : {});
    return data;
};
