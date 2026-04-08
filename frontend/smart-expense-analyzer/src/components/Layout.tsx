import { useState, useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppearance } from "../context/AppearanceContext";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    type AppNotification,
} from "../services/notificationsApi";

const Icons = {
    dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
        </svg>
    ),
    transactions: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    ),
    analytics: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    budgets: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    insights: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
    ),
    settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
};

const navLinks = [
    { path: "/", key: "dashboard", icon: Icons.dashboard },
    { path: "/transactions", key: "transactions", icon: Icons.transactions },
    { path: "/analytics", key: "analytics", icon: Icons.analytics },
    { path: "/budgets", key: "budgets", icon: Icons.budgets },
    { path: "/insights", key: "insights", icon: Icons.insights },
    { path: "/settings", key: "settings", icon: Icons.settings },
];

const Layout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useAppearance();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const bellRef = useRef<HTMLDivElement>(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        if (!user?.token) return;
        fetchNotifications().then(setNotifications).catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
    };

    const typeIcon = (type: AppNotification["type"]) => {
        if (type === "budget_exceeded") return "🔴";
        if (type === "budget_alert") return "🟠";
        return "🔵";
    };

    const timeAgo = (iso: string) => {
        const diff = (Date.now() - new Date(iso).getTime()) / 1000;
        if (diff < 60) return t("just_now");
        if (diff < 3600) return `${Math.floor(diff / 60)}${t("min_ago")}`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}${t("hour_ago")}`;
        return `${Math.floor(diff / 86400)}${t("day_ago")}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const handleNav = (path: string) => {
        navigate(path);
        setSidebarOpen(false);
    };

    const initials = (name: string) => {
        const parts = (name || "U").trim().split(" ");
        return parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : parts[0].slice(0, 2).toUpperCase();
    };

    const sidebarContent = (
        <div className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                        ExpenseA<span className="text-red-500">I</span>
                    </span>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <button
                    className="hidden lg:flex p-1 rounded text-gray-400 hover:text-gray-600"
                    aria-label="Collapse sidebar"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {navLinks.map(({ path, key, icon }) => (
                    <button
                        key={path}
                        onClick={() => handleNav(path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            isActive(path)
                                ? "bg-[#f0fdf4] dark:bg-green-900/30 text-[#16a34a] dark:text-green-400"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        <span className={isActive(path) ? "text-[#22c55e]" : "text-gray-400"}>
                            {icon}
                        </span>
                        {t(key)}
                    </button>
                ))}
            </nav>

            <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-[#22c55e] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{initials(user?.name || "U")}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ""}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full"
                >
                    {Icons.logout}
                    {t("logout")}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f5f5f5] dark:bg-gray-950 overflow-hidden">

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={[
                    "fixed inset-y-0 left-0 z-30 flex-shrink-0",
                    "transform transition-transform duration-300 ease-in-out",
                    "lg:static lg:translate-x-0 lg:z-auto",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                ].join(" ")}
            >
                {sidebarContent}
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                <header className="flex items-center gap-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-1.5 rounded text-gray-500 hover:text-gray-700"
                        aria-label="Open navigation"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    <div className="relative ml-auto" ref={bellRef}>
                        <button
                            onClick={() => setBellOpen((o) => !o)}
                            className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {bellOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs text-[#22c55e] hover:text-green-700 font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                                            {t("no_notifications_yet")}
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                onClick={() => !n.read && handleMarkRead(n._id)}
                                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                                                    !n.read ? "bg-green-50 dark:bg-green-900/10" : ""
                                                }`}
                                            >
                                                <span className="text-base mt-0.5 flex-shrink-0">{typeIcon(n.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium truncate ${!n.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                                                        {timeAgo(n.createdAt)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDelete(n._id, e)}
                                                    className="flex-shrink-0 p-1 text-gray-300 dark:text-gray-600 hover:text-red-400 rounded transition-colors"
                                                    title="Dismiss"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto dark:bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
