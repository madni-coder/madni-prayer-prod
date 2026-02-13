"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FaArrowLeft,
    FaUser,
    FaEnvelope,
    FaBriefcase,
    FaRupeeSign,
    FaClock,
    FaTools,
    FaMapMarkerAlt,
    FaCity,
    FaSearch,
    FaPhone,
    FaCopy,
} from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";
import apiClient from "../../../lib/apiClient";

// module-level cache/guard to prevent duplicate requests (helps in dev StrictMode)
let _jobSeekersCache = null;
let _jobSeekersRequested = false;

export default function HirePage() {
    const router = useRouter();
    const [selectedSeeker, setSelectedSeeker] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [seekers, setSeekers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [copied, setCopied] = useState(false);
    const seekersPerPage = 5; // show pagination after every 5 entries

    useEffect(() => {
        if (_jobSeekersRequested) {
            if (_jobSeekersCache) {
                setSeekers(_jobSeekersCache);
                setLoading(false);
            }
            return;
        }

        _jobSeekersRequested = true;

        async function fetchSeekers() {
            try {
                const { data } = await apiClient.get("/api/api-job-seekers");
                _jobSeekersCache = data || [];
                setSeekers(_jobSeekersCache);
            } catch (error) {
                console.error("Error fetching job seekers:", error);
                _jobSeekersCache = [];
                setSeekers([]);
            } finally {
                setLoading(false);
            }
        }

        fetchSeekers();
    }, []);



    // Filter seekers based on search term
    const filteredSeekers = seekers.filter(seeker =>
        seeker.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seeker.jobCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seeker.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination values
    const indexOfLastSeeker = currentPage * seekersPerPage;
    const indexOfFirstSeeker = indexOfLastSeeker - seekersPerPage;
    const currentSeekers = filteredSeekers.slice(indexOfFirstSeeker, indexOfLastSeeker);
    const totalPages = Math.ceil(filteredSeekers.length / seekersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewSeeker = (seeker) => {
        setSelectedSeeker(seeker);
    };

    const handleBack = () => {
        if (selectedSeeker) {
            setSelectedSeeker(null);
        } else {
            router.push("/jobPortal/jobLists");
        }
    };

    const handleCopyMobile = (mobile) => {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(mobile)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(() => {
                    // Fallback for mobile browsers
                    fallbackCopyTextToClipboard(mobile);
                });
        } else {
            // Fallback for older browsers and mobile
            fallbackCopyTextToClipboard(mobile);
        }
    };

    const fallbackCopyTextToClipboard = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Make the textarea invisible
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }

        document.body.removeChild(textArea);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a1e1e] via-[#0d1f28] to-[#0a1e1e] text-gray-200 pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#1a3535] to-[#142933] border-b border-teal-500/20 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 mt-4">
                    {/* Back Button and Title Row */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/10 hover:border-teal-500/50"
                        >
                            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-medium">Back</span>
                        </button>

                        <h1 className="text-2xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-500 to-teal-600">
                            Job Seekers
                        </h1>

                    </div>

                    {/* Description */}

                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Seeker List or Details */}
                {!selectedSeeker ? (
                    <>
                        {/* Search Bar */}
                        <div className="mb-8">
                            <div className="relative max-w-2xl mx-auto">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <FaSearch className="text-teal-400 text-lg" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, job category, or city..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-14 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <FaUser className="text-teal-500 text-xl animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-gray-400 font-medium">Loading job seekers...</p>
                                </div>
                            </div>
                        ) : filteredSeekers.length === 0 ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
                                    </div>
                                    <p className="text-gray-400 text-lg font-medium mb-2">
                                        {searchTerm ? "No job seekers found matching your search" : "No job seekers available at the moment"}
                                    </p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm("")}
                                            className="mt-4 px-6 py-2 bg-teal-500/20 hover:bg-teal-500/30 rounded-lg text-teal-400 font-medium transition-all duration-300"
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
                                        <span className="text-teal-400 font-semibold">Total {filteredSeekers.length} Job Seekers</span> 
                                    </p>
                                </div>

                                {/* Seeker Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {currentSeekers.map((seeker, index) => (
                                        <div
                                            key={seeker.id}
                                            className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-teal-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:-translate-y-1"
                                            style={{
                                                animationDelay: `${index * 100}ms`
                                            }}
                                        >
                                            {/* Gradient overlay on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-cyan-500/0 group-hover:from-teal-500/5 group-hover:to-cyan-500/5 rounded-2xl transition-all duration-500 pointer-events-none"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 pr-3">
                                                        <h2 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-teal-400 transition-colors duration-300">
                                                            {seeker.fullName}
                                                        </h2>
                                                        <p className="text-teal-400 font-semibold text-sm line-clamp-1">
                                                            {seeker.jobCategory}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 p-3 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                        <FaUser className="text-xl text-teal-400" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2.5 mb-5">
                                                    <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-teal-500/10 rounded-lg">
                                                            <FaCity className="text-teal-400 text-xs" />
                                                        </div>
                                                        <span className="line-clamp-1">{seeker.city}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-teal-500/10 rounded-lg">
                                                            <FaClock className="text-teal-400 text-xs" />
                                                        </div>
                                                        <span>{seeker.experience} years exp.</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-sm text-gray-300">
                                                        <div className="flex items-center justify-center w-8 h-8 bg-teal-500/10 rounded-lg">
                                                            <FaRupeeSign className="text-teal-400 text-xs" />
                                                        </div>
                                                        <span className="font-semibold text-teal-300">{seeker.expectedSalary}</span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleViewSeeker(seeker)}
                                                    className="w-full py-3 text-sm bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/50"
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
                                                : 'bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-600 border border-white/10 hover:border-transparent hover:shadow-lg hover:shadow-teal-500/30'
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
                                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/50 scale-110'
                                                            : 'bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 border border-white/10 hover:border-teal-500/50'
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
                                                : 'bg-white/5 backdrop-blur-sm text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-600 border border-white/10 hover:border-transparent hover:shadow-lg hover:shadow-teal-500/30'
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
                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedSeeker(null)}
                            className="flex items-center gap-2 px-4 py-2.5 mb-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-300 border border-white/10 hover:border-teal-500/50 text-white"
                        >
                            <FaArrowLeft className="text-sm" />
                            <span className="font-medium">Back to Seekers</span>
                        </button>

                        {/* Seeker Details Card */}
                        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl">
                            {/* Header Section with User Info */}
                            <div className="bg-gradient-to-r from-teal-600/10 via-cyan-600/10 to-teal-600/10 p-6 sm:p-8 border-b border-white/10">
                                <div className="flex items-center gap-5">
                                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 rounded-2xl shadow-lg">
                                        <FaUser className="text-4xl text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1 leading-tight">
                                            {selectedSeeker.fullName}
                                        </h2>
                                        <p className="text-teal-400 font-semibold text-xl">
                                            {selectedSeeker.jobCategory}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content - Clean List Style */}
                            <div className="p-8 sm:p-10">
                                <div className="space-y-6">
                                    {/* Location */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaCity className="text-teal-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Location</p>
                                            <p className="text-lg font-semibold text-white">{selectedSeeker.city}</p>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex items-start gap-4 py-4 border-b border-white/5">
                                        <FaTools className="text-teal-400 text-2xl flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-2">Skills</p>
                                            <p className="text-base text-gray-200 leading-relaxed">{selectedSeeker.skills}</p>
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaClock className="text-teal-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Experience</p>
                                            <p className="text-lg font-semibold text-white">{selectedSeeker.experience} years</p>
                                        </div>
                                    </div>

                                    {/* Expected Salary */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaRupeeSign className="text-teal-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Expected Salary</p>
                                            <p className="text-lg font-semibold text-teal-300">₹{selectedSeeker.expectedSalary}</p>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start gap-4 py-4 border-b border-white/5">
                                        <FaMapMarkerAlt className="text-teal-400 text-2xl flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-2">Full Address</p>
                                            <p className="text-base text-gray-200 leading-relaxed">{selectedSeeker.address}</p>
                                        </div>
                                    </div>

                                    {/* Mobile */}
                                    <div className="flex items-center gap-4 py-4 border-b border-white/5">
                                        <FaPhone className="text-teal-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Mobile Number</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-semibold text-white">{selectedSeeker.mobile || 'N/A'}</p>
                                                {selectedSeeker.mobile && (
                                                    <button
                                                        onClick={() => handleCopyMobile(selectedSeeker.mobile)}
                                                        className="p-2 bg-teal-500/10 hover:bg-teal-500/20 rounded-lg transition-all duration-300 group"
                                                        title={copied ? 'Copied!' : 'Copy mobile number'}
                                                    >
                                                        <FaCopy className={`text-sm ${copied ? 'text-green-400' : 'text-teal-400'} group-hover:scale-110 transition-transform duration-300`} />
                                                    </button>
                                                )}
                                            </div>
                                            {copied && (
                                                <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-center gap-4 py-4">
                                        <FaEnvelope className="text-teal-400 text-2xl flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Email Address</p>
                                            <a href={`mailto:${selectedSeeker.email}`} className="text-lg font-semibold text-white hover:text-teal-400 transition-colors underline">
                                                {selectedSeeker.email}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-10 pt-8 border-t border-white/10">
                                    {/* Call Button */}
                                    <a
                                        href={`tel:${selectedSeeker.mobile}`}
                                        className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-teal-500/50 text-white"
                                    >
                                        <FaPhone className="text-lg" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs text-teal-100">Call Now</span>
                                            <span className="text-base font-bold">{selectedSeeker.mobile || 'N/A'}</span>
                                        </div>
                                    </a>
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
