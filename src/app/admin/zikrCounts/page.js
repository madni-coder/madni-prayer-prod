"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";
// no icon needed for this table view

export const dynamic = 'force-dynamic';

export default function ZikrCountsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [zikrList, setZikrList] = useState([]);
    const [zikrLoading, setZikrLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(15); // fixed page size (changed to 15)

    useEffect(() => {
        // Check authentication on client side
        const isAuthenticated =
            localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        setLoading(false);
    }, [router]);

    // no users fetch — this page only shows zikr records

    useEffect(() => {
        async function fetchZikr() {
            try {
                const { data } = await apiClient.get("/api/api-zikr");
                // route returns either an array (all) or an object (single)
                if (Array.isArray(data)) setZikrList(data);
                else if (data) setZikrList([data]);
                else setZikrList([]);
            } catch (e) {
                console.error("Error fetching zikr:", e);
                setZikrList([]);
            } finally {
                setZikrLoading(false);
            }
        }

        fetchZikr();
    }, []);

    // reset page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [zikrList]);

    // no local filtering/pagination — show all zikr records in a table

    // Group duplicate entries by mobile (fallback to fullName+address) and aggregate counts/types
    const grouped = React.useMemo(() => {
        const map = new Map();
        for (const r of zikrList) {
            const key = r.mobile && String(r.mobile).trim() !== ''
                ? String(r.mobile).trim()
                : `${(r.fullName || '').trim()}||${(r.address || '').trim()}`;

            const incomingTypes = Array.isArray(r.zikrTypes)
                ? r.zikrTypes
                : (r.zikrType ? [r.zikrType] : []);

            if (map.has(key)) {
                const ex = map.get(key);
                ex.zikrCounts = (Number(ex.zikrCounts) || 0) + (Number(r.zikrCounts) || 0);
                const merged = new Set([...(ex.zikrTypes || []), ...incomingTypes.filter(Boolean)]);
                ex.zikrTypes = Array.from(merged);
                const exTime = new Date(ex.updatedAt || ex.createdAt || 0).getTime();
                const inTime = new Date(r.updatedAt || r.createdAt || 0).getTime();
                if (inTime > exTime) {
                    ex.updatedAt = r.updatedAt || r.createdAt;
                }
                ex.repIds.push(r.id);
            } else {
                map.set(key, {
                    id: r.id,
                    repIds: [r.id],
                    gender: r.gender,
                    fullName: r.fullName,
                    address: r.address,
                    areaMasjid: r.areaMasjid,
                    mobile: r.mobile,
                    zikrTypes: incomingTypes.filter(Boolean),
                    zikrCounts: Number(r.zikrCounts) || 0,
                    createdAt: r.createdAt,
                    updatedAt: r.updatedAt || r.createdAt,
                });
            }
        }
        return Array.from(map.values());
    }, [zikrList]);

    // pagination calculations (computed in component scope so JSX can access)
    const totalPages = Math.max(1, Math.ceil(grouped.length / pageSize));
    const start = (currentPage - 1) * pageSize;
    const pageItems = grouped.slice(start, start + pageSize);
    const startItem = grouped.length === 0 ? 0 : start + 1;
    const endItem = Math.min(start + pageSize, grouped.length);

    // Show loading while checking authentication
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
                <h2 className="text-lg font-bold text-black">Zikr Records</h2>
            </div>

            <div className="p-4">
                {zikrLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span>Loading zikr records...</span>
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="text-sm text-gray-500">No zikr records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-cyan-500">
                                    <th className="text-left text-white">S.No</th>
                                    <th className="text-left text-white">Gender</th>
                                    <th className="text-left text-white">Full Name</th>
                                    <th className="text-left text-white">Address</th>
                                    <th className="text-left text-white">Area Masjid</th>
                                    <th className="text-left text-white">Mobile</th>
                                    <th className="text-left text-white">Zikr Type</th>
                                    <th className="text-left text-white">Zikr Counts</th>
                                    <th className="text-left text-white">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.map((z, idx) => {
                                    const recordId = z.id ?? start + idx;
                                    const handleOpen = () => router.push(`/admin/zikrCounts/${recordId}`);
                                    return (
                                        <tr
                                            key={recordId}
                                            className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                            onClick={handleOpen}
                                            tabIndex={0}
                                            role="button"
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(); }}
                                            title={z.fullName ? `Open ${z.fullName}` : 'Open zikr record'}
                                        >
                                            <td className="py-3 text-gray-800">{start + idx + 1}</td>
                                            <td className="py-3 text-gray-800">{z.gender ?? "-"}</td>
                                            <td className="py-3 text-gray-800">{z.fullName ?? "-"}</td>
                                            <td className="py-3 text-gray-800">{z.address ?? "-"}</td>
                                            <td className="py-3 text-gray-800">{z.areaMasjid ?? "-"}</td>
                                            <td className="py-3 text-gray-800">{z.mobile ?? "-"}</td>
                                            <td className="py-3 text-gray-800">{(z.zikrTypes && z.zikrTypes.length) ? z.zikrTypes.join(', ') : '-'}</td>
                                            <td className="py-3 text-orange-800 font-bold">{z.zikrCounts ?? 0}</td>
                                            <td className="py-3 text-sm text-gray-500">{z.updatedAt ? new Date(z.updatedAt).toLocaleString() : (z.createdAt ? new Date(z.createdAt).toLocaleString() : "-")}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {/* Pagination - always visible */}
                        <div className="mt-4 flex items-center justify-between border-t pt-3">
                            <div className="text-sm text-gray-600">Showing {startItem} to {endItem} of {grouped.length} entries</div>
                            <div className="flex items-center gap-2">

                                <button
                                    className="px-3 py-1 bg-black border rounded "
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || grouped.length === 0}
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
                                    className="px-3 py-1 bg-black border rounded "
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages || grouped.length === 0}
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
