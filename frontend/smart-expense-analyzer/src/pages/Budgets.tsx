import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import CategoryPicker from "../components/CategoryPicker";
import CustomSelect from "../components/CustomSelect";
import { useAppearance } from "../context/AppearanceContext";
import {
    getBudgets, createBudget, updateBudget, deleteBudget,
    type Budget, type BudgetPayload,
} from "../services/budgetApi";

const getBarColor = (p: number) =>
    p >= 100 ? "bg-red-500" : p >= 80 ? "bg-orange-400" : "bg-green-500";

const getStatusBadge = (p: number) => {
    if (p >= 100) return { label: "Exceeded", color: "text-red-500", icon: "✕" };
    if (p >= 80)  return { label: "Near limit", color: "text-orange-500", icon: "!" };
    return              { label: "On track",   color: "text-green-600",  icon: "✓" };
};

type FormState = { category: string; amount: string; period: "weekly" | "monthly" | "yearly" };
const EMPTY: FormState = { category: "", amount: "", period: "monthly" };

export default function Budgets() {
    const { fmt, t } = useAppearance();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchBudgets = async () => {
        try { setBudgets(await getBudgets()); } finally { setLoading(false); }
    };
    useEffect(() => { fetchBudgets(); }, []);

    const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(""); setModalOpen(true); };
    const openEdit = (b: Budget) => { setEditing(b); setForm({ category: b.category, amount: String(b.amount), period: b.period }); setError(""); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditing(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setError("");
        const amount = parseFloat(form.amount);
        if (!form.category.trim() || isNaN(amount) || amount <= 0) { setError("Please enter a valid category and amount."); return; }
        setSubmitting(true);
        try {
            const payload: BudgetPayload = { category: form.category.trim(), amount, period: form.period };
            editing ? await updateBudget(editing._id, payload) : await createBudget(payload);
            closeModal(); await fetchBudgets();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? "Something went wrong.");
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        await deleteBudget(id); setBudgets((p) => p.filter((b) => b._id !== id));
    };

    const totalBudget    = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent     = budgets.reduce((s, b) => s + b.spent,  0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return (
        <Layout>
            <div className="space-y-5 sm:space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("budgets")}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set limits and track your spending</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="self-start sm:self-auto flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                    >
                        <span className="text-lg leading-none">+</span> Create Budget
                    </button>
                </div>

                {!loading && budgets.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <p className="font-bold text-gray-900 dark:text-white mb-5">Monthly Overview</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Allocated</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{fmt(totalBudget)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
                                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{fmt(totalSpent)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-500">{fmt(totalRemaining)}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                            <span className="text-gray-500 dark:text-gray-400">{overallPercent.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${getBarColor(overallPercent)}`}
                                style={{ width: `${Math.min(overallPercent, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1,2,3,4].map((i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse h-48" />)}
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-10 sm:p-12 text-center text-gray-400">
                        <p className="text-lg font-medium">{t("no_budgets")}</p>
                        <p className="text-sm mt-1">{t("no_budgets_desc")}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {budgets.map((budget) => {
                            const pct    = budget.percentUsed;
                            const status = getStatusBadge(pct);
                            const isNear = pct >= 80;
                            return (
                                <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col">

                                    <div className="flex items-center justify-between mb-4">
                                        <p className="font-bold text-gray-900 dark:text-white text-base">{budget.category}</p>
                                        <span className={`flex items-center gap-1.5 text-sm font-medium ${status.color}`}>
                                            {pct < 80
                                                ? <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                : <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4M10 13v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                            }
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="flex items-end justify-between mb-3">
                                        <div>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Spent</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(budget.spent)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Budget</p>
                                            <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(budget.amount)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className={`font-medium ${isNear ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`}>
                                            {pct.toFixed(1)}% used
                                        </span>
                                        <span className="text-green-600 font-medium">{fmt(budget.remaining)} left</span>
                                    </div>

                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                                        <div
                                            className={`h-2.5 rounded-full transition-all ${getBarColor(pct)}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>

                                    <div className="mt-auto border-t border-gray-100 dark:border-gray-700 pt-3 flex items-center justify-between">
                                        <button
                                            onClick={() => openEdit(budget)}
                                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
                                        >
                                            View details →
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget._id)}
                                            className="text-gray-300 hover:text-red-400 transition-colors"
                                            aria-label="Delete budget"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </button>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        <h2 className="font-bold text-gray-900 dark:text-white text-base">Budget Tips</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { title: "Use the 50/30/20 rule",   desc: "Allocate 50% to needs, 30% to wants, and 20% to savings" },
                            { title: "Review monthly",          desc: "Adjust your budgets based on actual spending patterns" },
                            { title: "Set realistic goals",     desc: "Start with achievable targets and gradually optimize" },
                            { title: "Track in real-time",      desc: "Monitor your spending throughout the month to stay on track" },
                        ].map((tip) => (
                            <div key={tip.title} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{tip.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{tip.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal isOpen={modalOpen} onClose={closeModal}>
                    <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white pr-6">
                        {editing ? t("edit_budget") : t("add_budget_modal")}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("category_label")}</label>
                            <CategoryPicker
                                value={form.category}
                                onChange={(name) => setForm({ ...form, category: name })}
                                placeholder="Select category"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("budget_limit")}</label>
                            <input
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="0.00"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("period_label")}</label>
                            <CustomSelect
                                value={form.period}
                                onChange={(v) => setForm({ ...form, period: v as FormState["period"] })}
                                options={[
                                    { value: "weekly", label: t("weekly") },
                                    { value: "monthly", label: t("monthly") },
                                    { value: "yearly", label: t("yearly") },
                                ]}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex gap-3 pt-1">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 border dark:border-gray-600 dark:text-gray-300 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 transition-colors"
                            >
                                {submitting ? t("saving") : editing ? t("save_changes") : t("create_budget")}
                            </button>
                        </div>
                    </form>
                </Modal>

            </div>
        </Layout>
    );
}
