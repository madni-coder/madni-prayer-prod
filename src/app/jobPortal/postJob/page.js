"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaBriefcase,
    FaBuilding,
    FaMapMarkerAlt,
    FaClock,
    FaRupeeSign,
    FaAlignLeft,
    FaListUl,
    FaTasks,
    FaPhone,
    FaCheckCircle,
    FaPlusCircle,
} from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";
import apiClient from "../../../lib/apiClient";

export default function PostJobPage() {
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        requirements: "",
        responsibilities: "",
        mobile: "",
    });
    const [errors, setErrors] = useState({});

    const jobTypes = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "mobile") {
            const numericValue = value.replace(/[^0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.type) newErrors.type = "Please select a job type";
        if (!formData.salary.trim()) newErrors.salary = "Salary is required";

        if (!formData.description.trim()) newErrors.description = "Job description is required";
        if (!formData.requirements.trim()) newErrors.requirements = "Requirements are required";
        if (!formData.responsibilities.trim()) newErrors.responsibilities = "Responsibilities are required";

        if (!formData.mobile.trim()) {
            newErrors.mobile = "Contact number is required";
        } else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, ""))) {
            newErrors.mobile = "Enter a valid 10-digit mobile number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");

        if (!validateForm()) return;

        setShowLoader(true);

        try {
            const dataToSubmit = {
                title: formData.title.trim(),
                company: formData.company.trim(),
                location: formData.location.trim(),
                mobile: formData.mobile.trim(),
                type: formData.type,
                salary: formData.salary.trim(),
                description: formData.description.trim(),
                requirements: formData.requirements
                    .split("\n")
                    .map((r) => r.trim())
                    .filter(Boolean),
                responsibilities: formData.responsibilities
                    .split("\n")
                    .map((r) => r.trim())
                    .filter(Boolean),
                postedDate: new Date().toISOString(),
            };

            await apiClient.post("/api/api-job-lists", dataToSubmit);

            // Tell the job listings page to bypass its cache and refetch
            // so this newly posted job shows up right away.
            if (typeof window !== "undefined") {
                sessionStorage.setItem("jp_refresh_joblists", "1");
            }

            setShowLoader(false);
            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                setFormData({
                    title: "",
                    company: "",
                    location: "",
                    type: "",
                    salary: "",
                    description: "",
                    requirements: "",
                    responsibilities: "",
                    mobile: "",
                });
                router.push("/jobPortal/jobLists");
            }, 2500);
        } catch (error) {
            console.error("Error posting job:", error);
            setShowLoader(false);
            setSubmitError("Failed to post the job. Please try again.");
        }
    };

    const handleBack = () => {
        router.push("/jobPortal/jobLists");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e] text-gray-200 p-3 sm:p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBack}
                        className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/50"
                    >
                        <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform duration-300" />
                        <span className="text-xs sm:text-base font-medium">Back</span>
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 p-4 rounded-2xl shadow-lg mb-4">
                        <FaPlusCircle className="text-3xl text-white" />
                    </div>
                    <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                        Post a Job
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Fill in the details below to publish a new job opening
                    </p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-green-500/20 border border-green-500 rounded-2xl p-4 flex items-center gap-3 animate-pulse">
                        <FaCheckCircle className="text-green-400 text-2xl flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-green-400">Job Post Submitted!</p>
                            <p className="text-sm text-gray-300">Redirecting you back to job listings...</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {submitError && (
                    <div className="mb-6 bg-red-500/20 border border-red-500 rounded-2xl p-4 flex items-center gap-3">
                        <p className="text-sm text-red-300">{submitError}</p>
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Job Title */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaBriefcase />
                                Job Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.title ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500`}
                                placeholder="e.g., Senior Frontend Developer"
                            />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
                        </div>

                        {/* Company Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaBuilding />
                                Company Name *
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.company ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500`}
                                placeholder="e.g., Infosys Ltd"
                            />
                            {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
                        </div>

                        {/* Location */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaMapMarkerAlt />
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.location ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500`}
                                placeholder="e.g., Bengaluru, Karnataka"
                            />
                            {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
                        </div>

                        {/* Job Type */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaClock />
                                Job Type *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.type ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white`}
                            >
                                <option value="" className="bg-[#0d1528]">Select job type</option>
                                {jobTypes.map((t) => (
                                    <option key={t} value={t} className="bg-[#0d1528]">
                                        {t}
                                    </option>
                                ))}
                            </select>
                            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
                        </div>

                        {/* Salary */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaRupeeSign />
                                Salary *
                            </label>
                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.salary ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500`}
                                placeholder="e.g., ₹6,00,000 - ₹9,00,000 per annum"
                            />
                            {errors.salary && <p className="text-red-400 text-xs mt-1">{errors.salary}</p>}
                        </div>

                        {/* Job Description */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaAlignLeft />
                                Job Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.description ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500 resize-none`}
                                placeholder="Describe the role, team, and what makes this opportunity great..."
                            />
                            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                        </div>

                        {/* Requirements */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaListUl />
                                Requirements *
                            </label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.requirements ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500 resize-none`}
                                placeholder={"Enter one requirement per line, e.g.\n3+ years of React experience\nStrong understanding of REST APIs"}
                            />
                            <p className="text-gray-500 text-xs mt-1">Tip: enter one requirement per line</p>
                            {errors.requirements && <p className="text-red-400 text-xs mt-1">{errors.requirements}</p>}
                        </div>

                        {/* Responsibilities */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaTasks />
                                Responsibilities *
                            </label>
                            <textarea
                                name="responsibilities"
                                value={formData.responsibilities}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.responsibilities ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500 resize-none`}
                                placeholder={"Enter one responsibility per line, e.g.\nBuild and maintain UI components\nCollaborate with backend team"}
                            />
                            <p className="text-gray-500 text-xs mt-1">Tip: enter one responsibility per line</p>
                            {errors.responsibilities && (
                                <p className="text-red-400 text-xs mt-1">{errors.responsibilities}</p>
                            )}
                        </div>

                        {/* Contact Mobile */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaPhone />
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength="10"
                                className={`w-full px-4 py-3 bg-white/5 border ${errors.mobile ? "border-red-500" : "border-white/10"
                                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-white placeholder-gray-500`}
                                placeholder="9876543210"
                            />
                            {errors.mobile && <p className="text-red-400 text-xs mt-1">{errors.mobile}</p>}
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="flex-1 py-3 sm:py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl font-semibold transition-all duration-300 text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 sm:py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                        >
                            Post Job
                        </button>
                    </div>
                </form>
            </div>

            {showLoader && <AnimatedLooader message="Publishing your job post..." />}
        </div>
    );
}
