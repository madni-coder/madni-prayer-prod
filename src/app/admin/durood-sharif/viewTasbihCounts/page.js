"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {  FiPhone, FiMapPin, FiMail, FiClock, FiCalendar, FiHash, FiArrowLeft } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';

function ViewTasbihCountsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mobileNumber = searchParams.get("mobile");

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (!mobileNumber) {
            setError("Mobile number not provided");
            setLoading(false);
            return;
        }

        // Fetch user data from API
        fetch('/api/api-tasbihUsers')
            .then(res => res.json())
            .then(data => {
                if (data.ok && Array.isArray(data.data)) {
                    const user = data.data.find(u => u["mobile number"] === mobileNumber);
                    if (user) {
                        setUserData(user);
                    } else {
                        setError("User not found");
                    }
                } else {
                    setError("Failed to fetch user data");
                }
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                setError("Failed to fetch user data");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [mobileNumber]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5fb923]"></div>
                    <p className="mt-4 text-gray-600">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (error || !userData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <p className="text-red-600 text-lg font-semibold">{error || "User not found"}</p>
                    <button
                        onClick={() => router.push('/admin/durood-sharif')}
                        className="mt-4 px-6 py-2 bg-[#5fb923] text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Back to Durood Sharif
                    </button>
                </div>
            </div>
        );
    }

    const history = Array.isArray(userData.history) ? userData.history : [];
    const totalPages = Math.ceil(history.length / pageSize);
    const paginatedHistory = history.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/admin/durood-sharif')}
                    className="flex items-center gap-2 text-[#5fb923] hover:text-green-700 font-semibold mb-6 transition-colors"
                >
                    <FiArrowLeft className="text-xl" />
                    Back to Durood Sharif
                </button>

                {/* User Info Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="bg-[#5fb923] bg-opacity-10 rounded-full p-4 flex items-center justify-center">
                            <FaBitcoin className="text-4xl text-[#5fb923]" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                {userData["Full Name"] || 'Not Provided'}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <FiMail className="text-gray-400" />
                                    <span>{userData.Email || userData.email || 'Not Provided'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiPhone className="text-gray-400" />
                                    <span>{userData["mobile number"] || 'Not Provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <FiMapPin className="text-gray-400 text-lg" />
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium text-gray-800">
                                    {userData.Address || 'Not Provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Counts Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                        <div className="bg-orange-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Weekly Counts</p>
                                    <p className="text-3xl font-bold text-orange-800 mt-1">
                                        {userData["weekly counts"] || 0}
                                    </p>
                                </div>
                                <FiHash className="text-4xl text-orange-300" />
                            </div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Life Time Counts</p>
                                    <p className="text-3xl font-bold text-green-800 mt-1">
                                        {userData["Tasbih Counts"] || 0}
                                    </p>
                                </div>
                                <FiHash className="text-4xl text-green-300" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FiClock className="text-[#5fb923]" />
                            Durood History
                        </h2>
                        <span className="text-sm text-gray-500">
                            Total Entries: {history.length}
                        </span>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-center py-12">
                            <FiCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No history available</p>
                        </div>
                    ) : (
                        <>
                            {/* History Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Time
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Count
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Weekly Count
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paginatedHistory.map((entry, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-4 text-sm text-gray-800 font-medium">
                                                    {(currentPage - 1) * pageSize + idx + 1}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar className="text-gray-400" />
                                                        {entry.date || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <FiClock className="text-gray-400" />
                                                        {entry.time || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-right">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                                        {entry.count || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-right">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                                                        {entry.weeklyCounts || 0}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ViewTasbihCounts() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5fb923]"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <ViewTasbihCountsContent />
        </Suspense>
    );
}
