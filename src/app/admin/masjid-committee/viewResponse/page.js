"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, MessageSquare, User, RefreshCw } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
function VoteBadge({ vote }) {
    if (!vote) return <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">No Vote</span>;
    const agreed = vote.toLowerCase() === "agree" || vote.toLowerCase() === "agreed";
    const disagreed = vote.toLowerCase() === "disagree" || vote.toLowerCase() === "disagreed";
    if (agreed)
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold"><CheckCircle2 size={12} /> {vote}</span>;
    if (disagreed)
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold"><XCircle size={12} /> {vote}</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{vote}</span>;
}

function InfoRow({ label, value }) {
    if (!value) return null;
    return (
        <div className="flex gap-2 py-2 border-b border-gray-100 last:border-0">
            <span className="text-xs text-gray-400 font-medium w-28 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-gray-800 font-medium break-words">{value}</span>
        </div>
    );
}

export default function ViewResponsePage() {
    const router = useRouter();
    const [masjidId, setMasjidId] = useState(null); // loginId
    const [masjid, setMasjid] = useState(null);
    const [responses, setResponses] = useState([]); // CommitteeEventResponse[]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Parse masjidId from URL
    useEffect(() => {
        if (typeof window === "undefined") return;
        const id = new URLSearchParams(window.location.search).get("masjidId");
        if (id) setMasjidId(id);
        else setError("No masjid ID provided.");
    }, []);

    const fetchData = async (id) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Fetch masjid details (API expects loginId)
            const mRes = await fetch(`/api/masjid-committee?masjidId=${id}`);
            const mJson = await mRes.json();
            if (!mRes.ok) throw new Error(mJson.error || "Masjid not found");
            setMasjid(mJson.data);

            // 2. Fetch all responses for this masjid
            const rRes = await fetch(`/api/committee-event-responses?masjidLoginId=${id}`);
            const rJson = await rRes.json();
            setResponses(rJson.responses || []);
        } catch (err) {
            setError(err.message || "Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (masjidId) fetchData(masjidId);
    }, [masjidId]);

    // Compute vote summary across all events
    const agreed    = responses.filter((r) => r.vote?.toLowerCase().startsWith("agree")).length;
    const disagreed = responses.filter((r) => r.vote?.toLowerCase().startsWith("disagree")).length;
    const other     = responses.length - agreed - disagreed;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ── Header ── */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">Committee Response</h1>
                    <p className="text-sm text-gray-500">Masjid votes & comments per event</p>
                </div>
                {masjidId && (
                    <button
                        onClick={() => fetchData(masjidId)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={16} />
                    </button>
                )}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading…</p>
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
            )}

            {/* ── Main Content ── */}
            {!loading && !error && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* ── LEFT: Masjid Details + Summary ── */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* Masjid Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🕌</div>
                                <div className="min-w-0">
                                    <h2 className="text-white font-bold text-base leading-tight truncate">{masjid?.masjidName || "—"}</h2>
                                    <p className="text-emerald-100 text-xs mt-0.5">{masjid?.city || ""}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <InfoRow label="Masjid Name" value={masjid?.masjidName} />
                                <InfoRow label="Colony / Area" value={masjid?.colony || masjid?.locality} />
                                <InfoRow label="City" value={masjid?.city} />
                                <InfoRow label="Mutwalli" value={masjid?.name} />
                                <InfoRow label="Mobile" value={
                                    Array.isArray(masjid?.mobileNumbers)
                                        ? masjid.mobileNumbers.join(", ")
                                        : masjid?.mobile
                                } />
                                <InfoRow label="Login ID" value={String(masjidId)} />
                            </div>
                        </div>

                        {/* Vote Summary */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Overall Vote Summary</h3>
                            <div className="space-y-2">
                                {[
                                    { label: "Agreed", count: agreed, color: "text-emerald-600", icon: <CheckCircle2 size={15} /> },
                                    { label: "Disagreed", count: disagreed, color: "text-red-500", icon: <XCircle size={15} /> },
                                    { label: "Other / Custom", count: other, color: "text-blue-500", icon: <MessageSquare size={15} /> },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <span className={`flex items-center gap-1.5 text-sm font-medium ${s.color}`}>
                                            {s.icon} {s.label}
                                        </span>
                                        <span className={`font-bold ${s.color}`}>{s.count}</span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
                                    <span>Total Events Responded</span>
                                    <span className="font-bold text-gray-800">{responses.length}</span>
                                </div>
                            </div>

                            {responses.length > 0 && (
                                <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden flex">
                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(agreed / responses.length) * 100}%` }} />
                                    <div className="bg-red-400 h-full transition-all" style={{ width: `${(disagreed / responses.length) * 100}%` }} />
                                    <div className="bg-blue-400 h-full transition-all" style={{ width: `${(other / responses.length) * 100}%` }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Responses Per Event ── */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-bold text-gray-800 text-base">Responses Per Event</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                                    {responses.length} response{responses.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            {responses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                    <MessageSquare size={40} className="text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium text-sm">No responses yet</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        This masjid hasn&apos;t voted on any event yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {responses.map((resp, i) => (
                                        <div key={resp.id || i} className="p-4 sm:p-5">
                                            {/* Event title */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-400 font-medium">Event</p>
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {resp.event?.title || "Unknown Event"}
                                                    </p>
                                                </div>
                                                <VoteBadge vote={resp.vote} />
                                            </div>

                                            {/* Comment */}
                                            {resp.comment && (
                                                <div className="ml-9 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mb-2">
                                                    <p className="text-xs text-gray-400 mb-1 font-medium flex items-center gap-1">
                                                        <MessageSquare size={11} /> Comment
                                                    </p>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{resp.comment}</p>
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <p className="text-xs text-gray-300 ml-9 mt-1">
                                                {new Date(resp.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
