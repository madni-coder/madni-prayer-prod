"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaDollarSign, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";
import apiClient from "../../../lib/apiClient";

export default function ViewJobsPage() {
    const router = useRouter();
    const [selectedJob, setSelectedJob] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const jobsPerPage = 5;

    useEffect(() => {
        async function fetchJobs() {
            try {
                const { data } = await apiClient.get("/api/api-job-lists");
                setJobs(data || []);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        }

        fetchJobs();
    }, []);

    // Calculate pagination values
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(jobs.length / jobsPerPage);

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
            router.push("/jobPortal/jobSeekers");
        }, 500);
    };

    return (
        <div className="min-h-screen bg-[#09152a] text-gray-200 p-3 sm:p-4 pb-20">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#243447] hover:bg-[#2d3f54] rounded-lg transition-colors"
                    >
                        <FaArrowLeft className="text-xs" />
                        <span>Back</span>
                    </button>

                    <button
                        onClick={handleJobSeekerRedirect}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                        <FaUserPlus className="text-xs" />
                        <span className="font-semibold">I Want Job</span>
                    </button>
                </div>

                <div className="text-center mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Job Portal
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm">{selectedJob ? "Job Details" : "Find Your Dream Job"}
                    </p>
                </div>

                {/* Job List or Details */}
                {!selectedJob ? (
                    loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                                <p className="text-gray-400">Loading jobs...</p>
                            </div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-gray-400">No jobs available at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                                {currentJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="bg-[#243447] rounded-lg p-3 sm:p-4 border border-[#2d3f54] hover:border-purple-500 transition-all hover:shadow-xl"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                                                    {job.title}
                                                </h2>
                                                <p className="text-purple-400 font-semibold text-sm mb-1">
                                                    {job.company}
                                                </p>
                                            </div>
                                            <div className="bg-purple-500/20 p-2 rounded-full flex-shrink-0">
                                                <FaBriefcase className="text-lg text-purple-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-2">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                                <FaMapMarkerAlt className="text-purple-400 text-xs" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                                <FaClock className="text-purple-400 text-xs" />
                                                <span>{job.type} • {job.postedDate || new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-300">
                                                <FaDollarSign className="text-purple-400 text-xs" />
                                                <span>{job.salary}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleViewJob(job)}
                                            className="w-full py-1.5 text-sm bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                                            ? 'bg-[#1e2f3f] text-gray-500 cursor-not-allowed'
                                            : 'bg-[#243447] text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600'
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
                                                    className={`px-3 py-2 rounded-lg font-semibold transition-all ${currentPage === pageNumber
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                                        : 'bg-[#243447] text-white hover:bg-[#2d3f54]'
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
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                                            ? 'bg-[#1e2f3f] text-gray-500 cursor-not-allowed'
                                            : 'bg-[#243447] text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600'
                                            }`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )
                ) : (
                    <div className="bg-[#243447] rounded-xl p-4 sm:p-8 border border-[#2d3f54] max-w-4xl mx-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                    {selectedJob.title}
                                </h2>
                                <p className="text-purple-400 font-semibold text-lg mb-4">
                                    {selectedJob.company}
                                </p>
                            </div>
                            <div className="bg-purple-500/20 p-4 rounded-full">
                                <FaBriefcase className="text-3xl text-purple-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-3 bg-[#1e2f3f] p-3 rounded-lg">
                                <FaMapMarkerAlt className="text-purple-400 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-400">Location</p>
                                    <p className="text-sm font-semibold">{selectedJob.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-[#1e2f3f] p-3 rounded-lg">
                                <FaClock className="text-purple-400 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-400">Job Type</p>
                                    <p className="text-sm font-semibold">{selectedJob.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-[#1e2f3f] p-3 rounded-lg">
                                <FaDollarSign className="text-purple-400 text-xl" />
                                <div>
                                    <p className="text-xs text-gray-400">Salary</p>
                                    <p className="text-sm font-semibold">{selectedJob.salary}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3 text-purple-400">Job Description</h3>
                            <p className="text-gray-300 leading-relaxed">{selectedJob.description}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3 text-purple-400">Requirements</h3>
                            {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedJob.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-300">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400">No specific requirements listed.</p>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3 text-purple-400">Responsibilities</h3>
                            {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 ? (
                                <ul className="space-y-2">
                                    {selectedJob.responsibilities.map((resp, index) => (
                                        <li key={index} className="flex items-start gap-2 text-gray-300">
                                            <span className="text-purple-400 mt-1">•</span>
                                            <span>{resp}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400">No specific responsibilities listed.</p>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="flex-1 py-3 bg-[#1e2f3f] hover:bg-[#2d3f54] rounded-lg font-semibold transition-colors"
                            >
                                Back to Jobs
                            </button>
                            <button
                                onClick={handleJobSeekerRedirect}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                            >
                                Apply Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showLoader && <AnimatedLooader message="Loading..." />}
        </div>
    );
}
