import { useState } from "react";
import { createTransaction } from "../services/transactionsApi";

type Props = {
    onSuccess: () => void;
};

const AddTransactionForm = ({ onSuccess }: Props) => {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await createTransaction({
                amount: Number(amount),
                category,
                type,
            });

            onSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <h2 className="text-xl font-bold">Add Transaction</h2>

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
                onChange={(e) => setType(e.target.value as any)}
            >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
            </select>

            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
                Add Transaction
            </button>

        </form>
    );
};

export default AddTransactionForm;