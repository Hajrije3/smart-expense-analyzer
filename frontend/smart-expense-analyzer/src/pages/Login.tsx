import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import type { User } from "../types/user";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data } = await API.post("/auth/login", {
                email,
                password,
            });

            const user: User = {
                ...data.user,
                token: data.token,
            };

            localStorage.setItem("user", JSON.stringify(user));
            navigate("/");
        } catch (error: any) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="flex min-h-screen">

            {/* LEFT SIDE */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-12 flex-col justify-center">
                <div className="max-w-md">
                    <h1 className="text-3xl font-bold mb-8">ExpenseAI</h1>

                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Take Control of Your Finances
                    </h2>

                    <p className="text-lg opacity-90 mb-8">
                        Smart expense tracking powered by AI to help you save more and spend wisely.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">Track Spending</h3>
                            <p className="text-sm opacity-80">
                                Monitor your expenses in real-time with intelligent categorization
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold">Visual Analytics</h3>
                            <p className="text-sm opacity-80">
                                Beautiful charts to understand your financial habits
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold">Smart Budgets</h3>
                            <p className="text-sm opacity-80">
                                Set budgets and get alerts when approaching limits
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

                    {/* Tabs */}
                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                        <button className="flex-1 py-2 rounded-md bg-white shadow text-sm font-medium">
                            Log In
                        </button>
                        <button
                            className="flex-1 py-2 text-sm font-medium text-gray-500"
                            onClick={() => navigate("/register")}
                        >
                            Sign Up
                        </button>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
                    <p className="text-gray-500 mb-6">
                        Enter your credentials to access your account
                    </p>

                    {/* FORM */}
                    <form onSubmit={handleLogin} className="space-y-4">

                        <input
                            type="email"
                            placeholder="Email address"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2">
                                <input type="checkbox" />
                                Remember me
                            </label>

                            <span className="text-indigo-600 cursor-pointer">
                Forgot password?
              </span>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;