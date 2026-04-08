import { useEffect, useState } from "react";
import {
    useCreateTransaction,
    useUpdateTransaction,
} from "../hooks/useTransactions";
import type { Transaction } from "../types/transaction";
import CategoryPicker from "./CategoryPicker";
import CustomSelect from "./CustomSelect";
import { useAppearance } from "../context/AppearanceContext";

type Props = {
    onSuccess: () => void;
    transaction?: Transaction;
};

const TransactionForm = ({ onSuccess, transaction }: Props) => {
    const isEdit = !!transaction;
    const { t } = useAppearance();

    const { create, loading: creating } = useCreateTransaction();
    const { update, loading: updating } = useUpdateTransaction();

    const loading = creating || updating;

    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
            setType(transaction.type);
            setDescription(transaction.description || "");
        } else {
            setAmount("");
            setCategory("");
            setType("expense");
            setDescription("");
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
                    description,
                });
            } else {
                await create({
                    amount: Number(amount),
                    category,
                    type,
                    description,
                });
            }

            setAmount("");
            setCategory("");
            setType("expense");
            setDescription("");

            onSuccess();

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isEdit ? t("edit_transaction") : t("add_transaction")}
            </h2>

            <input
                type="number"
                placeholder={t("amount_label")}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <CategoryPicker
                value={category}
                onChange={setCategory}
                placeholder={t("select_category_placeholder")}
            />

            <CustomSelect
                value={type}
                onChange={(v) => setType(v as "income" | "expense")}
                options={[
                    { value: "expense", label: t("expense") },
                    { value: "income", label: t("income") },
                ]}
            />

            <input
                type="text"
                placeholder={t("description_optional")}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
                {loading
                    ? t("processing")
                    : isEdit
                        ? t("update_transaction")
                        : t("add_transaction")}
            </button>

        </form>
    );
};

export default TransactionForm;