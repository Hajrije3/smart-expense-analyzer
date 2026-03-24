import Layout from "../components/Layout";
import Table from "../components/Table.tsx";
import { transactionColumns } from "../components/columns/transactionsColumns.tsx";
import {useDeleteTransaction, useTransactions} from "../hooks/useTransactions.ts";
import { useState } from "react";
import TransactionForm from "../components/TransactionForm.tsx";
import Modal from "../components/Modal.tsx";
import type {Transaction} from "../types/transaction.ts";

const Transactions = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

    const {
        transactions,
        page,
        pages,
        setPage,
        search,
        setSearch,
        type,
        setType,
        category,
        setCategory,
        refetch,
    } = useTransactions();

const { remove } = useDeleteTransaction();
    const handleEdit = (tx: any) => {
        setSelectedTransaction(tx);
        setIsOpen(true);
    };

    const handleDelete = (id: string) => {
        setTransactionToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;

        try {
            await remove(transactionToDelete);

            setIsDeleteOpen(false);
            setTransactionToDelete(null);

            refetch(); // 🔥 refresh
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <Layout>
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Transactions</h1>
                        <p className="text-gray-500">
                            Track and manage all your expenses
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 border rounded-lg">
                            Export
                        </button>

                        <button
                            onClick={() => {
                                setSelectedTransaction(null);
                                setIsOpen(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                        >
                            + Add Transaction
                        </button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="bg-white p-4 rounded-xl shadow flex gap-4">
                    <input
                        placeholder="Search transactions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border rounded-lg px-4 py-2"
                    />

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="all">All</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border rounded-lg px-3 py-2"
                    >
                        <option value="all">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                    </select>
                </div>

                {/* TABLE */}
                <Table
                    columns={transactionColumns(handleEdit, handleDelete)} // 👈 pass handler
                    data={transactions}
                    page={page}
                    pages={pages}
                    onPageChange={setPage}
                />

                {/* MODAL */}
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    <TransactionForm
                        transaction={selectedTransaction || undefined}
                        onSuccess={() => {
                            setIsOpen(false);
                            refetch();
                        }}
                    />
                </Modal>
                <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Delete Transaction</h2>

                        <p className="text-gray-500">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 border rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default Transactions;