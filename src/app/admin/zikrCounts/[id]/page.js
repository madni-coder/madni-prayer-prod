'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import apiClient from "../../../../lib/apiClient";
import { FiUser, FiPhone, FiMapPin, FiHome, FiClock, FiTag, FiHash } from 'react-icons/fi';

export default function Page() {
    const params = useParams();
    const id = params?.id;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [groupedRecords, setGroupedRecords] = useState([]);
    const [typeCounts, setTypeCounts] = useState({});
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError(null);

        let mainRecord = null;

        apiClient
            .get(`/api/api-zikr`, { params: { id } })
            .then((res) => {
                mainRecord = res.data;
                setData(mainRecord);
                return apiClient.get(`/api/api-zikr`);
            })
            .then((allRes) => {
                const all = Array.isArray(allRes.data) ? allRes.data : (allRes.data ? [allRes.data] : []);

                // build matching keys
                const mobileKey = mainRecord && mainRecord.mobile ? String(mainRecord.mobile).trim() : null;
                const nameAddrKey = mainRecord ? `${(mainRecord.fullName || '').trim()}||${(mainRecord.address || '').trim()}` : null;

                const matched = all.filter((r) => {
                    if (mobileKey && r.mobile && String(r.mobile).trim() === mobileKey) return true;
                    const k = `${(r.fullName || '').trim()}||${(r.address || '').trim()}`;
                    return !mobileKey && nameAddrKey && k === nameAddrKey;
                });

                // compute per-type counts and totals
                const counts = {};
                let total = 0;
                for (const r of matched) {
                    const c = Number(r.zikrCounts) || 0;
                    total += c;
                    const incoming = Array.isArray(r.zikrTypes) ? r.zikrTypes : (r.zikrType ? [r.zikrType] : []);
                    for (const t of incoming.filter(Boolean)) {
                        counts[t] = (counts[t] || 0) + c;
                    }
                }

                setGroupedRecords(matched);
                setTypeCounts(counts);
                setTotalCount(total);
            })
            .catch((e) => setError(e?.message || 'Failed to fetch zikr'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        setCurrentPage(1);
    }, [groupedRecords]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-white rounded-xl shadow mt-8">
                <div className="text-red-600">Error: {error}</div>
                <div className="mt-4">
                    <Link href="/admin/zikrCounts">
                        <button className="px-3 py-1 bg-black text-white rounded">Back</button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-6 bg-white rounded-xl shadow mt-8">
                <div className="text-gray-600">Zikr record not found.</div>
                <div className="mt-4">
                    <Link href="/admin/zikrCounts">
                        <button className="px-3 py-1 bg-black text-white rounded">Back</button>
                    </Link>
                </div>
            </div>
        );
    }

    const updatedAt = data.updatedAt || data.createdAt;

    // pagination calculations
    const totalItems = groupedRecords.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);
    const pageItems = groupedRecords.slice(start, end);

    return (

        <div className="bg-white rounded-xl shadow p-6 mt-8">
            <Link href="/admin/zikrCounts">
                <button className="px-3 py-1 bg-black text-white rounded">Back</button>
            </Link>
            <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold text-black">Zikr Details</h2>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                    <FiUser className="text-2xl text-cyan-500 mt-1" />
                    <div>
                        <div className="text-sm text-gray-500">Full Name</div>
                        <div className="font-medium text-gray-800">{data.fullName ?? '-'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FiUser className="text-2xl text-cyan-500 mt-1" />
                    <div>
                        <div className="text-sm text-gray-500">Gender</div>
                        <div className="font-medium text-gray-800">{data.gender ?? '-'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FiMapPin className="text-2xl text-cyan-500 mt-1" />
                    <div>
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="font-medium text-gray-800">{data.address ?? '-'}</div>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <FiHome className="text-2xl text-cyan-500 mt-1" />
                    <div>
                        <div className="text-sm text-gray-500">Area Masjid</div>
                        <div className="font-medium text-gray-800">{data.areaMasjid ?? '-'}</div>
                    </div>
                </div>

                {/* Mobile intentionally hidden for privacy */}





                <div className="flex items-start gap-3">
                    <FiClock className="text-2xl text-gray-400 mt-1" />
                    <div>
                        <div className="text-sm text-gray-500">Last Updated</div>
                        <div className="text-sm text-gray-600">{updatedAt ? new Date(updatedAt).toLocaleString() : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Underlying records table with pagination */}
            {groupedRecords && groupedRecords.length > 0 && (
                <div className="mt-6 bg-white rounded p-4 shadow-sm">
                    <h3 className="font-bold text-black mb-3">Zikr Records ({totalItems})</h3>

                    <div className="overflow-x-auto">
                        <table className="w-auto divide-y divide-gray-200 text-sm">
                            <thead className="bg-blue-500">
                                <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Zikr Types</th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-white uppercase tracking-wider">Count</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">Created At</th>
                                </tr>

                            </thead>

                            <tbody className="bg-white divide-y divide-gray-100">
                                {pageItems.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-2 py-2 text-gray-800">{Array.isArray(r.zikrTypes) ? r.zikrTypes.join(', ') : (r.zikrType ?? '-')}</td>
                                        <td className="px-2 py-2 text-right text-orange-800 font-semibold">{r.zikrCounts ?? 0}</td>
                                        <td className="px-2 py-2 text-gray-600">{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : (r.createdAt ? new Date(r.createdAt).toLocaleString() : '-')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-green-500 border-t-2 border-gray-300">
                                <tr>
                                    <td className="px-2 py-2 text-sm text-white font-semibold">Total Count:</td>
                                    <td className="px-2 py-2 text-right text-sm font-bold text-white">{totalCount}</td>
                                    <td className="px-2 py-2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-600">Showing <span className="font-medium text-gray-800">{start + 1}</span> to <span className="font-medium text-gray-800">{end}</span> of <span className="font-medium text-gray-800">{totalItems}</span></div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded border ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                Prev
                            </button>

                            <div className="hidden sm:flex items-center space-x-1">
                                {Array.from({ length: totalPages }).map((_, idx) => {
                                    const page = idx + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded ${currentPage === page ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50 border border-transparent'}`}>
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                Next
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
