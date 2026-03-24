import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { getTransactions } from "../services/transactionsApi";
import { useAppearance } from "../context/AppearanceContext";
import type { Transaction } from "../types/transaction";

const CATEGORY_ICONS: Record<string, ReactElement> = {
    Groceries: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
    ),
    Dining: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
        </svg>
    ),
    Transport: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
    ),
    Transportation: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
    ),
    Entertainment: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
    ),
    Shopping: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
    ),
    Health: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
    ),
    Income: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
    ),
};

const DefaultIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
);

const DashboardRecentTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { fmt } = useAppearance();
    const navigate = useNavigate();

    useEffect(() => {
        getTransactions(1, 5)
            .then((res) => setTransactions(res.transactions))
            .catch(() => setTransactions([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                <button
                    onClick={() => navigate("/transactions")}
                    className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                >
                    View All
                </button>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">Your latest activity</p>

            {loading ? (
                <div className="space-y-4">
                    {[1,2,3,4,5].map((i) => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-32" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-20" />
                            </div>
                            <div className="h-3.5 bg-gray-100 dark:bg-gray-700 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
            ) : (
                <div className="space-y-4">
                    {transactions.map((tx) => {
                        const Icon = CATEGORY_ICONS[tx.category] ?? <DefaultIcon />;
                        return (
                            <div key={tx._id} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    {Icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{tx.category}</p>
                                    <p className="text-xs text-indigo-400">{tx.type === "expense" ? tx.category : "Income"}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${tx.type === "expense" ? "text-gray-900 dark:text-white" : "text-green-500"}`}>
                                        {tx.type === "expense" ? "" : "+"}{fmt(tx.amount)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DashboardRecentTransactions;
