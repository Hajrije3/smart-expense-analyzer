import Layout from "../components/Layout";
import Table from "../components/Table.tsx";
import {transactionColumns} from "../components/columns/transactionsColumns.tsx";
import {useTransactions} from "../hooks/useTransactions.ts";
import {useState} from "react";
import AddTransactionForm from "../components/AddTransactionForm.tsx";
import Modal from "../components/Modal.tsx";

const Transactions = () => {
    const [isOpen, setIsOpen] = useState(false);
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
    } = useTransactions();
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
                            onClick={() => setIsOpen(true)}
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
                    columns={transactionColumns}
                    data={transactions}
                    page={page}
                    pages={pages}
                    onPageChange={setPage}
                />
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                    <AddTransactionForm
                        onSuccess={() => {
                            setIsOpen(false);
                            setPage(1);
                        }}
                    />
                </Modal>
            </div>
        </Layout>
    );
};

export default Transactions;