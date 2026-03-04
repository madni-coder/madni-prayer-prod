"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";



export default function ViewMasjidPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams?.get("id");

    const [masjid, setMasjid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) {
            setError("Missing masjid id");
            setLoading(false);
            return;
        }

        let mounted = true;
        const fetchMasjid = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/all-masjids?id=${encodeURIComponent(id)}`);
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body?.error || res.statusText || "Failed to fetch");
                }
                const data = await res.json();
                if (!mounted) return;
                setMasjid(data);
            } catch (e) {
                if (!mounted) return;
                setError(e.message || "Failed to load masjid");
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        fetchMasjid();
        return () => {
            mounted = false;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="mb-4 text-red-600">Error: {error}</div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-3 py-2 bg-gray-200 rounded"
                    >
                        Back
                    </button>
                    <Link href="/admin/all-masjids">
                        <button className="px-3 py-2 bg-gray-100 rounded">All Masjids</button>
                    </Link>
                </div>
            </div>
        );
    }

    // If API returns object directly or { data }
    const m = masjid?.data ? masjid.data : masjid;

    if (!m) {
        return (
            <div className="p-6">
                <div>No masjid data available.</div>
                <div className="mt-3">
                    <button onClick={() => router.back()} className="px-3 py-2 bg-gray-200 rounded">
                        Back
                    </button>
                </div>
            </div>
        );
    }

    const display = (val) => {
        if (val === null || val === undefined) return <span className="text-red-600">Not Added</span>;
        if (Array.isArray(val)) return val.length ? val.join(", ") : <span className="text-red-600">Not Added</span>;
        const s = String(val).trim();
        return s.length === 0 ? <span className="text-red-600">Not Added</span> : s;
    };

    return (
        <div className="p-4 md:p-8 text-black">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold">Masjid Details</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => router.back()} className="px-3 py-2 bg-gray-100 rounded text-black">Back</button>
                    <Link href={`/admin/all-masjids/edit-jamatTime?id=${m.id}`}>
                        <button className="px-3 py-2 bg-yellow-300 text-black rounded">Edit</button>
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 md:p-6">

                {/* Top summary: Masjid name, address, login and password */}
                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Masjid</div>
                            <div className="text-2xl font-semibold text-black">{display(m.masjidName)}</div>
                            <div className="text-sm text-gray-700 mt-1">{display(m.colony)}{m.locality ? `, ${display(m.locality)}` : ''}</div>
                        </div>

                        <div className="flex items-start md:items-center gap-6">
                            <div>
                                <div className="text-sm text-gray-500">Login ID</div>
                                <div className="font-medium text-black">{display(m.loginId)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Password</div>
                                <div className="font-medium text-black">{display(m.password)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID removed as requested */}

                    <div>
                        <div className="text-sm text-gray-500">Role</div>
                        <div className="font-medium">{display(m.role)}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">Contact Name</div>
                        <div className="font-medium">{display(m.name)}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">Mobile</div>
                        <div className="font-medium">{display(m.mobile)}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">Location URL</div>
                        <div className="font-medium">
                            {m.pasteMapUrl ? (
                                <a href={m.pasteMapUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                                    Open Location
                                </a>
                            ) : (
                                display(m.pasteMapUrl)
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500">City</div>
                        <div className="font-medium">{display(m.city)}</div>
                    </div>

                    {/* Jamat Times removed as requested */}

                    <div className="md:col-span-2">
                        <div className="text-sm text-black">Members</div>
                        <div className="font-medium">{display(m.memberNames)}</div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="text-sm text-black">Mobile Numbers</div>
                        <div className="font-medium">{display(m.mobileNumbers)}</div>
                    </div>

                </div>
            </div>
        </div>
    );
}
