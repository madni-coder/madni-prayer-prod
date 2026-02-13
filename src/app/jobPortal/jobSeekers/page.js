"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaBriefcase,
    FaDollarSign,
    FaClock,
    FaTools,
    FaMapMarkerAlt,
    FaCity,
    FaCheckCircle,
} from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";

// Job categories
const jobCategories = [
    "Software Development",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Digital Marketing",
    "Graphic Design",
    "Content Writing",
    "Sales & Marketing",
    "Human Resources",
    "Customer Support",
    "Finance & Accounting",
    "Teaching/Education",
    "Healthcare",
    "Engineering",
    "Other",
];

export default function JobSeekersPage() {
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        jobCategory: "",
        expectedSalary: "",
        experience: "",
        skills: "",
        address: "",
        city: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.jobCategory) {
            newErrors.jobCategory = "Please select a job category";
        }

        if (!formData.expectedSalary.trim()) {
            newErrors.expectedSalary = "Expected salary is required";
        }

        if (!formData.experience.trim()) {
            newErrors.experience = "Years of experience is required";
        } else if (isNaN(formData.experience) || formData.experience < 0) {
            newErrors.experience = "Please enter a valid number";
        }

        if (!formData.skills.trim()) {
            newErrors.skills = "Skills are required";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (!formData.city.trim()) {
            newErrors.city = "City is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            setShowLoader(true);
            // Simulate API call
            setTimeout(() => {
                setShowLoader(false);
                setShowSuccess(true);
                console.log("Form submitted:", formData);

                // Reset form after 3 seconds and redirect
                setTimeout(() => {
                    setShowSuccess(false);
                    setFormData({
                        fullName: "",
                        email: "",
                        jobCategory: "",
                        expectedSalary: "",
                        experience: "",
                        skills: "",
                        address: "",
                        city: "",
                    });
                    router.push("/jobPortal/viewJobs");
                }, 3000);
            }, 1500);
        }
    };

    const handleBack = () => {
        router.push("/jobPortal/viewJobs");
    };

    return (
        <div className="min-h-screen bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 bg-[#243447] hover:bg-[#2d3f54] rounded-lg transition-colors"
                    >
                        <FaArrowLeft />
                        <span>Back</span>
                    </button>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Apply for Job
                    </h1>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Fill out the form below to submit your application
                    </p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center gap-3 animate-pulse">
                        <FaCheckCircle className="text-green-400 text-2xl" />
                        <div>
                            <p className="font-semibold text-green-400">Application Submitted Successfully!</p>
                            <p className="text-sm text-gray-300">Redirecting you back to jobs...</p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#243447] rounded-xl p-4 sm:p-8 border border-[#2d3f54] shadow-xl"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaUser />
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.fullName ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500`}
                                placeholder="Enter your full name"
                            />
                            {errors.fullName && (
                                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaEnvelope />
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.email ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500`}
                                placeholder="your.email@example.com"
                            />
                            {errors.email && (
                                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Job Category */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaBriefcase />
                                Job Category *
                            </label>
                            <select
                                name="jobCategory"
                                value={formData.jobCategory}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.jobCategory ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white`}
                            >
                                <option value="">Select category</option>
                                {jobCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.jobCategory && (
                                <p className="text-red-400 text-xs mt-1">{errors.jobCategory}</p>
                            )}
                        </div>

                        {/* Expected Salary */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaDollarSign />
                                Expected Salary (PKR) *
                            </label>
                            <input
                                type="text"
                                name="expectedSalary"
                                value={formData.expectedSalary}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.expectedSalary ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500`}
                                placeholder="e.g., 50,000 - 70,000"
                            />
                            {errors.expectedSalary && (
                                <p className="text-red-400 text-xs mt-1">{errors.expectedSalary}</p>
                            )}
                        </div>

                        {/* Years of Experience */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaClock />
                                Years of Experience *
                            </label>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleChange}
                                min="0"
                                step="0.5"
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.experience ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500`}
                                placeholder="e.g., 3"
                            />
                            {errors.experience && (
                                <p className="text-red-400 text-xs mt-1">{errors.experience}</p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaTools />
                                Skills *
                            </label>
                            <textarea
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.skills ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500 resize-none`}
                                placeholder="e.g., React, Node.js, MongoDB, Express"
                            />
                            {errors.skills && (
                                <p className="text-red-400 text-xs mt-1">{errors.skills}</p>
                            )}
                        </div>

                        {/* Full Address */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaMapMarkerAlt />
                                Full Address *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.address ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500 resize-none`}
                                placeholder="Enter your complete address"
                            />
                            {errors.address && (
                                <p className="text-red-400 text-xs mt-1">{errors.address}</p>
                            )}
                        </div>

                        {/* City */}
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-purple-400">
                                <FaCity />
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-[#1e2f3f] border ${errors.city ? "border-red-500" : "border-[#2d3f54]"
                                    } rounded-lg focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500`}
                                placeholder="e.g., Karachi"
                            />
                            {errors.city && (
                                <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                            )}
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
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>

            {showLoader && <AnimatedLooader message="Submitting your application..." />}
        </div>
    );
}
