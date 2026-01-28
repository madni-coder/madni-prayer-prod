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

    // no local filtering/pagination — show all zikr records in a table

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
                ) : zikrList.length === 0 ? (
                    <div className="text-sm text-gray-500">No zikr records found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="bg-cyan-500">
                                    <th className="text-left text-white">#</th>
                                    <th className="text-left text-white">Gender</th>
                                    <th className="text-left text-white">Full Name</th>
                                    <th className="text-left text-white">Address</th>
                                    <th className="text-left text-white">Area Masjid</th>
                                    <th className="text-left text-white">Mobile</th>
                                    <th className="text-left text-white">Zikr Type</th>
                                    <th className="text-left text-white">Zikr Counts</th>
                                    <th className="text-left text-white">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zikrList.map((z, idx) => (
                                    <tr key={z.id ?? idx} className="border-b last:border-b-0 hover:bg-gray-50">
                                        <td className="py-3 text-gray-800">{idx + 1}</td>
                                        <td className="py-3 text-gray-800">{z.gender ?? "-"}</td>
                                        <td className="py-3 text-gray-800">{z.fullName ?? "-"}</td>
                                        <td className="py-3 text-gray-800">{z.address ?? "-"}</td>
                                        <td className="py-3 text-gray-800">{z.areaMasjid ?? "-"}</td>
                                        <td className="py-3 text-gray-800">{z.mobile ?? "-"}</td>
                                        <td className="py-3 text-gray-800">{z.zikrType ?? "-"}</td>
                                        <td className="py-3 text-orange-800 font-bold">{z.zikrCounts ?? 0}</td>
                                        <td className="py-3 text-sm text-gray-500">{z.createdAt ? new Date(z.createdAt).toLocaleString() : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
