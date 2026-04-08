"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, CheckCircle2, XCircle, MessageSquare,
    RefreshCw, FileText, Users, CalendarCheck2
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function VoteBadge({ vote }) {
    if (!vote)
        return (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">
                No Vote
            </span>
        );

    const lower = vote.toLowerCase();
    const isAgree    = lower.startsWith("agree") || lower === "yes" || lower === "raazi hoon" || lower === "approve";
    const isDisagree = lower.startsWith("disagree") || lower === "no" || lower === "reject";

    if (isAgree)
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold whitespace-nowrap">
                <CheckCircle2 size={12} /> {vote}
            </span>
        );
    if (isDisagree)
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold whitespace-nowrap">
                <XCircle size={12} /> {vote}
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
            {vote}
        </span>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ViewResponsePage() {
    const router = useRouter();
    const [eventId, setEventId]       = useState(null);
    const [event, setEvent]           = useState(null);   // event details
    const [responses, setResponses]   = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);

    // Read eventId from URL
    useEffect(() => {
        if (typeof window === "undefined") return;
        const id = new URLSearchParams(window.location.search).get("eventId");
        if (id) setEventId(id);
        else    setError("No event ID provided.");
    }, []);

    const fetchData = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch event details
            const evRes  = await fetch(`/api/committee-events`);
            const evJson = await evRes.json();
            if (!evRes.ok) throw new Error(evJson.error || "Failed to load events");
            const found = (evJson.events || []).find((e) => e.id === id);
            if (found) setEvent(found);

            // 2. Fetch all responses for this event
            const rRes  = await fetch(`/api/committee-event-responses?eventId=${id}`);
            const rJson = await rRes.json();
            if (!rRes.ok) throw new Error(rJson.error || "Failed to load responses");
            setResponses(rJson.responses || []);
        } catch (err) {
            setError(err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (eventId) fetchData(eventId);
    }, [eventId, fetchData]);

    // Vote summary
    const agreed    = responses.filter((r) => r.vote?.toLowerCase().startsWith("agree") || r.vote?.toLowerCase() === "yes").length;
    const disagreed = responses.filter((r) => r.vote?.toLowerCase().startsWith("disagree") || r.vote?.toLowerCase() === "no").length;
    const other     = responses.length - agreed - disagreed;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 truncate">
                        {event?.title || "Event Responses"}
                    </h1>
                    <p className="text-sm text-gray-500">All masjid votes &amp; comments for this event</p>
                </div>
                {eventId && (
                    <button
                        onClick={() => fetchData(eventId)}
                        disabled={loading}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                )}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading responses…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-5">

                    {/* ── Event Info Banner ── */}
                    {event && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 flex items-center gap-3">
                                <div className="bg-white/20 rounded-full p-2 shrink-0">
                                    <CalendarCheck2 size={18} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-white font-bold text-base truncate">{event.title}</h2>
                                    <p className="text-emerald-100 text-xs mt-0.5">
                                        Created {new Date(event.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                    </p>
                                </div>
                            </div>
                            <div className="px-5 py-3 flex flex-wrap gap-2 items-center border-b border-gray-100">
                                <p className="text-gray-600 text-sm flex-1 min-w-0 line-clamp-2">{event.description}</p>
                                {/* Vote button chips */}
                                <div className="flex gap-1.5 flex-wrap shrink-0">
                                    {(Array.isArray(event.buttons) ? event.buttons : []).map((btn, i) => (
                                        <span key={i} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                            btn.color === "red"    ? "bg-red-100 text-red-600"     :
                                            btn.color === "blue"   ? "bg-blue-100 text-blue-600"   :
                                            btn.color === "orange" ? "bg-orange-100 text-orange-600":
                                            btn.color === "purple" ? "bg-purple-100 text-purple-600":
                                            "bg-emerald-100 text-emerald-700"
                                        }`}>{btn.label}</span>
                                    ))}
                                    {Array.isArray(event.pdf_attachments) && event.pdf_attachments.length > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <FileText size={11} /> {event.pdf_attachments.length} PDF
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Summary Stats ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Total Responses", value: responses.length,  color: "bg-gray-50 text-gray-700 border-gray-200" },
                            { label: "Agreed",          value: agreed,             color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                            { label: "Disagreed",       value: disagreed,          color: "bg-red-50 text-red-600 border-red-200" },
                            { label: "Other / Custom",  value: other,              color: "bg-blue-50 text-blue-600 border-blue-200" },
                        ].map((s) => (
                            <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
                                <div className="text-2xl font-bold">{s.value}</div>
                                <div className="text-xs font-medium opacity-80 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Progress bar */}
                    {responses.length > 0 && (
                        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden flex shadow-inner">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(agreed / responses.length) * 100}%` }} />
                            <div className="bg-red-400 h-full transition-all"    style={{ width: `${(disagreed / responses.length) * 100}%` }} />
                            <div className="bg-blue-400 h-full transition-all"   style={{ width: `${(other / responses.length) * 100}%` }} />
                        </div>
                    )}

                    {/* ── Responses Table ── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <h3 className="font-bold text-gray-800 text-base">Masjid Responses</h3>
                            <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                                {responses.length} responded
                            </span>
                        </div>

                        {responses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <MessageSquare size={40} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium text-sm">No responses yet</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Masjid responses will appear here once committee members vote on this event.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table Header */}
                                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-3">Masjid</div>
                                    <div className="col-span-2">Vote</div>
                                    <div className="col-span-5">Comment</div>
                                    <div className="col-span-1">Time</div>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {responses.map((resp, i) => (
                                        <div key={resp.id || i} className="px-4 md:px-6 py-4">
                                            {/* Mobile layout */}
                                            <div className="md:hidden space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">🕌</div>
                                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                                            {resp.masjidName || `Masjid #${resp.masjidLoginId}`}
                                                        </p>
                                                    </div>
                                                    <VoteBadge vote={resp.vote} />
                                                </div>
                                                {resp.comment && (
                                                    <div className="ml-10 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                                        <p className="text-xs text-gray-400 mb-1 font-medium flex items-center gap-1">
                                                            <MessageSquare size={10} /> Comment
                                                        </p>
                                                        <p className="text-sm text-gray-700 leading-relaxed">{resp.comment}</p>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-300 ml-10">
                                                    {new Date(resp.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                                </p>
                                            </div>

                                            {/* Desktop layout */}
                                            <div className="hidden md:grid grid-cols-12 gap-4 items-start">
                                                <div className="col-span-1 text-sm text-gray-400 font-medium pt-0.5">{i + 1}</div>
                                                <div className="col-span-3 flex items-center gap-2 min-w-0">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">🕌</div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">
                                                            {resp.masjidName || `Masjid #${resp.masjidLoginId}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">ID: {resp.masjidLoginId}</p>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 flex items-center">
                                                    <VoteBadge vote={resp.vote} />
                                                </div>
                                                <div className="col-span-5">
                                                    {resp.comment ? (
                                                        <p className="text-sm text-gray-600 leading-relaxed">{resp.comment}</p>
                                                    ) : (
                                                        <p className="text-xs text-gray-300 italic">No comment</p>
                                                    )}
                                                </div>
                                                <div className="col-span-1 text-xs text-gray-400">
                                                    {new Date(resp.submittedAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
