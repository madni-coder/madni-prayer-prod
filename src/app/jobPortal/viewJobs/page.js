"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaBriefcase, FaMapMarkerAlt, FaClock, FaDollarSign, FaArrowLeft, FaUserPlus } from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";

// Demo job data
const demoJobs = [
    {
        id: 1,
        title: "Software Engineer",
        company: "Tech Solutions Ltd.",
        location: "Karachi, Pakistan",
        type: "Full-time",
        salary: "Rs. 80,000 - 120,000",
        postedDate: "2 days ago",
        description: "We are looking for a skilled Software Engineer to join our dynamic team. The ideal candidate will have experience in React, Node.js, and modern web technologies.",
        requirements: [
            "3+ years of experience in software development",
            "Strong knowledge of JavaScript, React, and Node.js",
            "Experience with databases (SQL/NoSQL)",
            "Good communication skills",
            "Bachelor's degree in Computer Science or related field"
        ],
        responsibilities: [
            "Develop and maintain web applications",
            "Collaborate with cross-functional teams",
            "Write clean, maintainable code",
            "Participate in code reviews",
            "Stay up-to-date with latest technologies"
        ]
    },
    {
        id: 2,
        title: "Digital Marketing Manager",
        company: "Creative Media Agency",
        location: "Lahore, Pakistan",
        type: "Full-time",
        salary: "Rs. 60,000 - 90,000",
        postedDate: "5 days ago",
        description: "Join our creative team as a Digital Marketing Manager. You'll be responsible for developing and executing digital marketing strategies to drive business growth.",
        requirements: [
            "5+ years of experience in digital marketing",
            "Expertise in SEO, SEM, and social media marketing",
            "Experience with Google Analytics and marketing tools",
            "Strong analytical and problem-solving skills",
            "Excellent written and verbal communication"
        ],
        responsibilities: [
            "Develop and implement digital marketing campaigns",
            "Manage social media platforms and content",
            "Analyze campaign performance and ROI",
            "Coordinate with design and content teams",
            "Stay current with digital marketing trends"
        ]
    }
];

export default function ViewJobsPage() {
    const router = useRouter();
    const [selectedJob, setSelectedJob] = useState(null);
    const [showLoader, setShowLoader] = useState(false);

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
                        {demoJobs.map((job) => (
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
                                        <span>{job.type} • {job.postedDate}</span>
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
                            <p className="text-gray-300 leading-relaxed">
                                {selectedJob.description}
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3 text-purple-400">Requirements</h3>
                            <ul className="space-y-2">
                                {selectedJob.requirements.map((req, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <span>{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3 text-purple-400">Responsibilities</h3>
                            <ul className="space-y-2">
                                {selectedJob.responsibilities.map((resp, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-1">•</span>
                                        <span>{resp}</span>
                                    </li>
                                ))}
                            </ul>
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
