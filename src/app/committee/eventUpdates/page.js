"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";
import ErrorPopup from "../../../components/ErrorPopup";
import { FaCheckCircle } from "react-icons/fa";
import { Pencil, X } from "lucide-react";

const prayers = [
    { name: "Fajr", defaultTime: "5:00" },
    { name: "Zuhar", defaultTime: "6:10" },
    { name: "Asr", defaultTime: "4:30" },
    { name: "Maghrib", defaultTime: "7:15" },
    { name: "Isha", defaultTime: "8:45" },
    { name: "Juma", defaultTime: "1:30" },
];

// Removed unused conversion functions

// Simple carousel for event images (no external deps)
function Carousel({ images = [] }) {
    const validImages = images.filter((img) => img && typeof img === 'string' && img.length > 5);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        setIndex(0);
    }, [validImages.length]);

    if (!validImages || validImages.length === 0) return null;

    const prev = () => setIndex((i) => (i - 1 + validImages.length) % validImages.length);
    const next = () => setIndex((i) => (i + 1) % validImages.length);

    return (
        <div className="relative mx-auto" style={{ maxWidth: '400px', aspectRatio: '9/16' }}>
            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden shadow-2xl group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={validImages[index]}
                    alt={`Raahe Hidayat Event ${index + 1}`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover"
                />

                {validImages.length > 1 && (
                    <>
                        {/* Previous Button */}
                        <button
                            onClick={prev}
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 backdrop-blur-sm transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={next}
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 backdrop-blur-sm transition-all"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            {index + 1} / {validImages.length}
                        </div>

                        {/* Dots Indicator */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 z-10 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-2 rounded-full">
                            {validImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setIndex(idx)}
                                    aria-label={`Go to image ${idx + 1}`}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === index
                                        ? 'bg-emerald-400 w-6'
                                        : 'bg-white/50 hover:bg-white/70 w-1.5'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function EventUpdates() {
    const router = useRouter();
    const [apiErrorPopup, setApiErrorPopup] = useState(null);
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

    const [committeeImages, setCommitteeImages] = useState([]);
    const [loadingCommitteeImages, setLoadingCommitteeImages] = useState(false);

    const [times, setTimes] = useState(prayers.map((p) => p.defaultTime));
    const [editIdx, setEditIdx] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [updatingTimes, setUpdatingTimes] = useState(false);
    const [timeUpdateMsg, setTimeUpdateMsg] = useState(null);

    const handleEdit = (idx) => {
        setEditIdx(idx);
        // Ensure colon is present when editing starts
        const currentTime = times[idx];
        if (!currentTime.includes(':')) {
            // If somehow there's no colon, add it
            setEditValue(currentTime.length > 0 ? currentTime + ':' : '0:00');
        } else {
            setEditValue(currentTime);
        }
    };

    const handleCancelEdit = () => {
        setEditIdx(null);
        setEditValue("");
    };

    const handleSaveTime = (idx) => {
        // Split and validate
        const parts = editValue.split(':');
        if (parts.length !== 2) {
            alert('Invalid time format. Please use format HH:MM (e.g., 6:10)');
            return;
        }

        const hourStr = parts[0];
        const minuteStr = parts[1];

        // Check if parts are empty or have non-digits
        if (!hourStr || !minuteStr) {
            alert('Invalid time format. Please enter both hour and minutes (e.g., 6:10)');
            return;
        }

        // Validate hour and minute values
        const hour = parseInt(hourStr, 10);
        const minute = parseInt(minuteStr, 10);

        if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            alert('Invalid time. Hour must be 0-23 and minutes must be 0-59');
            return;
        }

        // Pad minutes with leading zero if needed
        const formattedTime = `${hourStr}:${minuteStr.padStart(2, '0')}`;

        setTimes((times) =>
            times.map((t, i) => (i === idx ? formattedTime : t))
        );
        setEditIdx(null);
    };

    const handleTimeInputChange = (e) => {
        let input = e.target.value;

        // Remove all non-digit and non-colon characters
        input = input.replace(/[^0-9:]/g, '');

        // If user tries to remove colon, add it back
        if (!input.includes(':')) {
            // If there are digits, try to maintain colon position
            if (input.length > 0) {
                // Add colon after first 1 or 2 digits
                if (input.length === 1) {
                    input = input + ':';
                } else if (input.length === 2) {
                    input = input + ':';
                } else if (input.length > 2) {
                    // Insert colon before last 2 digits (minutes)
                    const mins = input.slice(-2);
                    const hrs = input.slice(0, -2);
                    input = hrs + ':' + mins;
                }
            } else {
                // Empty input, just set to colon
                input = ':';
            }
        }

        // Ensure only one colon
        const colonIndex = input.indexOf(':');
        if (colonIndex !== input.lastIndexOf(':')) {
            // Multiple colons, keep only the first
            input = input.slice(0, colonIndex + 1) + input.slice(colonIndex + 1).replace(/:/g, '');
        }

        // Split by colon and validate
        const parts = input.split(':');
        if (parts.length === 2) {
            // Limit hour to 2 digits, minutes to 2 digits
            let hour = parts[0].slice(0, 2);
            let minute = parts[1].slice(0, 2);

            // Don't allow empty hour part
            if (hour.length === 0) {
                hour = '0';
            }

            input = hour + ':' + minute;
        }

        setEditValue(input);
    };

    const updateJamatTimes = async () => {
        if (!masjid || !masjid.id) {
            setTimeUpdateMsg({ type: "error", text: "Missing internal masjid id" });
            return;
        }
        setUpdatingTimes(true);
        setTimeUpdateMsg(null);
        try {
            const payload = {
                id: masjid.id,
                fazar: times[0],
                zuhar: times[1],
                asar: times[2],
                maghrib: times[3],
                isha: times[4],
                juma: times[5],
            };
            await apiClient.patch("/api/all-masjids", payload);
            setTimeUpdateMsg({ type: "success", text: "Jamat times updated successfully!" });
            setTimeout(() => setTimeUpdateMsg(null), 3000);
        } catch (err) {
            setTimeUpdateMsg({ type: "error", text: err?.response?.data?.error || err.message || "Failed to update times" });
            const errDetails = err.response?.data ? JSON.stringify(err.response.data, null, 2) : (err.message + (err.config ? `\\nTarget: ${err.config.baseURL || ''}${err.config.url}\\nMethod: ${err.config.method}` : ''));
            setApiErrorPopup(errDetails);
        } finally {
            setUpdatingTimes(false);
        }
    };

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
                setTimes([
                    (copy.fazar || prayers[0].defaultTime).replace(/ am| pm/gi, ""),
                    (copy.zuhar || prayers[1].defaultTime).replace(/ am| pm/gi, ""),
                    (copy.asar || prayers[2].defaultTime).replace(/ am| pm/gi, ""),
                    (copy.maghrib || prayers[3].defaultTime).replace(/ am| pm/gi, ""),
                    (copy.isha || prayers[4].defaultTime).replace(/ am| pm/gi, ""),
                    (copy.juma || prayers[5].defaultTime).replace(/ am| pm/gi, ""),
                ]);
            } catch (err) {
                setError(err?.response?.data?.error || err.message || "Failed to load masjid details");
                const errDetails = err.response?.data ? JSON.stringify(err.response.data, null, 2) : (err.message + (err.config ? `\\nTarget: ${err.config.baseURL || ''}${err.config.url}\\nMethod: ${err.config.method}` : ''));
                setApiErrorPopup(errDetails);
            } finally {
                setLoading(false);
                // clear in-flight marker
                if (fetchingRef.current === currentMasjidId) fetchingRef.current = null;
            }
        };
        fetchMasjid();
    }, [currentMasjidId]);

    // Fetch images from committee bucket (GET /api/masjid-committee-event)
    useEffect(() => {
        if (!currentMasjidId) return;
        let mounted = true;
        const fetchImages = async () => {
            setLoadingCommitteeImages(true);
            try {
                const res = await apiClient.get('/api/masjid-committee-event');
                const imgs = res?.data?.images || [];
                const urls = imgs.map((f) => f.imageSrc).filter(Boolean).reverse();
                if (mounted) setCommitteeImages(urls);
            } catch (err) {
                console.error('Failed to load committee images', err);
                const errDetails = err.response?.data ? JSON.stringify(err.response.data, null, 2) : (err.message + (err.config ? `\\nTarget: ${err.config.baseURL || ''}${err.config.url}\\nMethod: ${err.config.method}` : ''));
                setApiErrorPopup(errDetails);
            } finally {
                if (mounted) setLoadingCommitteeImages(false);
            }
        };
        fetchImages();
        return () => { mounted = false; };
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
                            onClick={() => router.push('/')}
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
                        {/* Committee Announcements Card — premium design */}
                        <button
                            onClick={() => router.push('/committee/rhPrograms')}
                            className="w-full text-left group focus:outline-none mb-4"
                            aria-label="Open Committee Announcements"
                        >
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]"
                                style={{
                                    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0d9488 100%)",
                                }}
                            >
                                {/* Animated shimmer overlay */}
                                <div className="absolute inset-0 opacity-30"
                                    style={{
                                        background: "radial-gradient(ellipse at 20% 50%, rgba(52,211,153,0.4) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.3) 0%, transparent 50%)",
                                    }}
                                />

                                {/* Decorative floating dots */}
                                <div className="absolute top-4 right-6 w-2 h-2 rounded-full bg-emerald-400/40 animate-pulse" />
                                <div className="absolute top-8 right-12 w-1.5 h-1.5 rounded-full bg-blue-400/30 animate-pulse" style={{ animationDelay: "0.3s" }} />
                                <div className="absolute bottom-6 right-8 w-1 h-1 rounded-full bg-teal-300/50 animate-pulse" style={{ animationDelay: "0.6s" }} />

                                {/* Main content */}
                                <div className="relative z-10 px-5 py-5">
                                    {/* Top row: icon + title + arrow */}
                                    <div className="flex items-center gap-3.5 mb-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                            </div>
                                            {/* Notification dot */}
                                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-lg leading-tight">Announcements For Committee</h3>
                                            <p className="text-emerald font-bold text-xs mt-0.5">From Raahe Hidayat Team</p>
                                        </div>
                                        {/* Arrow with glow */}
                                        <div className="shrink-0 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/20 group-hover:border-white/30 transition-all duration-300">
                                            <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Bottom row: info chips */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10">
                                            <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-white/90 text-xs font-medium">View Programs</span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10">
                                            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <span className="text-white/90 text-xs font-medium">Vote &amp; Comment</span>
                                        </div>
                                        {loadingCommitteeImages && (
                                            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0 ml-auto" />
                                        )}
                                    </div>
                                </div>

                                {/* Bottom border glow line */}
                                <div className="h-[2px]" style={{ background: "linear-gradient(to right, transparent, #34d399, #3b82f6, transparent)" }} />
                            </div>
                        </button>

                        {/* Header Card (summary) */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-4 sm:p-5 shadow-lg mt-4 border border-emerald-500/30 relative overflow-hidden">
                            {/* Subtle decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                            
                            <div className="relative flex items-center justify-between gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2 leading-tight">
                                        {masjid.masjidName || masjid.name || "—"}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/20 border border-white/5 w-fit shadow-inner">
                                            <span className="text-emerald-100/90 text-xs font-medium tracking-wide">ID: {currentMasjidId}</span>
                                            <button
                                                onClick={handleCopyMasjidId}
                                                className="p-0.5 hover:bg-white/20 rounded transition-colors"
                                                title="Copy Login ID"
                                            >
                                                {copied ? (
                                                    <svg className="w-3.5 h-3.5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5 text-emerald-100/70 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                                    <button
                                        onClick={() => setShowDetails((s) => !s)}
                                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                                    >
                                        <span>{showDetails ? 'Hide' : 'Details'}</span>
                                        <svg 
                                            className={`w-3.5 h-3.5 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Details Card */}
                        {showDetails && (
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700/50 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField("Colony", masjid.colony)}
                                    {renderField("City", masjid.city)}
                                    {renderField("Imam Name", masjid.imaamName)}
                                    {renderField("Moizzan Name", masjid.moizzanName)}
                                    {renderField("Mutawalli Name", masjid.mutwalliName || masjid.name || (masjid.memberNames && masjid.memberNames.length > 0 ? masjid.memberNames[0] : null))}
                                    {renderField("Mobile Number", masjid.mobile || "—")}
                                    {renderField("Committee Members", masjid.memberNames && Array.isArray(masjid.memberNames) && masjid.memberNames.length > 0 ? masjid.memberNames.join(', ') : masjid.committeeMembers)}
                                    {renderField("Committee Mobile Numbers", masjid.mobileNumbers && Array.isArray(masjid.mobileNumbers) && masjid.mobileNumbers.length > 0 ? masjid.mobileNumbers.join(', ') : (masjid.phone || masjid.contactNumber))}

                                    {/* Show any remaining fields that aren't in excluded list */}
                                    {Object.keys(masjid).filter(k =>
                                        !excludedFields.includes(k) &&
                                        !['masjidName', 'name', 'mobileNumbers', 'mobile', 'phone', 'contactNumber',
                                            'fullAddress', 'address', 'city', 'colony', 'locality', 'mutwalliName', 'committeeMembers', 'memberNames',
                                            'imaamName', 'moizzanName', 'masjidId', 'loginId', 'committeeImage',
                                            'fazar', 'zuhar', 'asar', 'maghrib', 'isha', 'juma',
                                            'role', 'pasteMapUrl'].includes(k) &&
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

                        {/* Jamat Time Section */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-slate-700/50 mt-4 overflow-hidden">
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-white">
                                Jamat Time Table
                            </h2>
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full text-sm sm:text-base text-gray-200">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="text-gray-300 font-semibold px-2 sm:px-4 py-3 text-left w-[25%] sm:w-1/3">Prayer</th>
                                            <th className="text-gray-300 font-semibold px-2 sm:px-4 py- text-center w-[50%] sm:w-1/3">Time</th>
                                            <th className="text-gray-300 font-semibold px-2 sm:px-4 py-3 text-right w-[25%] sm:w-1/3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prayers.map((prayer, idx) => (
                                            <tr
                                                key={prayer.name}
                                                className="border-b border-slate-700/50"
                                            >
                                                <td
                                                    className={[
                                                        "font-semibold border-b-2 px-2 sm:px-4 py-3 align-middle text-sm sm:text-base break-words",
                                                        idx === 0
                                                            ? "text-primary border-primary/50"
                                                            : idx === 1
                                                                ? "text-pink-400 border-pink-500/50"
                                                                : idx === 2
                                                                    ? "text-warning border-warning/50"
                                                                    : idx === 3
                                                                        ? "text-error border-error/50"
                                                                        : idx === 4
                                                                            ? "text-info border-info/50"
                                                                            : idx === 5
                                                                                ? "text-purple-400 font-bold border-purple-400/50"
                                                                                : idx === 6
                                                                                    ? "text-amber-600 border-amber-600/50"
                                                                                    : "",
                                                    ].join(" ")}
                                                >
                                                    {prayer.name}
                                                </td>
                                                <td className="text-emerald-400 font-semibold px-2 sm:px-4 py-3 align-center text-center text-xl sm:text-base">
                                                    {editIdx === idx ? (
                                                        <div className="flex flex-row items-center gap-2 sm:gap-3">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                pattern="[0-9:]*"
                                                                placeholder="H:MM"
                                                                className="input input-bordered input-xl bg-slate-700 text-white border-slate-600 w-16 sm:w-20 text-center px-1 h-8 sm:h-9"
                                                                value={editValue}
                                                                onChange={handleTimeInputChange}
                                                                autoFocus
                                                            />
                                                            <button
                                                                type="button"
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 sm:p-2 rounded-lg shadow-lg flex-shrink-0"
                                                                onClick={() => handleSaveTime(idx)}
                                                            >
                                                                <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="bg-red-600 hover:bg-red-700 text-white p-2.5 sm:p-2 rounded-lg shadow-lg flex-shrink-0"
                                                                onClick={handleCancelEdit}
                                                            >
                                                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        times[idx]
                                                    )}
                                                </td>
                                                <td className="px-2 sm:px-4 py-3 text-right align-middle">
                                                    <button
                                                        type="button"
                                                        className="bg-teal-600 hover:bg-teal-700 text-white p-1.5 sm:p-2 rounded-lg shadow-lg inline-flex items-center justify-center"
                                                        onClick={() => handleEdit(idx)}
                                                    >
                                                        <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                                {timeUpdateMsg && (
                                    <div className={`text-sm flex-1 ${timeUpdateMsg.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {timeUpdateMsg.text}
                                    </div>
                                )}
                                <button
                                    onClick={updateJamatTimes}
                                    disabled={updatingTimes}
                                    className="btn w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 px-6 disabled:opacity-60 border-none"
                                >
                                    {updatingTimes ? "Updating..." : "Update Jamat Times"}
                                </button>
                            </div>
                        </div>
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

            <ErrorPopup error={apiErrorPopup} onClose={() => setApiErrorPopup(null)} />
        </main>
    );
}
