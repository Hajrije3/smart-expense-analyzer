import API from "./api";
import type { Transaction } from "../types/transaction";

export type TransactionsResponse = {
    transactions: Transaction[];
    page: number;
    pages: number;
    total: number;
};

export const getTransactions = async (
    page: number,
    limit: number = 5,
    filters?: {
        search?: string;
        type?: string;
        category?: string;
    }
) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    if (filters?.search) params.append("search", filters.search);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.category) params.append("category", filters.category);

    const { data } = await API.get(`/transactions?${params.toString()}`);
    return data;
};
export const createTransaction = async (payload: {
    amount: number;
    category: string;
    type: "income" | "expense";
}) => {
    const { data } = await API.post("/transactions", payload);
    return data;
};