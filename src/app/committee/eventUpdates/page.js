"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";

export default function EventUpdates() {
    const router = useRouter();
    const [currentMasjidId, setCurrentMasjidId] = useState(null);

    // Read query param on client to avoid useSearchParams SSR bailout issues
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const sp = new URLSearchParams(window.location.search || "");
                const id = sp.get("masjidId");
                if (id) setCurrentMasjidId(id);
            }
        } catch (e) {
            // ignore
        }
    }, []);

    const [masjid, setMasjid] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleCopyMasjidId = () => {
        if (currentMasjidId) {
            navigator.clipboard.writeText(currentMasjidId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // fallback: use localStorage masjid id when query param is not present
    useEffect(() => {
        if (!currentMasjidId) {
            try {
                const stored = typeof window !== "undefined" ? window.localStorage.getItem("masjidCommittee_masjidId") : null;
                if (stored) setCurrentMasjidId(stored);
            } catch (e) {
                // ignore
            }
        }
    }, [currentMasjidId]);

    useEffect(() => {
        if (!currentMasjidId) return;
        const fetchMasjid = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiClient.get(`/api/masjid-committee`, { params: { masjidId: currentMasjidId } });
                // API returns the masjid object directly for single result
                const data = res?.data;
                if (!data) throw new Error("No data returned from server");
                // If the API wrapped response in { data } for list endpoints, handle that
                const payload = data.data && !data.masjidName ? data.data : data;
                const copy = { ...payload };
                if (copy.password) delete copy.password;
                setMasjid(copy);
            } catch (err) {
                setError(err?.response?.data?.error || err.message || "Failed to load masjid details");
            } finally {
                setLoading(false);
            }
        };
        fetchMasjid();
    }, [currentMasjidId]);

    // Filter out unwanted fields
    const excludedFields = ['password', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'id'];

    const renderField = (label, value) => {
        if (!value) return null;
        return (
            <div className="py-3 px-4 bg-slate-800/30 rounded-lg">
                <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1 break-words">{label}</div>
                <div className="text-white font-medium break-words whitespace-pre-wrap">{String(value)}</div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Masjid Details</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.back()}
                            className="px-3 py-2 sm:px-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-white text-sm font-medium transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => {
                                try {
                                    if (typeof window !== "undefined") {
                                        window.localStorage.removeItem("masjidCommittee_auth");
                                        window.localStorage.removeItem("masjidCommittee_masjidId");
                                    }
                                } catch (e) { }
                                router.replace("/committee");
                            }}
                            className="px-3 py-2 sm:px-4 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-slate-700 rounded w-1/2" />
                            <div className="h-4 bg-slate-700 rounded w-full" />
                            <div className="h-4 bg-slate-700 rounded w-3/4" />
                            <div className="h-4 bg-slate-700 rounded w-5/6" />
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                        <svg className="h-6 w-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-200">{error}</span>
                    </div>
                )}

                {/* Masjid Details */}
                {!loading && masjid && (
                    <div className="space-y-4">
                        {/* Header Card */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 shadow-lg">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-words">
                                        {masjid.masjidName || masjid.name || "—"}
                                    </h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-emerald-50 text-sm break-all">Masjid ID: {currentMasjidId}</p>
                                        <button
                                            onClick={handleCopyMasjidId}
                                            className="p-1.5 hover:bg-white/20 rounded-lg transition-all flex-shrink-0"
                                            title="Copy Masjid ID"
                                        >
                                            {copied ? (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden sm:block flex-shrink-0">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderField("Masjid Name", masjid.masjidName || masjid.name)}
                                {renderField("Mobile Numbers", masjid.mobileNumbers || masjid.mobile || masjid.phone || masjid.contactNumber)}
                                {renderField("Address", masjid.fullAddress || masjid.address)}
                                {renderField("City", masjid.city)}
                                {renderField("Mutwalli Name", masjid.mutwalliName)}
                                {renderField("Committee Members", masjid.committeeMembers)}
                                {renderField("Imam Name", masjid.imamName)}

                                {/* Show any remaining fields that aren't in excluded list */}
                                {Object.keys(masjid).filter(k =>
                                    !excludedFields.includes(k) &&
                                    !['masjidName', 'name', 'mobileNumbers', 'mobile', 'phone', 'contactNumber',
                                        'fullAddress', 'address', 'city', 'mutwalliName', 'committeeMembers',
                                        'imamName', 'masjidId'].includes(k) &&
                                    masjid[k] !== undefined &&
                                    masjid[k] !== null
                                ).map(key =>
                                    renderField(
                                        key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                                        masjid[key]
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !masjid && !error && (
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-slate-700/50">
                        <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-400">Provide a valid Masjid ID to view details.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
