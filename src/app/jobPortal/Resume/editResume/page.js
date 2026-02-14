"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSave, FaBriefcase } from "react-icons/fa";
import axios from "axios";

// module-level guard to prevent duplicate requests (helps in dev StrictMode)
let _editProfileRequested = false;

export default function EditResumePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        id: "",
        fullName: "",
        email: "",
        mobile: "",
        jobCategory: "",
        otherCategory: "",
        expectedSalary: "",
        experience: "",
        skills: "",
        address: "",
        city: "",
    });

    useEffect(() => {
        // Prevent duplicate requests
        if (_editProfileRequested) {
            return;
        }
        _editProfileRequested = true;

        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const userId = localStorage.getItem("jobSeekerId");

            if (!userId) {
                // Try to fetch all and get the first one
                const response = await axios.get("/api/api-job-seekers");
                if (response.data && response.data.length > 0) {
                    const profile = response.data[0];
                    localStorage.setItem("jobSeekerId", profile.id);
                    setFormData(profile);
                } else {
                    throw new Error("No profile found. Please create a profile first.");
                }
            } else {
                const response = await axios.get(`/api/api-job-seekers?id=${userId}`);
                setFormData(response.data);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
            setError(err.response?.data?.error || err.message || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage("");

            // Validate required fields (excluding fullName and email which are disabled)
            if (!formData.mobile ||
                !formData.jobCategory || !formData.expectedSalary ||
                !formData.experience || !formData.skills || !formData.address || !formData.city) {
                throw new Error("All fields are required");
            }

            // Use PATCH request to update (excluding fullName and email)
            await axios.patch(`/api/api-job-seekers?id=${formData.id}`, {
                mobile: formData.mobile,
                jobCategory: formData.jobCategory,
                otherCategory: formData.otherCategory,
                expectedSalary: formData.expectedSalary,
                experience: formData.experience,
                skills: formData.skills,
                address: formData.address,
                city: formData.city,
            });

            setSuccessMessage("Profile updated successfully!");

            // Reset guards for fresh data on next visit
            _editProfileRequested = false;

            // Redirect back to profile page after 1.5 seconds
            setTimeout(() => {
                router.push("/jobPortal/Resume");
            }, 1500);
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.response?.data?.error || err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        // Reset guard for fresh data on next visit
        _editProfileRequested = false;
        router.push("/jobPortal/Resume");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <FaBriefcase className="text-purple-500 text-xl animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-400 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e] text-gray-200 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1f35] to-[#141929] border-b border-purple-500/20 shadow-xl">
                <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
                    <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <button
                            onClick={handleBack}
                            className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/50 text-sm sm:text-base"
                        >
                            <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium">Back</span>
                        </button>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                        Edit Profile
                    </h1>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
                {error && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
                        <p className="text-red-400 text-sm sm:text-base">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/50 rounded-xl">
                        <p className="text-green-400 text-sm sm:text-base">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Full Name <span className="text-gray-500">(Cannot be changed)</span>
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            disabled
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-400 text-sm sm:text-base placeholder-gray-400 cursor-not-allowed opacity-60"
                            placeholder="Enter your full name"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Email <span className="text-gray-500">(Cannot be changed)</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-400 text-sm sm:text-base placeholder-gray-400 cursor-not-allowed opacity-60"
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Mobile <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            placeholder="Enter your mobile number"
                            required
                        />
                    </div>

                    {/* Job Category */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Job Category <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="jobCategory"
                            value={formData.jobCategory}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            placeholder="e.g., Software Developer, Designer"
                            required
                        />
                    </div>

                    {/* Other Category */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Other Category (Optional)
                        </label>
                        <input
                            type="text"
                            name="otherCategory"
                            value={formData.otherCategory}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            placeholder="Specify if other"
                        />
                    </div>

                    {/* Expected Salary */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Expected Salary <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="expectedSalary"
                            value={formData.expectedSalary}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            placeholder="e.g., ₹5,00,000 - ₹8,00,000 per annum"
                            required
                        />
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Experience <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            placeholder="e.g., 3 years"
                            required
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Skills <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            rows={6}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 resize-none"
                            placeholder="List your skills, separated by commas or line breaks"
                            required
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            City <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                            placeholder="Enter your city"
                            required
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                            Address <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 resize-none"
                            placeholder="Enter your complete address"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 group flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
                        >
                            <FaSave className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold">
                                {saving ? "Saving..." : "Save Changes"}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={saving}
                            className="px-4 sm:px-6 py-3 sm:py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <span className="font-medium">Cancel</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
