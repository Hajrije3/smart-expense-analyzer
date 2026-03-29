import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await API.post("/auth/register", { name, email, password });
            navigate("/login");
        } catch (error: any) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="flex min-h-screen">

            <div className="hidden md:flex w-[47%] bg-[#1a1a1a] text-white flex-col justify-between p-10 lg:p-12">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-[#22c55e] rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                        <span className="text-lg font-semibold">
                            ExpenseA<span className="text-red-500">I</span>
                        </span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-5">
                            Start your financial journey
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed">
                            Join thousands of users who track spending, set budgets, and understand their money.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            "Automatic transaction categorization",
                            "Real-time spending insights",
                            "Smart budget recommendations",
                            "Secure bank-level encryption",
                        ].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3.5 h-3.5 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 text-gray-500 text-sm">
                    <span>© 2024 ExpenseAI</span>
                    <span>•</span>
                    <span className="cursor-pointer hover:text-gray-300 transition-colors">Privacy</span>
                    <span>•</span>
                    <span className="cursor-pointer hover:text-gray-300 transition-colors">Terms</span>
                </div>
            </div>

            <div className="flex w-full md:w-[53%] items-center justify-center bg-[#f5f5f5] px-6 py-10">
                <div className="w-full max-w-[420px]">

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
                    <p className="text-gray-500 text-sm mb-8">Sign up to get started with ExpenseAI</p>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-transparent"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            Create account
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-300" />
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-gray-300" />
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <span
                            className="font-bold text-gray-900 cursor-pointer hover:text-[#22c55e] transition-colors"
                            onClick={() => navigate("/login")}
                        >
                            Sign in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
