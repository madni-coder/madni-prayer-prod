"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";
import Link from "next/link";

export default function AdminMasjidCommittee() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [masjidMap, setMasjidMap] = useState({});

    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    useEffect(() => {
        if (loading) return;
        fetchList();
    }, [loading]);

    const fetchList = async () => {
        try {
            const [res, allRes] = await Promise.all([
                apiClient.get("/api/masjid-committee"),
                apiClient.get("/api/all-masjids"),
            ]);

            const list = res.data.data || res.data || [];
            setData(list);

            const all = (allRes.data.data || allRes.data || []);
            const map = {};
            all.forEach((m) => {
                map[m.id] = m;
            });
            setMasjidMap(map);
        } catch (err) {
            console.error(err);
        }
    };

    const displayOrNotAdded = (val) => {
        if (val === undefined || val === null) return <span className="text-red-500">Not Added</span>;
        if (typeof val === "string" && val.trim() === "") return <span className="text-red-500">Not Added</span>;
        return <span className="text-gray-800">{val}</span>;
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between text-error">
                <h1 className="text-2xl font-bold">Masjid Committee Registration</h1>
                <Link href="/admin/masjid-committee/register" className="px-3 py-2 bg-green-600 text-white rounded">Register Masjid</Link>
            </div>

            {/* Mobile: show cards */}
            <div className="grid grid-cols-1 gap-4 sm:hidden">
                {data && data.length ? (
                    data.map((row, idx) => {
                        return (
                            <div key={row.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-semibold">{idx + 1}</div>
                                        <div>
                                            <h3 className="text-base font-semibold text-gray-900">{row.masjidName}</h3>
                                            <p className="text-sm text-gray-600">{row.fullAddress}</p>
                                        </div>
                                    </div>
                                    <Link href={`/admin/masjid-committee/${row.id}`} className="text-blue-500">✏️</Link>
                                </div>

                                <div className="mt-3 text-sm text-gray-700">
                                    <div className="flex justify-between py-1"><span className="text-gray-500">Masjid Name:</span><span className="text-gray-800">{row.masjidName || <span className="text-red-500">Not Added</span>}</span></div>
                                    <div className="flex justify-between py-1"><span className="text-gray-500">Full Address:</span><span className="text-gray-800">{row.fullAddress || <span className="text-red-500">Not Added</span>}</span></div>
                                    <div className="flex justify-between py-1"><span className="text-gray-500">City:</span><span className="text-gray-800">{row.city || <span className="text-red-500">Not Added</span>}</span></div>
                                    <div className="flex justify-between py-1"><span className="text-gray-500">Mutwalli:</span><span className="text-gray-800">{row.mutwalliName || <span className="text-red-500">Not Added</span>}</span></div>
                                    <div className="flex justify-between py-1"><span className="text-gray-500">Mobile Number:</span><span className="text-gray-800">{(row.mobileNumbers || []).length ? (row.mobileNumbers || []).join(', ') : <span className="text-red-500">Not Added</span>}</span></div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded shadow p-4 text-center">No records found</div>
                )}
            </div>

            {/* Desktop/tablet: keep table for sm and up */}
            <div className="hidden sm:block bg-white rounded shadow overflow-x-auto font-bold text-black">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left">Masjid Name</th>
                            <th className="px-4 py-2 text-left">Full Address</th>
                            <th className="px-4 py-2 text-left">City</th>
                            <th className="px-4 py-2 text-left">Mutwalli</th>
                            <th className="px-4 py-2 text-left">Mobile Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length ? (
                            data.map((row) => (
                                <tr key={row.id} className="border-t text-primary font-bold">
                                    <td className="px-4 py-2">{row.masjidName}</td>
                                    <td className="px-4 py-2">{row.fullAddress}</td>
                                    <td className="px-4 py-2">{row.city}</td>
                                    <td className="px-4 py-2">{row.mutwalliName}</td>
                                    <td className="px-4 py-2">{(row.mobileNumbers || []).join(", ")}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="px-4 py-6 text-center" colSpan={5}>No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
