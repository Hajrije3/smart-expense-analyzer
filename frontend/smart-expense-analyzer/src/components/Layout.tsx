import type { ReactNode } from "react";
import {useLocation, useNavigate} from "react-router-dom";

const Layout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ Get real user
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // ✅ Logout function
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const isActive = (path: string) => location.pathname === path;
    return (
        <div className="flex h-screen bg-gray-100">

            {/* SIDEBAR */}
            <div className="w-64 bg-white shadow-md p-4 flex flex-col justify-between">

                <div>
                    <h1 className="text-xl font-bold mb-8">ExpenseAI</h1>

                    <nav className="space-y-4">

                        <p
                            onClick={() => navigate("/")}
                            className={`cursor-pointer ${
                                isActive("/") ? "text-indigo-600 font-medium" : "text-gray-600 hover:text-indigo-600"
                            }`}
                        >
                            Dashboard
                        </p>

                        <p
                            onClick={() => navigate("/transactions")}
                            className={`cursor-pointer ${
                                isActive("/transactions")
                                    ? "text-indigo-600 font-medium"
                                    : "text-gray-600 hover:text-indigo-600"
                            }`}
                        >
                            Transactions
                        </p>
                        <p className="text-gray-600 cursor-pointer hover:text-indigo-600">Analytics</p>
                        <p className="text-gray-600 cursor-pointer hover:text-indigo-600">Budgets</p>
                        <p className="text-gray-600 cursor-pointer hover:text-indigo-600">Insights</p>
                        <p className="text-gray-600 cursor-pointer hover:text-indigo-600">Settings</p>
                    </nav>
                </div>

                {/* USER + LOGOUT */}
                <div className="border-t pt-4">
                    <p className="font-medium">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-500">{user?.email || ""}</p>

                    <button
                        onClick={handleLogout}
                        className="mt-4 text-red-500 hover:text-red-600 font-medium"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* MAIN */}
            <div className="flex-1 flex flex-col">

                {/* TOPBAR */}
                <div className="bg-white p-4 shadow flex justify-between items-center">
                    <input
                        placeholder="Search transactions..."
                        className="border rounded-lg px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <span className="text-xl">🔔</span>
                </div>

                {/* CONTENT */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;