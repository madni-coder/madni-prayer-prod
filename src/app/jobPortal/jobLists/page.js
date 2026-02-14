"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaRupeeSign, FaArrowLeft, FaBullhorn, FaSearch, FaCopy, FaPhone, FaUser } from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";
import apiClient from "../../../lib/apiClient";

// module-level cache/guard to prevent duplicate requests (helps in dev StrictMode)
let _jobListsCache = null;
let _jobListsRequested = false;

export default function ViewJobsPage() {
    const router = useRouter();
    const [selectedJob, setSelectedJob] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [copied, setCopied] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status on mount and when window gains focus
    useEffect(() => {
        const checkAuth = () => {
            const auth = localStorage.getItem("jobSeekerAuth");
            setIsAuthenticated(!!auth);
        };

        checkAuth();

        // Re-check authentication when window gains focus (user comes back to tab)
        window.addEventListener('focus', checkAuth);

        return () => {
            window.removeEventListener('focus', checkAuth);
        };
    }, []);

    const handleCopy = async (text) => {
        if (!text) return;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'absolute';
                textarea.style.left = '-9999px';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const jobsPerPage = 5; // show pagination after every 5 entries

    useEffect(() => {
        if (_jobListsRequested) {
            // another mount already requested; reuse cached data if available
            if (_jobListsCache) {
                setJobs(_jobListsCache);
                setLoading(false);
            }
            return;
        }

        _jobListsRequested = true;

        async function fetchJobs() {
            try {
                const { data } = await apiClient.get("/api/api-job-lists");
                _jobListsCache = data || [];
                setJobs(_jobListsCache);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                _jobListsCache = [];
                setJobs([]);
            } finally {
                setLoading(false);
            }
        }

        fetchJobs();
    }, []);

    // Filter jobs based on search term
    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination values
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewJob = (job) => {
        setSelectedJob(job);
    };

    const handleBack = () => {
        if (selectedJob) {
            setSelectedJob(null);
        } else {
            router.push("/");
        }
    };

    const handleJobSeekerRedirect = () => {
        setShowLoader(true);
        setTimeout(() => {
            router.push("/jobPortal/applyForJob");
        }, 500);
    };

    const handleEmployerRedirect = () => {
        setShowLoader(true);
        setTimeout(() => {
            router.push("/jobPortal/hire");
        }, 500);
    };

    const handleMyProfile = () => {
        setShowLoader(true);
        setTimeout(() => {
            // Check authentication before redirecting
            const auth = localStorage.getItem("jobSeekerAuth");
            if (auth) {
                router.push("/jobPortal/Resume");
            } else {
                router.push("/jobPortal/auth/signin");
            }
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e] text-gray-200 pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#1a1f35] to-[#141929] border-b border-purple-500/20 shadow-xl">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-6">
                    {/* Mobile Layout */}
                    <div className="flex flex-col gap-3">
                        {/* Row 1: Back Button and Title */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                                <button
                                    onClick={handleBack}
                                    className="group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl transition-all duration-300 border border-white/10 hover:border-purple-500/50"
                                >
                                    <FaArrowLeft className="text-xs sm:text-sm group-hover:-translate-x-1 transition-transform duration-300" />
                                    <span className="text-xs sm:text-base font-medium hidden xs:inline">Back</span>
                                </button>

                                <h1 className="text-lg xs:text-xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                                    Job Portal
                                </h1>
                            </div>
                        </div>

                        {/* Row 2: Action Buttons */}
                        <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
                            <button
                                onClick={handleMyProfile}
                                className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] shadow-lg text-sm sm:text-base"
                            >
                                <FaUser className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-semibold">{isAuthenticated ? "My Profile" : "Apply For Job"}</span>
                            </button>

                            <button
                                onClick={handleEmployerRedirect}
                                className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] shadow-lg text-sm sm:text-base"
                            >
                                <FaBullhorn className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-semibold">Hire Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Job List or Details */}
                {!selectedJob ? (
                    <>
                        {/* Search Bar */}
                        <div className="mb-8">
                            <div className="relative max-w-2xl mx-auto">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <FaSearch className="text-purple-400 text-lg" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by job title or company"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-14 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <FaBriefcase className="text-purple-500 text-xl animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-gray-400 font-medium">Loading amazing opportunities...</p>
                                </div>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <FaBriefcase className="text-6xl text-gray-600 mx-auto mb-4" />
                                    </div>
                                    <p className="text-gray-400 text-lg font-medium mb-2">
                                        {searchTerm ? "No jobs found matching your search" : "No jobs available at the moment"}
                                    </p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="mt-4 px-6 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 font-medium transition-all duration-300"
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Results Count */}
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-gray-400 text-sm">
                                        <span className="text-purple-400 font-semibold">Total {filteredJobs.length} Jobs</span>
                                    </p>
                                </div>

                                {/* Job Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {currentJobs.map((job, index) => (
                                        <div
                                            key={job.id}
                                            className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:-translate-y-1"
                                            style={{
                                                animationDelay: `${index * 100}ms`
                                            }}
                                        >
                                            {/* Gradient overlay on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 rounded-2xl transition-all duration-500 pointer-events-none"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 pr-3">
                                                        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors duration-300">
                                                            {job.title}
                                                        </h2>
                                                        <p className="text-purple-400 font-semibold text-sm">
                                                            {job.company}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                        <FaBriefcase className="text-xl text-purple-400" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5 mb-5">
                                                    <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-lg">
                                                            <FaMapMarkerAlt className="text-purple-400 text-xs" />
                                                        </div>
                                                        <span className="line-clamp-1">{job.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-lg">
                                                            <FaClock className="text-purple-400 text-xs" />
                                                        </div>
                                                        <span>{job.type}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-purple-500/10 rounded-lg">
                                                            <FaRupeeSign className="text-purple-400 text-xs" />
                                                        </div>
                                                        <span className="font-semibold text-purple-300">{job.salary}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleViewJob(job)}
                                                    className="w-full py-3 text-sm bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-10 flex justify-center items-center gap-3">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${currentPage === 1
                                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                                : 'bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 border border-white/10 hover:border-transparent hover:shadow-lg hover:shadow-purple-500/30'
                                                }`}
                                        >
                                            Previous
                                        </button>

                                        <div className="flex gap-2">
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${currentPage === pageNumber
                                                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50 scale-110'
                                                            : 'bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 border border-white/10 hover:border-purple-500/50'
                                                            }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${currentPage === totalPages
                                                ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                                : 'bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 border border-white/10 hover:border-transparent hover:shadow-lg hover:shadow-purple-500/30'
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        {/* Job Details Card */}
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                            {/* Header Section with Job Info */}
                            <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 p-8 sm:p-10 border-b border-white/10">
                                <div className="flex items-center gap-5">
                                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-2xl shadow-lg">
                                        <FaBriefcase className="text-4xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1 leading-tight">
                                            {selectedJob.title}
                                        </h2>
                                        <p className="text-purple-400 font-semibold text-xl">
                                            {selectedJob.company}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content - Clean List Style */}
                            <div className="p-8 sm:p-10">
                                <div className="space-y-6">
                                    {/* Location */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaMapMarkerAlt className="text-purple-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Location</p>
                                            <p className="text-lg font-semibold text-white">{selectedJob.location}</p>
                                        </div>
                                    </div>

                                    {/* Job Type */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaClock className="text-purple-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Job Type</p>
                                            <p className="text-lg font-semibold text-white">{selectedJob.type}</p>
                                        </div>
                                    </div>

                                    {/* Salary */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaRupeeSign className="text-purple-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Salary</p>
                                            <p className="text-lg font-semibold text-purple-300">{selectedJob.salary}</p>
                                        </div>
                                    </div>

                                    {/* Job Description */}
                                    <div className="flex items-start gap-4 py-4 border-b border-white/5">
                                        <FaBriefcase className="text-purple-400 text-2xl flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-2">Job Description</p>
                                            <p className="text-base text-gray-200 leading-relaxed">{selectedJob.description}</p>
                                        </div>
                                    </div>

                                    {/* Requirements */}
                                    {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                        <div className="py-4 border-b border-white/5">
                                            <p className="text-sm text-gray-400 mb-3">Requirements</p>
                                            <ul className="space-y-2.5 ml-2">
                                                {selectedJob.requirements.map((req, index) => (
                                                    <li key={index} className="flex items-start gap-3 text-gray-200">
                                                        <span className="text-purple-400 mt-1">✓</span>
                                                        <span className="leading-relaxed">{req}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Responsibilities */}
                                    {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                                        <div className="py-4">
                                            <p className="text-sm text-gray-400 mb-3">Responsibilities</p>
                                            <ul className="space-y-2.5 ml-2">
                                                {selectedJob.responsibilities.map((resp, index) => (
                                                    <li key={index} className="flex items-start gap-3 text-gray-200">
                                                        <span className="text-purple-400 mt-1">→</span>
                                                        <span className="leading-relaxed">{resp}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Contact Mobile */}
                                    {selectedJob.mobile && (
                                        <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-400 mb-1">Call Us</p>
                                                <div className="flex items-center gap-3">
                                                    <FaPhone className="text-purple-400 text-2xl flex-shrink-0" />
                                                    <p className="text-lg font-semibold text-white">{selectedJob.mobile}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(selectedJob.mobile)}
                                                        className="p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-200 flex items-center gap-2"
                                                    >
                                                        <FaCopy />
                                                        <span className="text-sm">{copied ? 'Copied' : 'Copy'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-8 border-t border-white/10">
                                    <button
                                        onClick={() => setSelectedJob(null)}
                                        className="flex items-center justify-center gap-2 flex-1 py-4 bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl font-semibold transition-all duration-300 text-white"
                                    >
                                        <FaArrowLeft className="text-sm" />
                                        Back to Jobs
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showLoader && <AnimatedLooader message="Loading..." />}
        </div>
    );
}
