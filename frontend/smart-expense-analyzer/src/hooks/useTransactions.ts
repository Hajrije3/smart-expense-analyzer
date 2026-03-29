import { useEffect, useState } from "react";
import {
    getTransactions,
    createTransaction,
    updateTransaction, deleteTransaction,
} from "../services/transactionsApi";
import type { Transaction } from "../types/transaction";


export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [category, setCategory] = useState("all");

    const fetchTransactions = async () => {
        try {
            setLoading(true);

            const data = await getTransactions(page, 5, {
                search,
                type,
                category,
            });

            setTransactions(data.transactions);
            setPages(data.pages);
            setPage(data.page);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page, search, type, category]);

    return {
        transactions,
        page,
        pages,
        setPage,
        loading,
        search,
        setSearch,
        type,
        setType,
        category,
        setCategory,
        refetch: fetchTransactions,
    };
};


export const useCreateTransaction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const create = async (payload: {
        amount: number;
        category: string;
        type: "income" | "expense";
        description?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const data = await createTransaction(payload);
            return data;

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { create, loading, error };
};


export const useUpdateTransaction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const update = async (
        id: string,
        payload: {
            amount?: number;
            category?: string;
            type?: "income" | "expense";
            description?: string;
        }
    ) => {
        try {
            setLoading(true);
            setError(null);

            const data = await updateTransaction(id, payload);
            return data;

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
};


export const useDeleteTransaction = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const remove = async (id: string) => {
        try {
            setLoading(true);
            setError(null);

            const data = await deleteTransaction(id);
            return data;

        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { remove, loading, error };
};