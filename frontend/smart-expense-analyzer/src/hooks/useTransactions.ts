import { useEffect, useState } from "react";
import { getTransactions } from "../services/transactionsApi";
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
    };
};