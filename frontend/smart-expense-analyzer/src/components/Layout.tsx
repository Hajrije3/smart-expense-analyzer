import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppearance } from "../context/AppearanceContext";

const Layout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useAppearance();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;

    const navItem = (path: string, label: string) => (
        <p
            onClick={() => navigate(path)}
            className={`cursor-pointer transition-colors ${
                isActive(path)
                    ? "text-indigo-600 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            }`}
        >
            {label}
        </p>
    );

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* SIDEBAR */}
            <div className="w-64 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col justify-between">
                <div>
                    <h1 className="text-xl font-bold mb-8 text-gray-900 dark:text-white">ExpenseAI</h1>
                    <nav className="space-y-4">
                        {navItem("/", t("dashboard"))}
                        {navItem("/transactions", t("transactions"))}
                        {navItem("/analytics", t("analytics"))}
                        {navItem("/budgets", t("budgets"))}
                        {navItem("/insights", t("insights"))}
                        {navItem("/settings", t("settings"))}
                    </nav>
                </div>

                {/* USER + LOGOUT */}
                <div className="border-t dark:border-gray-700 pt-4">
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ""}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-4 text-red-500 hover:text-red-600 font-medium"
                    >
                        {t("logout")}
                    </button>
                </div>
            </div>

            {/* MAIN */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 overflow-y-auto h-full">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
