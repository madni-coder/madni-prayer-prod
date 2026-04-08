"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Colour map for dynamic vote buttons ─────────────────────────────────────
const BTN_COLOR_MAP = {
    green:  "border-2 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/20 data-[active=true]:bg-emerald-500 data-[active=true]:border-emerald-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-emerald-500/30",
    red:    "border-2 border-red-500/60 text-red-400 hover:bg-red-500/20 data-[active=true]:bg-red-500 data-[active=true]:border-red-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-red-500/30",
    blue:   "border-2 border-blue-500/60 text-blue-400 hover:bg-blue-500/20 data-[active=true]:bg-blue-500 data-[active=true]:border-blue-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-blue-500/30",
    orange: "border-2 border-orange-500/60 text-orange-400 hover:bg-orange-500/20 data-[active=true]:bg-orange-500 data-[active=true]:border-orange-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-orange-500/30",
    purple: "border-2 border-purple-500/60 text-purple-400 hover:bg-purple-500/20 data-[active=true]:bg-purple-500 data-[active=true]:border-purple-500 data-[active=true]:text-white data-[active=true]:shadow-lg data-[active=true]:shadow-purple-500/30",
};

const btnClass = (color, active) => {
    const base = "flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 scale-100 active:scale-[0.97]";
    const colorCls = BTN_COLOR_MAP[color] || BTN_COLOR_MAP.green;
    // apply active state manually since data attributes don't work without JS magic in Tailwind
    if (active) {
        const activeCls = {
            green:  "bg-emerald-500 border-2 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.03]",
            red:    "bg-red-500 border-2 border-red-500 text-white shadow-lg shadow-red-500/30 scale-[1.03]",
            blue:   "bg-blue-500 border-2 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.03]",
            orange: "bg-orange-500 border-2 border-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.03]",
            purple: "bg-purple-500 border-2 border-purple-500 text-white shadow-lg shadow-purple-500/30 scale-[1.03]",
        };
        return `${base} ${activeCls[color] || activeCls.green}`;
    }
    const inactiveCls = {
        green:  "bg-transparent border-2 border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-500/10",
        red:    "bg-transparent border-2 border-red-500/50 text-red-400 hover:border-red-400 hover:bg-red-500/10",
        blue:   "bg-transparent border-2 border-blue-500/50 text-blue-400 hover:border-blue-400 hover:bg-blue-500/10",
        orange: "bg-transparent border-2 border-orange-500/50 text-orange-400 hover:border-orange-400 hover:bg-orange-500/10",
        purple: "bg-transparent border-2 border-purple-500/50 text-purple-400 hover:border-purple-400 hover:bg-purple-500/10",
    };
    return `${base} ${inactiveCls[color] || inactiveCls.green}`;
};

