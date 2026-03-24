import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAppearance } from "../context/AppearanceContext";
import {
    getBudgets, createBudget, updateBudget, deleteBudget,
    type Budget, type BudgetPayload,
} from "../services/budgetApi";

const CATEGORY_COLORS: Record<string, string> = {
    Groceries: "#22c55e", Dining: "#f97316", Transport: "#6366f1",
    Entertainment: "#a855f7", Health: "#ef4444", Shopping: "#3b82f6",
    Utilities: "#eab308", Education: "#14b8a6", Other: "#6b7280",
};
const getColor = (cat: string) => CATEGORY_COLORS[cat] ?? "#6366f1";
const getBarColor = (p: number) => p >= 90 ? "bg-orange-400" : p >= 70 ? "bg-yellow-400" : "bg-green-500";
const getRemColor = (p: number) => p >= 90 ? "text-orange-500" : "text-green-600";

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

    const openAdd = () => { setEditing(null); setForm(EMPTY); setError(""); setModalOpen(true); };
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

    const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return (
        <Layout>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("budgets")}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t("set_track")}</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    <span className="text-lg leading-none">+</span> {t("add_budget")}
                </button>
            </div>

            {/* Summary */}
            {!loading && budgets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("total_budget")}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{fmt(totalBudget)}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t("for_this_month")}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("total_spent")}</p>
                        <p className="text-3xl font-bold text-indigo-600">{fmt(totalSpent)}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{overallPercent}{t("pct_of_budget")}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t("remaining_label")}</p>
                        <p className="text-3xl font-bold text-green-500">{fmt(totalRemaining)}</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t("available_to_spend")}</p>
                    </div>
                </div>
            )}

            {/* Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1,2,3,4].map((i) => <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 animate-pulse h-36" />)}
                </div>
            ) : budgets.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center text-gray-400">
                    <p className="text-lg font-medium">{t("no_budgets")}</p>
                    <p className="text-sm mt-1">{t("no_budgets_desc")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {budgets.map((budget) => {
                        const color = getColor(budget.category);
                        const nearLimit = budget.percentUsed >= 90;
                        return (
                            <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ backgroundColor: color + "22" }}>
                                            <span style={{ color }}>{budget.category[0].toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{budget.category}</p>
                                            <p className="text-sm text-gray-400 dark:text-gray-500">{fmt(budget.spent)} of {fmt(budget.amount)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(budget)} className="text-gray-400 hover:text-indigo-600 transition-colors p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                                        </button>
                                        <button onClick={() => handleDelete(budget._id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">{budget.percentUsed}{t("pct_used")}</span>
                                    <span className={`font-semibold ${getRemColor(budget.percentUsed)}`}>{fmt(budget.remaining)} {t("left")}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full transition-all ${getBarColor(budget.percentUsed)}`} style={{ width: `${Math.min(budget.percentUsed, 100)}%` }} />
                                </div>
                                {nearLimit && (
                                    <div className="mt-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400">
                                        <span>⚠</span><span>{budget.category} — {t("approaching_limit")}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={closeModal}>
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{editing ? t("edit_budget") : t("add_budget_modal")}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("category_label")}</label>
                        <input type="text" placeholder="e.g. Groceries" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("budget_limit")}</label>
                        <input type="number" min="1" step="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("period_label")}</label>
                        <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as FormState["period"] })} className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                            <option value="weekly">{t("weekly")}</option>
                            <option value="monthly">{t("monthly")}</option>
                            <option value="yearly">{t("yearly")}</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={closeModal} className="flex-1 border dark:border-gray-600 dark:text-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">{t("cancel")}</button>
                        <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-60">{submitting ? t("saving") : editing ? t("save_changes") : t("create_budget")}</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}
