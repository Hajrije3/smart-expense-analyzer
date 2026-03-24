import Layout from "../components/Layout";
import Table from "../components/Table.tsx";
import { transactionColumns } from "../components/columns/transactionsColumns.tsx";
import { useDeleteTransaction, useTransactions } from "../hooks/useTransactions.ts";
import { useState } from "react";
import TransactionForm from "../components/TransactionForm.tsx";
import Modal from "../components/Modal.tsx";
import type { Transaction } from "../types/transaction.ts";
import { useAppearance } from "../context/AppearanceContext";

const Transactions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
    const { t, fmt } = useAppearance();

    const {
        transactions, page, pages, setPage,
        search, setSearch, type, setType,
        category, setCategory, refetch,
    } = useTransactions();

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
            <div className="space-y-6">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("transactions")}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t("track_manage")}</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 border dark:border-gray-600 dark:text-gray-300 rounded-lg">
                            {t("export")}
                        </button>
                        <button
                            onClick={() => { setSelectedTransaction(null); setIsOpen(true); }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                        >
                            {t("add_transaction")}
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex gap-4">
                    <input
                        placeholder={t("search")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg px-4 py-2"
                    />
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
                    >
                        <option value="all">{t("all")}</option>
                        <option value="income">{t("income")}</option>
                        <option value="expense">{t("expense")}</option>
                    </select>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2"
                    >
                        <option value="all">{t("all_categories")}</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                    </select>
                </div>

                {/* TABLE */}
                <Table
                    columns={transactionColumns(handleEdit, handleDelete, fmt, t)}
                    data={transactions}
                    page={page}
                    pages={pages}
                    onPageChange={setPage}
                />

                {/* ADD/EDIT MODAL */}
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    <TransactionForm
                        transaction={selectedTransaction || undefined}
                        onSuccess={() => { setIsOpen(false); refetch(); }}
                    />
                </Modal>

                {/* DELETE MODAL */}
                <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("delete_transaction")}</h2>
                        <p className="text-gray-500 dark:text-gray-400">{t("delete_tx_confirm")}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 border dark:border-gray-600 dark:text-gray-300 rounded-lg"
                            >
                                {t("cancel")}
                            </button>
                            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">
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
