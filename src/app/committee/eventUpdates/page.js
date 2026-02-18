"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";

// Simple carousel for event images (no external deps)
function Carousel({ images = [] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [images]);

    if (!images || images.length === 0) return null;

    const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const next = () => setIndex((i) => (i + 1) % images.length);

    return (
        <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={images[index]}
                alt={`Raahe Hidayat Event ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-2xl border-4 border-emerald-500/20"
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        aria-label="Previous image"
                        className="absolute -left-6 bottom-1 p-3 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-full z-30 shadow-lg ring-1 ring-emerald-200/20"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={next}
                        aria-label="Next image"
                        className="absolute -right-6 bottom-1 p-3 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-full z-30 shadow-lg ring-1 ring-emerald-200/20"
                    >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-20 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setIndex(idx)}
                                aria-label={`Go to image ${idx + 1}`}
                                className={`w-3 h-3 rounded-full transition-transform duration-150 ${idx === index ? 'bg-emerald-400 scale-110' : 'bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function EventUpdates() {
    const router = useRouter();
    const [currentMasjidId, setCurrentMasjidId] = useState(null);

    // Determine masjid id from query param or localStorage (single effect to avoid duplicate sets)
    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            const sp = new URLSearchParams(window.location.search || "");
            const paramId = sp.get("masjidId");
            const stored = window.localStorage.getItem("masjidCommittee_masjidId");
            const id = paramId || stored;
            if (id) setCurrentMasjidId(id);
        } catch (e) {
            // ignore
        }
    }, []);

    const [masjid, setMasjid] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const fetchingRef = useRef(null);

    const handleCopyMasjidId = () => {
        if (currentMasjidId) {
            navigator.clipboard.writeText(currentMasjidId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // (removed separate fallback effect) single effect above handles both param and fallback

    useEffect(() => {
        if (!currentMasjidId) return;

        // avoid duplicate identical fetches when effect runs multiple times
        if (fetchingRef.current === currentMasjidId) return;
        fetchingRef.current = currentMasjidId;

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
                // clear in-flight marker
                if (fetchingRef.current === currentMasjidId) fetchingRef.current = null;
            }
        };
        fetchMasjid();
    }, [currentMasjidId]);

    // Filter out unwanted fields
    const excludedFields = ['password', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'id', 'committeeImage', 'committeeImages'];

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
        <main className="min-h-screen bg-base-100 p-4 sm:p-6">
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

                {/* Event image + header always visible; details can be toggled to save space when many images are shown */}
                {!loading && masjid && (
                    <>
                        {/* Event Image Section - Carousel (supports single or multiple images) */}
                        {((masjid.committeeImages && masjid.committeeImages.length) || masjid.committeeImage) && (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/30">
                                {/* Header Banner */}
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white font-bold text-xl">Event Announcement</h3>
                                            <p className="text-emerald-100 text-sm">From Raahe Hidayat Team</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Carousel Body */}
                                <div className="bg-gradient-to-b from-slate-900 to-slate-800 p-6 flex items-center justify-center relative">
                                    <div className="max-w-md w-full">
                                        {/* derive images array */}
                                        {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                                        {(() => {
                                            const imgs = Array.isArray(masjid.committeeImages)
                                                ? masjid.committeeImages.filter(Boolean).slice().reverse()
                                                : masjid.committeeImage
                                                    ? [masjid.committeeImage]
                                                    : [];
                                            return (
                                                <Carousel images={imgs} />
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Header Card (summary) */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 shadow-lg mt-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 break-words">
                                        {masjid.masjidName || masjid.name || "—"}
                                    </h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-emerald-50 text-sm break-all">Masjid ID: {currentMasjidId}</p>
                                        <button
                                            onClick={handleCopyMasjidId}
                                            className="p-1.5 hover:bg-white/20 rounded-lg transition-all shrink-0"
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
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowDetails((s) => !s)}
                                        className="px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm hover:bg-white/20"
                                    >
                                        {showDetails ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Details Card */}
                        {showDetails && (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700/50 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField("Masjid Name", masjid.masjidName || masjid.name)}
                                    {renderField("Mobile Numbers", masjid.mobileNumbers || masjid.mobile || masjid.phone || masjid.contactNumber)}
                                    {renderField("Address", masjid.fullAddress || masjid.address)}
                                    {renderField("City", masjid.city)}
                                    {renderField("Mutwalli Name", masjid.mutwalliName)}
                                    {renderField("Committee Members", masjid.committeeMembers)}
                                    {renderField("Imam Name", masjid.imaamName)}

                                    {/* Show any remaining fields that aren't in excluded list */}
                                    {Object.keys(masjid).filter(k =>
                                        !excludedFields.includes(k) &&
                                        !['masjidName', 'name', 'mobileNumbers', 'mobile', 'phone', 'contactNumber',
                                            'fullAddress', 'address', 'city', 'mutwalliName', 'committeeMembers',
                                            'imaamName', 'masjidId', 'committeeImage'].includes(k) &&
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
                        )}
                    </>
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