// ─── Image Carousel ───────────────────────────────────────────────────────────
function ImageCarousel({ images = [] }) {
    const valid = images.filter(Boolean);
    const [idx, setIdx] = useState(0);

    useEffect(() => { setIdx(0); }, [valid.length]);
    if (!valid.length) return null;

    const prev = () => setIdx((i) => (i - 1 + valid.length) % valid.length);
    const next = () => setIdx((i) => (i + 1) % valid.length);

    return (
        <div className="relative w-full" style={{ maxWidth: '420px', aspectRatio: '9/16' }}>
            <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={valid[idx]}
                    alt={`Event image ${idx + 1}`}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    className="w-full h-full object-cover"
                />
                {valid.length > 1 && (
                    <>
                        <button onClick={prev} aria-label="Previous"
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 backdrop-blur-sm transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button onClick={next} aria-label="Next"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-10 backdrop-blur-sm transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                            {idx + 1} / {valid.length}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 z-10 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-2 rounded-full">
                            {valid.map((_, i) => (
                                <button key={i} onClick={() => setIdx(i)} aria-label={`Image ${i + 1}`}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-emerald-400 w-6' : 'bg-white/50 w-1.5'}`} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Single Event Card ────────────────────────────────────────────────────────
const MAX_COMMENT = 500;

function EventCard({ event }) {
    const [vote, setVote] = useState(null);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const buttons = Array.isArray(event.buttons) ? event.buttons : [];
    const imageUrls = Array.isArray(event.image_urls) ? event.image_urls : [];
    const pdfAttachments = Array.isArray(event.pdf_attachments) ? event.pdf_attachments : [];

    // Read masjid identity from localStorage (set during committee login)
    const masjidLoginId = typeof window !== "undefined"
        ? localStorage.getItem("masjidCommittee_masjidId") || localStorage.getItem("masjidLoginId")
        : null;
    const masjidName = typeof window !== "undefined"
        ? localStorage.getItem("masjidCommittee_masjidName") || localStorage.getItem("masjidName") || ""
        : "";

    const handleSubmit = async () => {
        if (!vote) return;
        if (!masjidLoginId) {
            setSubmitError("Masjid ID not found. Please log in again.");
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        try {
            const res = await fetch('/api/committee-event-responses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    masjidLoginId: Number(masjidLoginId),
                    masjidName,
                    vote,
                    comment,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to submit');
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err.message || 'Something went wrong. Try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[420px] flex flex-col items-center gap-0">
            {/* Images */}
            {imageUrls.length > 0 && <ImageCarousel images={imageUrls} />}

            {/* Proposal Card */}
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 mt-4">

                {/* Card Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex items-center gap-3 border-b border-slate-600/40">
                    <div className="bg-emerald-500/20 rounded-full p-2 shrink-0">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white font-bold text-base leading-tight truncate">{event.title}</h2>
                        <p className="text-slate-400 text-xs">Review and share your feedback</p>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-slate-800/60 backdrop-blur-sm px-5 py-4">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>

                {/* PDF Attachments */}
                {pdfAttachments.length > 0 && (
                    <div className="bg-slate-800/40 px-5 py-3 border-t border-slate-700/30 space-y-2">
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Attachments</p>
                        {pdfAttachments.map((pdf, i) => (
                            <a key={i} href={pdf.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2 hover:bg-red-900/50 transition-colors">
                                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-xs text-red-300 truncate">{pdf.name}</span>
                            </a>
                        ))}
                    </div>
                )}

                {/* Vote Buttons */}
                {buttons.length > 0 && (
                    !submitted ? (
                        <div className="bg-slate-800/80 px-5 py-4 flex gap-3 border-t border-slate-700/30">
                            {buttons.map((btn, i) => (
                                <button
                                    key={i}
                                    onClick={() => setVote(btn.label)}
                                    className={btnClass(btn.color, vote === btn.label)}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-5 py-4 flex items-center gap-3 bg-emerald-900/30 border-t border-slate-700/30">
                            <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm font-semibold text-emerald-300">
                                You voted &ldquo;{vote}&rdquo;. Thank you for your feedback!
                            </p>
                        </div>
                    )
                )}

                {/* Divider */}
                <div className="h-px bg-slate-700/50 mx-5" />

                {/* Comment Section */}
                <div className="bg-slate-800/60 px-5 py-4">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Your Comment
                    </label>
                    <textarea
                        rows={5}
                        placeholder="Share your thoughts… (max 500 characters)"
                        value={comment}
                        onChange={(e) => e.target.value.length <= MAX_COMMENT && setComment(e.target.value)}
                        disabled={submitted}
                        className="w-full bg-slate-700/60 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-end mt-1">
                        <span className={`text-xs ${comment.length >= MAX_COMMENT ? 'text-red-400' : 'text-slate-500'}`}>
                            {comment.length} / {MAX_COMMENT}
                        </span>
                    </div>
                </div>

                {/* Submit */}
                {!submitted && (
                    <div className="bg-slate-800/80 px-5 pb-5">
                        <button
                            onClick={handleSubmit}
                            disabled={!vote || submitting}
                            className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting…</>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Submit Comment
                                </>
                            )}
                        </button>
                        {!vote && buttons.length > 0 && (
                            <p className="text-center text-slate-500 text-xs mt-2">Please select an option to submit</p>
                        )}
                        {submitError && (
                            <p className="text-center text-red-400 text-xs mt-2">{submitError}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RhPrograms() {
    const router = useRouter();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/committee-events');
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Failed to load events');
                if (mounted) setEvents(json.events || []);
            } catch (err) {
                console.error('Failed to load committee events', err);
                if (mounted) setError('Failed to load announcements. Please try again.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchEvents();
        return () => { mounted = false; };
    }, []);

    return (
        <main className="min-h-screen bg-base-100 flex flex-col">
            {/* ── Header Banner ── */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-lg">
                <button
                    onClick={() => router.back()}
                    aria-label="Go back"
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors shrink-0"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="bg-white/20 rounded-full p-2.5 shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-white font-bold text-lg leading-tight">Event Announcement</h1>
                    <p className="text-white/90 text-sm">From Raahe Hidayat Team</p>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 flex flex-col items-center justify-start py-6 px-4 gap-8">

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center mt-20 gap-4">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-400 text-sm">Loading announcements…</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3 w-full max-w-md mt-8">
                        <svg className="h-6 w-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-200 text-sm">{error}</span>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && events.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-20 gap-4 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm">No announcements available yet.</p>
                    </div>
                )}

                {/* Events List */}
                {!loading && !error && events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </main>
    );
}
