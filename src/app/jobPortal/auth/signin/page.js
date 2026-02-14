"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEnvelope, FaLock, FaSignInAlt, FaArrowLeft } from "react-icons/fa";

export default function SignIn() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/api-job-seekers/auth", formData);

            if (response.data.success) {
                // Save authentication data to localStorage
                localStorage.setItem("jobSeekerEmail", response.data.user.email);
                localStorage.setItem("jobSeekerId", response.data.user.id);
                localStorage.setItem("jobSeekerAuth", "true");

                // Redirect to profile page
                router.push("/jobPortal/Resume");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24">
            <div className="max-w-md mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/jobPortal/jobLists")}
                        className="flex items-center gap-2 px-4 py-2 bg-[#243447] hover:bg-[#2d3f54] rounded-lg transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back to Job Portal</span>
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
                        <FaSignInAlt className="text-white text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Welcome </h1>
                    <p className="text-gray-400">Sign in to access your profile</p>
                </div>

                {/* Sign In Form */}
                <div className="bg-[#243447] rounded-xl p-6 md:p-8 border border-[#2d3f54] shadow-xl">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaEnvelope />
                                Email Address *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaLock />
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="Enter your password"
                            />
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-xl">
                            Don't have an account?{" "}
                            <button
                                onClick={() => router.push("/jobPortal/auth/signup")}
                                className="text-purple-400 font-semibold hover:text-purple-300 underline"
                            >
                                Register Now
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
