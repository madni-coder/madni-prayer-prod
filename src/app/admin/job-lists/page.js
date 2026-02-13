"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";
import { Plus } from "lucide-react";

export default function JobListsAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(15);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const { data } = await apiClient.get("/api/api-job-lists");
                setJobs(data || []);
            } catch (e) {
                console.error("Error fetching jobs:", e);
                setJobs([]);
            } finally {
                setJobsLoading(false);
            }
        }

        fetchJobs();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [jobs]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const pageItems = jobs.slice(start, start + pageSize);
    const startItem = jobs.length === 0 ? 0 : start + 1;
    const endItem = Math.min(start + pageSize, jobs.length);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-0 mt-8">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-bold text-black">Job Lists</h2>
                <button
                    onClick={() => router.push("/admin/job-lists/create")}
                    className="px-3 py-1.5 bg-cyan-500 text-white rounded hover:bg-cyan-600 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add New Job
                </button>
            </div>

            <div className="p-4">
                {jobsLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span>Loading jobs...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-indigo-500">
                                    <th className="text-left text-white px-4 py-3 border-b">S.No</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Job Title</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Company</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Location</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Type</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Salary</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Posted Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                            No jobs found.
                                        </td>
                                    </tr>
                                ) : (
                                    pageItems.map((job, idx) => {
                                        const handleOpen = () => router.push(`/admin/job-lists/${job.id}`);
                                        return (
                                            <tr
                                                key={job.id}
                                                className="border-b last:border-b-0 hover:bg-emerald-50 cursor-pointer"
                                                onClick={handleOpen}
                                                tabIndex={0}
                                                role="button"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(); }}
                                                title={`View ${job.title}`}
                                            >
                                                <td className="px-4 py-3 text-gray-800">{start + idx + 1}</td>
                                                <td className="px-4 py-3 text-gray-800 font-semibold">{job.title}</td>
                                                <td className="px-4 py-3 text-gray-800">{job.company}</td>
                                                <td className="px-4 py-3 text-gray-800">{job.location}</td>
                                                <td className="px-4 py-3 text-gray-800">
                                                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded">{job.type}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-800">{job.salary}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(job.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                            <div className="text-sm text-gray-600">Showing {startItem} to {endItem} of {jobs.length} entries</div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-3 py-1 bg-black text-white border rounded"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || jobs.length === 0}
                                >
                                    Prev
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-cyan-500 text-white' : 'bg-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 bg-black text-white border rounded"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages || jobs.length === 0}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
