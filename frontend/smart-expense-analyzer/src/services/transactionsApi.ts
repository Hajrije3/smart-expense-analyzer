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
    description?: string;
}) => {
    const { data } = await API.post("/transactions", payload);
    return data;
};

export const updateTransaction = async (
    id: string,
    payload: {
        amount?: number;
        category?: string;
        type?: "income" | "expense";
        description?: string;
    }
) => {
    const { data } = await API.put(`/transactions/${id}`, payload);
    return data;
};

export const deleteTransaction = async (id: string) => {
    const { data } = await API.delete(`/transactions/${id}`);
    return data;
};

export const exportTransactions = async (filters?: {
    search?: string;
    type?: string;
    category?: string;
}) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.category) params.append("category", filters.category);

    const response = await API.get(`/transactions/export?${params.toString()}`, {
        responseType: "blob",
        headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    });
    return response.data as Blob;
};