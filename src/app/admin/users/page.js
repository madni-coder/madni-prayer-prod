"use client";

import { useEffect, useState } from "react";
import apiClient from "../../../lib/apiClient";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(15);

    useEffect(() => {
        // fetch registered users from the API using axios
        (async () => {
            try {
                const { data } = await apiClient.get("/api/auth/register");
                if (data?.error) {
                    setError(data.error);
                } else if (Array.isArray(data)) {
                    // endpoint may return an array of users directly
                    setUsers(data);
                } else {
                    setUsers(data?.users || []);
                }
            } catch (err) {
                setError(err?.response?.data?.error || err.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // reset page when users change
    useEffect(() => {
        setCurrentPage(1);
    }, [users]);

    // ensure currentPage is within bounds when users or pageSize change
    useEffect(() => {
        const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
        setCurrentPage((p) => Math.min(p, totalPages));
    }, [users, pageSize]);

    // pagination calculations in component scope
    const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const pageItems = users.slice(start, start + pageSize);
    const startItem = users.length === 0 ? 0 : start + 1;
    const endItem = Math.min(start + pageSize, users.length);

    // no theme/dark-mode handling here — page uses a light design with black text

    return (
        <div className="w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-black">Registered Users</h1>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="p-4 border-b border-transparent">
                    <p className="text-sm text-gray-700">A table of all registered users.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed w-full">
                        <colgroup>
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <thead>
                            <tr className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 text-black rounded-t-lg">
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Gender</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Full Name</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Address</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Area Masjid</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-700">Loading...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-600">{error}</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-700">No users found.</td>
                                </tr>
                            ) : (
                                pageItems.map((u, idx) => (
                                    <tr key={u.id || start + idx} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.gender || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{u.fullName || u.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-black whitespace-normal break-words">{u.address || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-black whitespace-normal break-words">{u.areaMasjid || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination - always visible (outside horizontal scroller) */}
                <div className="px-4 py-3 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">Showing {startItem} to {endItem} of {users.length} entries</div>
                    <div className="flex items-center gap-2">

                        <button
                            className="px-3 py-1 bg-black border rounded disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || users.length === 0}
                        >
                            Prev
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-cyan-500 text-black' : 'bg-white'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className="px-3 py-1 bg-black border rounded disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages || users.length === 0}
                        >
                            Next
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

