import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post("/auth/forgot-password", { email });
            setSubmitted(true);
        } catch (error: any) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6">
            <div className="w-full max-w-[420px]">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 bg-[#22c55e] rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <span className="text-lg font-semibold">
                        ExpenseA<span className="text-red-500">I</span>
                    </span>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
                        <p className="text-gray-500 text-sm mb-6">
                            We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour.
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="text-sm font-semibold text-[#22c55e] hover:underline"
                        >
                            Back to sign in
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
                        <p className="text-gray-500 text-sm mb-8">
                            Enter your email and we'll send you a reset link.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
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
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
                            >
                                {loading ? "Sending..." : "Send reset link"}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            Remember your password?{" "}
                            <span
                                className="font-bold text-gray-900 cursor-pointer hover:text-[#22c55e] transition-colors"
                                onClick={() => navigate("/login")}
                            >
                                Sign in
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
