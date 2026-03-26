import Layout from "../components/Layout";
import { useDeleteTransaction, useTransactions } from "../hooks/useTransactions.ts";
import { useEffect, useState } from "react";
import TransactionForm from "../components/TransactionForm.tsx";
import Modal from "../components/Modal.tsx";
import type { Transaction } from "../types/transaction.ts";
import { useAppearance } from "../context/AppearanceContext";
import { exportTransactions } from "../services/transactionsApi.ts";
import { fetchCategories, type Category } from "../services/categoriesApi";

const categoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("food") || c.includes("grocer"))
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        );
    if (c.includes("dine") || c.includes("dining") || c.includes("restaur") || c.includes("coffee") || c.includes("cafe"))
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm4-7v3M12 1v3M6 1v3" />
            </svg>
        );
    if (c.includes("transport") || c.includes("gas") || c.includes("car") || c.includes("fuel"))
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 1h6m2-1l2-7h1.5a2 2 0 010 4H17v3" />
            </svg>
        );
    if (c.includes("entertain") || c.includes("stream") || c.includes("movie") || c.includes("netflix"))
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="17 2 12 7 7 2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    if (c.includes("health") || c.includes("medical") || c.includes("pharma"))
        return (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        );
    // default
    return (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );
};

const Transactions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const { t, fmt } = useAppearance();

    const {
        transactions, page, pages, setPage,
        search, setSearch,
        type, setType,
        category, setCategory,
        refetch,
    } = useTransactions();

    useEffect(() => {
        fetchCategories().then(setCategories).catch(() => {});
    }, []);

    const activeFilterCount = (type !== "all" ? 1 : 0) + (category !== "all" ? 1 : 0);

    const clearFilters = () => { setType("all"); setCategory("all"); };

    const handleExport = async () => {
        try {
            const blob = await exportTransactions({ search, type, category });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed:", err);
        }
    };

    const { remove } = useDeleteTransaction();

    const handleEdit = (tx: Transaction) => { setSelectedTransaction(tx); setIsOpen(true); };
    const handleDelete = (id: string) => { setTransactionToDelete(id); setIsDeleteOpen(true); };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await remove(transactionToDelete);
            setIsDeleteOpen(false);
            setTransactionToDelete(null);
            refetch();
        } catch (err) { console.error(err); }
    };

    return (
        <Layout>
            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("transactions")}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t("track_manage")}</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 font-medium">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            {t("export")}
                        </button>
                        <button
                            onClick={() => { setSelectedTransaction(null); setIsOpen(true); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg transition-colors font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            {t("add_transaction")}
                        </button>
                    </div>
                </div>

                {/* Search + Filters bar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            placeholder={t("search")}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="flex-1 text-sm focus:outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
                        />
                        <button
                            onClick={() => setFiltersOpen((o) => !o)}
                            className={`flex items-center gap-2 text-sm font-medium border-l border-gray-200 dark:border-gray-700 pl-4 transition-colors flex-shrink-0 ${filtersOpen || activeFilterCount > 0 ? "text-[#22c55e]" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-[#22c55e] text-white text-xs flex items-center justify-center font-semibold">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Expandable filter panel */}
                    {filtersOpen && (
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-4">

                            {/* Type */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Type</p>
                                <div className="flex flex-wrap gap-2">
                                    {(["all", "income", "expense"] as const).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => { setType(v); setPage(1); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                                type === v
                                                    ? "bg-[#22c55e] border-[#22c55e] text-white"
                                                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#22c55e] hover:text-[#22c55e] dark:hover:text-[#22c55e]"
                                            }`}
                                        >
                                            {v === "all" ? t("all") : v === "income" ? t("income") : t("expense")}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            {categories.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t("col_category")}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => { setCategory("all"); setPage(1); }}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                                category === "all"
                                                    ? "bg-[#22c55e] border-[#22c55e] text-white"
                                                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#22c55e] hover:text-[#22c55e] dark:hover:text-[#22c55e]"
                                            }`}
                                        >
                                            {t("all")}
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat._id}
                                                onClick={() => { setCategory(cat.name); setPage(1); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                                    category === cat.name
                                                        ? "bg-[#22c55e] border-[#22c55e] text-white"
                                                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#22c55e] hover:text-[#22c55e] dark:hover:text-[#22c55e]"
                                                }`}
                                            >
                                                <span>{cat.icon}</span>
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear */}
                            {activeFilterCount > 0 && (
                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline underline-offset-2"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Count */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-white">{transactions.length}</span> transactions
                    {activeFilterCount > 0 && (
                        <span className="ml-2 text-[#22c55e] font-medium">({activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active)</span>
                    )}
                </p>

                {/* Transaction card list */}
                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 py-16 text-center">
                            <p className="text-gray-400 text-sm">No transactions found</p>
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <div
                                key={tx._id}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            >
                                {/* Category icon */}
                                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                    {categoryIcon(tx.category)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {tx.description || tx.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {tx.category}
                                        <span className="mx-1.5">•</span>
                                        {new Date(tx.date).toISOString().slice(0, 10)}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center gap-4 flex-shrink-0">
                                    <span className={`font-semibold text-base ${tx.type === "expense" ? "text-gray-900 dark:text-white" : "text-[#16a34a]"}`}>
                                        {tx.type === "expense" ? "-" : "+"}{fmt(tx.amount)}
                                    </span>

                                    {/* Actions (subtle) */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(tx)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tx._id)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-2">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Prev
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{page} / {pages}</span>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === pages}
                            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* ADD/EDIT MODAL */}
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    <TransactionForm
                        transaction={selectedTransaction || undefined}
                        onSuccess={() => { setIsOpen(false); refetch(); }}
                    />
                </Modal>

                {/* DELETE MODAL */}
                <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white pr-6">{t("delete_transaction")}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t("delete_tx_confirm")}</p>
                        <div className="flex justify-end gap-3 pt-1">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                {t("delete")}
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default Transactions;
