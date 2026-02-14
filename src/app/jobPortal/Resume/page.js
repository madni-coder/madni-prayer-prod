"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaEdit, FaBriefcase, FaEnvelope, FaPhone, FaMapMarkerAlt, FaMoneyBillWave, FaClock, FaTools, FaSignOutAlt, FaTrash } from "react-icons/fa";
import axios from "axios";

// module-level guard to prevent duplicate requests (helps in dev StrictMode)
let _profileRequested = false;

export default function ResumePage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        // Check authentication
        const isAuth = localStorage.getItem("jobSeekerAuth");
        if (!isAuth) {
            router.push("/jobPortal/auth/signin");
            return;
        }

        // Prevent duplicate requests
        if (_profileRequested) {
            return;
        }
        _profileRequested = true;

        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const userId = localStorage.getItem("jobSeekerId");

            if (!userId) {
                router.push("/jobPortal/auth/signin");
                return;
            }

            const response = await axios.get(`/api/api-job-seekers?id=${userId}`);
            setProfile(response.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
            if (err.response?.status === 404) {
                // User not found, clear localStorage and redirect to sign-in
                localStorage.removeItem("jobSeekerAuth");
                localStorage.removeItem("jobSeekerId");
                localStorage.removeItem("jobSeekerEmail");
                router.push("/jobPortal/auth/signin");
            } else {
                setError(err.response?.data?.error || err.message || "Failed to load profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push("/jobPortal/jobLists");
    };

    const handleEdit = () => {
        // Reset profile guard so fresh data is fetched when returning from edit page
        _profileRequested = false;
        router.push("/jobPortal/Resume/editResume");
    };

    const handleLogout = () => {
        // Clear authentication from localStorage
        localStorage.removeItem("jobSeekerAuth");
        localStorage.removeItem("jobSeekerId");
        localStorage.removeItem("jobSeekerEmail");

        // Reset request guard
        _profileRequested = false;

        // Redirect to sign-in page
        router.push("/jobPortal/auth/signin");
    };

    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const userId = localStorage.getItem("jobSeekerId");
            await axios.delete(`/api/api-job-seekers?id=${userId}`);

            // Clear localStorage
            localStorage.removeItem("jobSeekerAuth");
            localStorage.removeItem("jobSeekerId");
            localStorage.removeItem("jobSeekerEmail");

            // Reset request guard
            _profileRequested = false;

            // Redirect to job portal
            router.push("/jobPortal/jobLists");
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Failed to delete account. Please try again.");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
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
                    <p className="text-gray-400 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    const handleApplyForJob = () => {
        router.push("/jobPortal/applyForJob");
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e] text-gray-200">
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
                            My Profile
                        </h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8 sm:py-12">
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 sm:p-12 text-center">
                        <div className="mb-4 sm:mb-6">
                            <FaBriefcase className="text-5xl sm:text-6xl text-purple-400 mx-auto mb-3 sm:mb-4" />
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Profile Found</h2>
                            <p className="text-gray-300 text-base sm:text-lg">Create your profile to start applying for jobs</p>
                        </div>
                        <button
                            onClick={handleApplyForJob}
                            className="group inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] shadow-lg text-sm sm:text-base"
                        >
                            <FaBriefcase className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold">Apply for a Job</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e] text-gray-200 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1a1f35] to-[#141929] border-b border-purple-500/20 shadow-xl">
                <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={handleBack}
                                className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/50 text-sm sm:text-base"
                            >
                                <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform duration-300" />
                                <span className="font-medium">Back</span>
                            </button>

                            <button
                                onClick={handleEdit}
                                className="group flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] shadow-lg text-sm sm:text-base"
                            >
                                <FaEdit className="text-xs sm:text-sm group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-bold">Edit</span>
                            </button>
                        </div>

                        {/* Logout Button */}

                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                        My Profile
                    </h1>
                </div>
            </div>

            {/* Profile Content */}
            <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
                {/* Name Section */}
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{profile.fullName}</h2>
                    <div className="h-1 w-16 sm:w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </div>

                {/* Contact Information */}
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                        <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg shrink-0">
                            <FaEnvelope className="text-purple-400 text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm">Email</p>
                            <p className="text-white font-medium text-sm sm:text-base break-all">{profile.email}</p>
                        </div>
                    </div>

                    {profile.mobile && (
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg shrink-0">
                                <FaPhone className="text-blue-400 text-lg sm:text-xl" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-gray-400 text-xs sm:text-sm">Mobile</p>
                                <p className="text-white font-medium text-sm sm:text-base">{profile.mobile}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                        <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg shrink-0">
                            <FaMapMarkerAlt className="text-green-400 text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm">City</p>
                            <p className="text-white font-medium text-sm sm:text-base">{profile.city}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                        <div className="p-2 sm:p-3 bg-pink-500/20 rounded-lg shrink-0">
                            <FaBriefcase className="text-pink-400 text-lg sm:text-xl" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-gray-400 text-xs sm:text-sm">Job Category</p>
                            <p className="text-white font-medium text-sm sm:text-base">{profile.jobCategory}</p>
                            {profile.otherCategory && (
                                <p className="text-gray-400 text-xs sm:text-sm mt-1">({profile.otherCategory})</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4 sm:space-y-6">
                    {/* Expected Salary */}
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <FaMoneyBillWave className="text-emerald-400 text-xl sm:text-2xl shrink-0" />
                            <h3 className="text-lg sm:text-xl font-bold text-white">Expected Salary</h3>
                        </div>
                        <p className="text-emerald-300 text-xl sm:text-2xl font-bold break-words">{profile.expectedSalary}</p>
                    </div>

                    {/* Experience */}
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <FaClock className="text-blue-400 text-xl sm:text-2xl shrink-0" />
                            <h3 className="text-lg sm:text-xl font-bold text-white">Experience</h3>
                        </div>
                        <p className="text-blue-300 text-base sm:text-lg">{profile.experience}</p>
                    </div>

                    {/* Skills */}
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <FaTools className="text-purple-400 text-xl sm:text-2xl shrink-0" />
                            <h3 className="text-lg sm:text-xl font-bold text-white">Skills</h3>
                        </div>
                        <p className="text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-line break-words">{profile.skills}</p>
                    </div>

                    {/* Address */}
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl border border-orange-500/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <FaMapMarkerAlt className="text-orange-400 text-xl sm:text-2xl shrink-0" />
                            <h3 className="text-lg sm:text-xl font-bold text-white">Address</h3>
                        </div>
                        <p className="text-gray-300 text-base sm:text-lg leading-relaxed break-words">{profile.address}</p>
                    </div>

                </div>

                {/* Footer Info */}


                {/* Footer Section with Action Buttons */}
                <div className="mt-8 sm:mt-12 border-t border-white/10 pt-8">
                    <div className="max-w-md mx-auto space-y-4">
                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(59,130,246,0.4)] shadow-lg border border-blue-500/30"
                        >
                            <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold text-lg">Logout</span>
                        </button>

                        {/* Delete Account Button */}
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(220,38,38,0.4)] shadow-lg border border-red-500/30"
                        >
                            <FaTrash className="text-base group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold text-lg">Delete My Account</span>
                        </button>
                        <p className="text-gray-500 text-xs text-center">This action cannot be undone</p>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-[#1a1f35] to-[#141929] border-2 border-red-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl transform animate-slideUp">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4 border-2 border-red-500/40">
                                <FaTrash className="text-red-500 text-3xl" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Delete Account?</h3>
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deleting}
                                className="flex-1 px-6 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 font-semibold text-white border border-white/20 hover:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed border border-red-500/50"
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
