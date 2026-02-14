"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBriefcase, FaRupeeSign, FaClock, FaTools, FaMapMarkerAlt, FaCity, FaArrowLeft } from "react-icons/fa";

export default function SignUp() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        mobile: "",
        jobCategory: "",
        otherCategory: "",
        expectedSalary: "",
        experience: "",
        skills: "",
        address: "",
        city: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const jobCategories = [
        "Software Developer",
        "Web Developer",
        "Mobile App Developer",
        "Data Analyst",
        "Graphic Designer",
        "Content Writer",
        "Digital Marketer",
        "Sales Executive",
        "Customer Service",
        "Accountant",
        "Teacher",
        "Other"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await axios.post("/api/api-job-seekers", formData);

            // Save authentication data to localStorage
            localStorage.setItem("jobSeekerEmail", response.data.email);
            localStorage.setItem("jobSeekerId", response.data.id);
            localStorage.setItem("jobSeekerAuth", "true");

            // Redirect to profile page
            router.push("/jobPortal/Resume");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push("/jobPortal/jobLists");
    };

    return (
        <div className="min-h-screen bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#243447] hover:bg-[#2d3f54] rounded-lg transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back to Job Portal</span>
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Create Your Account
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Join our job portal and find your dream job
                    </p>
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} className="bg-[#243447] rounded-xl p-4 sm:p-8 border border-[#2d3f54] shadow-xl">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaUser />
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="Enter your full name"
                            />
                        </div>

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
                                placeholder="your.email@example.com"
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
                                placeholder="Create a strong password"
                            />
                        </div>

                        {/* Mobile */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaPhone />
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="03001234567"
                            />
                        </div>

                        {/* Job Category */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaBriefcase />
                                Job Category *
                            </label>
                            <select
                                required
                                value={formData.jobCategory}
                                onChange={(e) => setFormData({ ...formData, jobCategory: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white"
                            >
                                <option value="">Select category</option>
                                {jobCategories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Other Category Input */}
                        {formData.jobCategory === "Other" && (
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                    <FaBriefcase />
                                    Specify Job Category *
                                </label>
                                <input
                                    type="text"
                                    value={formData.otherCategory}
                                    onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                                    className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                    placeholder="Enter your job category"
                                />
                            </div>
                        )}

                        {/* Expected Salary */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaRupeeSign />
                                Expected Salary *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.expectedSalary}
                                onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="e.g., 50000"
                            />
                        </div>

                        {/* Years of Experience */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaClock />
                                Years of Experience *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="e.g., 2 years"
                            />
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaTools />
                                Skills *
                            </label>
                            <textarea
                                required
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500 resize-none"
                                placeholder="List your skills (e.g., JavaScript, React, Node.js)"
                            />
                        </div>

                        {/* Full Address */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaMapMarkerAlt />
                                Full Address *
                            </label>
                            <textarea
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500 resize-none"
                                placeholder="Enter your complete address"
                            />
                        </div>

                        {/* City */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaCity />
                                City *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1e2f3f] border border-[#2d3f54] rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
                                placeholder="Your city"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-3 bg-[#1e2f3f] hover:bg-[#2d3f54] rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>

                    {/* Sign In Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => router.push("/jobPortal/auth/signin")}
                                className="text-purple-400 font-semibold hover:text-purple-300"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
