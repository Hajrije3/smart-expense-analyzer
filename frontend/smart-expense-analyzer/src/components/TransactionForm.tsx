import { useEffect, useState } from "react";
import {
    useCreateTransaction,
    useUpdateTransaction,
} from "../hooks/useTransactions";
import type { Transaction } from "../types/transaction";

type Props = {
    onSuccess: () => void;
    transaction?: Transaction;
};

const TransactionForm = ({ onSuccess, transaction }: Props) => {
    const isEdit = !!transaction;

    const { create, loading: creating } = useCreateTransaction();
    const { update, loading: updating } = useUpdateTransaction();

    const loading = creating || updating;

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");

    // ✅ Prefill when editing
    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
            setType(transaction.type);
        } else {
            // reset when switching to add mode
            setAmount("");
            setCategory("");
            setType("expense");
        }
    }, [transaction]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !category) return;

        try {
            if (isEdit && transaction) {
                await update(transaction._id, {
                    amount: Number(amount),
                    category,
                    type,
                });
            } else {
                await create({
                    amount: Number(amount),
                    category,
                    type,
                });
            }

            // ✅ reset form after success (optional)
            setAmount("");
            setCategory("");
            setType("expense");

            onSuccess();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <h2 className="text-xl font-bold">
                {isEdit ? "Edit Transaction" : "Add Transaction"}
            </h2>

            <input
                type="number"
                placeholder="Amount"
                className="w-full border p-3 rounded-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <input
                type="text"
                placeholder="Category"
                className="w-full border p-3 rounded-lg"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            />

            <select
                className="w-full border p-3 rounded-lg"
                value={type}
                onChange={(e) =>
                    setType(e.target.value as "income" | "expense")
                }
            >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg disabled:opacity-50"
            >
                {loading
                    ? "Processing..."
                    : isEdit
                        ? "Update Transaction"
                        : "Add Transaction"}
            </button>

        </form>
    );
};

export default TransactionForm;