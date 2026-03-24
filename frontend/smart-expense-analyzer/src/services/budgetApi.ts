import API from "./api";

export type Budget = {
    _id: string;
    user: string;
    category: string;
    amount: number;
    period: "weekly" | "monthly" | "yearly";
    spent: number;
    remaining: number;
    percentUsed: number;
    createdAt: string;
    updatedAt: string;
};

export type BudgetPayload = {
    category: string;
    amount: number;
    period?: "weekly" | "monthly" | "yearly";
};

export const getBudgets = async (): Promise<Budget[]> => {
    const { data } = await API.get("/budgets");
    return data;
};

export const createBudget = async (payload: BudgetPayload): Promise<Budget> => {
    const { data } = await API.post("/budgets", payload);
    return data;
};

export const updateBudget = async (id: string, payload: Partial<BudgetPayload>): Promise<Budget> => {
    const { data } = await API.put(`/budgets/${id}`, payload);
    return data;
};

export const deleteBudget = async (id: string): Promise<void> => {
    await API.delete(`/budgets/${id}`);
};
