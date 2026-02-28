"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJobSeekerContext } from "../../../context/JobSeekerContext";

export default function JobSeekersAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { seekers, loading: seekersLoading, fetchAll } = useJobSeekerContext();
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
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        setCurrentPage(1);
    }, [seekers]);

    const totalPages = Math.max(1, Math.ceil(seekers.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const pageItems = seekers.slice(start, start + pageSize);
    const startItem = seekers.length === 0 ? 0 : start + 1;
    const endItem = Math.min(start + pageSize, seekers.length);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-0 mt-8">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-black">Job Seekers</h2>
            </div>

            <div className="p-4">
                {seekersLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span>Loading job seekers...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-yellow-500">
                                    <th className="text-left text-white px-4 py-3 border-b">S.No</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Full Name</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Email</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Job Category</th>
                                    <th className="text-left text-white px-4 py-3 border-b">City</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Experience</th>
                                    <th className="text-left text-white px-4 py-3 border-b">Applied Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seekers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                            No job seekers found.
                                        </td>
                                    </tr>
                                ) : (
                                    pageItems.map((seeker, idx) => {
                                        const handleOpen = () => router.push(`/admin/job-seekers/${seeker.id}`);
                                        return (
                                            <tr
                                                key={seeker.id}
                                                className="border-b last:border-b-0 hover:bg-emerald-50 cursor-pointer"
                                                onClick={handleOpen}
                                                tabIndex={0}
                                                role="button"
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(); }}
                                                title={`View ${seeker.fullName}'s application`}
                                            >
                                                <td className="px-4 py-3 text-gray-800">{start + idx + 1}</td>
                                                <td className="px-4 py-3 text-gray-800 font-semibold">{seeker.fullName}</td>
                                                <td className="px-4 py-3 text-gray-800">{seeker.email}</td>
                                                <td className="px-4 py-3 text-gray-800">
                                                    <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded">
                                                        {seeker.jobCategory}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-800">{seeker.city}</td>
                                                <td className="px-4 py-3 text-gray-800">{seeker.experience} years</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(seeker.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                            <div className="text-sm text-gray-600">Showing {startItem} to {endItem} of {seekers.length} entries</div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="px-3 py-1 bg-black text-white border rounded"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || seekers.length === 0}
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
                                    disabled={currentPage >= totalPages || seekers.length === 0}
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
