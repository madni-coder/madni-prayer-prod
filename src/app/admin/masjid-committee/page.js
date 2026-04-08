"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, X, PlusCircle, ChevronRight, Search, Trash2, CalendarCheck2, ImageIcon, FileText } from "lucide-react";
import { useAllMasjidContext } from "../../../context/AllMasjidContext";

export default function MasjidCommitteePage() {
    const router = useRouter();
    const { masjids, loading: ctxLoading, fetchAll } = useAllMasjidContext();

    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [reloading, setReloading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 15;

    // Events state
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const res = await fetch('/api/committee-events');
            const json = await res.json();
            if (res.ok) setEvents(json.events || []);
        } catch (e) { console.error(e); }
        finally { setEventsLoading(false); }
    }, []);

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Delete this event?')) return;
        setDeletingId(id);
        try {
            await fetch(`/api/committee-events?id=${id}`, { method: 'DELETE' });
            setEvents((prev) => prev.filter((e) => e.id !== id));
        } catch (e) { console.error(e); }
        finally { setDeletingId(null); }
    };

    // Auth check
    useEffect(() => {
        const ok = typeof window !== "undefined" && localStorage.getItem("isAuthenticated") === "true";
        if (!ok) router.push("/login");
        else setIsAuthenticated(true);
        setAuthLoading(false);
    }, [router]);

    const refresh = useCallback(async () => {
        setReloading(true);
        try { await fetchAll(); } finally { setReloading(false); }
    }, [fetchAll]);

    useEffect(() => { if (isAuthenticated) { refresh(); fetchEvents(); } }, [isAuthenticated, refresh, fetchEvents]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, masjids]);

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
        </div>
    );
    if (!isAuthenticated) return null;

    const filtered = masjids.filter((m) => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
            (m.masjidName || "").toLowerCase().includes(q) ||
            (m.colony || "").toLowerCase().includes(q) ||
            (m.city || "").toLowerCase().includes(q)
        );
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const start = (currentPage - 1) * PAGE_SIZE;
    const paginated = filtered.slice(start, start + PAGE_SIZE);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Masjid Committee</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage events, view proposals & responses</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        disabled={reloading}
                        title="Refresh"
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw size={16} className={reloading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => router.push("/admin/masjid-committee/createMasjidEvent")}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        <PlusCircle size={16} />
                        Create Masjid Event
                    </button>
                </div>
            </div>

            {/* ── Search Bar ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by masjid name, colony or city…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{filtered.length} masjid{filtered.length !== 1 ? "s" : ""} found</p>
            </div>

            {/* ── Events Cards ── */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-800">Created Events</h2>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{events.length} event{events.length !== 1 ? 's' : ''}</span>
                </div>

                {eventsLoading && (
                    <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
                        <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        Loading events…
                    </div>
                )}

                {!eventsLoading && events.length === 0 && (
                    <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center">
                        <CalendarCheck2 size={32} className="text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No events created yet.</p>
                        <button
                            onClick={() => router.push('/admin/masjid-committee/createMasjidEvent')}
                            className="mt-3 text-xs text-emerald-600 font-semibold hover:underline"
                        >Create your first event →</button>
                    </div>
                )}

                {!eventsLoading && events.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {events.map((ev) => (
                            <div key={ev.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                {/* Card top bar */}
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <CalendarCheck2 size={15} className="text-white shrink-0" />
                                        <span className="text-white text-sm font-bold truncate">{ev.title}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteEvent(ev.id)}
                                        disabled={deletingId === ev.id}
                                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors shrink-0 disabled:opacity-40"
                                        title="Delete event"
                                    >
                                        {deletingId === ev.id
                                            ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            : <Trash2 size={14} />}
                                    </button>
                                </div>

                                {/* Description */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{ev.description}</p>
                                </div>

                                {/* Meta row */}
                                <div className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
                                    {/* Vote buttons preview */}
                                    {Array.isArray(ev.buttons) && ev.buttons.length > 0 && (
                                        <div className="flex gap-1 flex-wrap">
                                            {ev.buttons.map((btn, i) => (
                                                <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                    btn.color === 'red' ? 'bg-red-100 text-red-600' :
                                                    btn.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                    btn.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                                                    btn.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>{btn.label}</span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Image count */}
                                    {Array.isArray(ev.image_urls) && ev.image_urls.length > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <ImageIcon size={11} /> {ev.image_urls.length}
                                        </span>
                                    )}
                                    {/* PDF count */}
                                    {Array.isArray(ev.pdf_attachments) && ev.pdf_attachments.length > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <FileText size={11} /> {ev.pdf_attachments.length} PDF
                                        </span>
                                    )}
                                </div>

                                {/* Date */}
                                <div className="px-4 pb-3">
                                    <p className="text-xs text-gray-300">{new Date(ev.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                    { label: "Total Masjids", value: masjids.length, color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { label: "Showing", value: filtered.length, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { label: "Page", value: `${currentPage} / ${totalPages}`, color: "bg-orange-50 text-orange-700 border-orange-200" },
                ].map((s) => (
                    <div key={s.label} className={`rounded-xl border p-3 ${s.color}`}>
                        <div className="text-xl font-bold">{s.value}</div>
                        <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Desktop Table ── */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wide">
                    <div className="col-span-1">#</div>
                    <div className="col-span-4">Masjid Name</div>
                    <div className="col-span-4">Address / Colony</div>
                    <div className="col-span-2">City</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-100">
                    {ctxLoading && (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">Loading masjids…</div>
                    )}
                    {!ctxLoading && paginated.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400 text-sm">No masjids found.</div>
                    )}
                    {paginated.map((m, idx) => (
                        <div
                            key={m.id}
                            onClick={() => router.push(`/admin/masjid-committee/viewResponse?masjidId=${m.loginId ?? m.id}`)}
                            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-emerald-50/60 cursor-pointer transition-colors group"
                        >
                            <div className="col-span-1 flex items-center text-sm text-gray-500 font-medium">{start + idx + 1}</div>
                            <div className="col-span-4 flex items-center gap-3">
                                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-lg shrink-0">🕌</div>
                                <span className="font-semibold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{m.masjidName || "—"}</span>
                            </div>
                            <div className="col-span-4 flex items-center text-sm text-gray-600">{m.colony || m.fullAddress || "—"}</div>
                            <div className="col-span-2 flex items-center">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{m.city || "—"}</span>
                            </div>
                            <div className="col-span-1 flex items-center justify-end">
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
                {ctxLoading && <div className="text-center text-gray-400 text-sm py-8">Loading…</div>}
                {!ctxLoading && paginated.length === 0 && <div className="text-center text-gray-400 text-sm py-8">No masjids found.</div>}
                {paginated.map((m, idx) => (
                    <div
                        key={m.id}
                        onClick={() => router.push(`/admin/masjid-committee/viewResponse?masjidId=${m.loginId ?? m.id}`)}
                        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all active:scale-[0.99]"
                    >
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl shrink-0">🕌</div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate">{m.masjidName || "—"}</div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">{m.colony || m.fullAddress || "—"} {m.city ? `· ${m.city}` : ""}</div>
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 shrink-0">
                            View <ChevronRight size={14} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between gap-4 flex-wrap">
                    <p className="text-xs text-gray-500">
                        Showing {Math.min(start + 1, filtered.length)}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-gray-100 transition-colors"
                        >Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((n) => n === 1 || n === totalPages || Math.abs(n - currentPage) <= 1)
                            .map((n, i, arr) => (
                                <>
                                    {i > 0 && arr[i - 1] !== n - 1 && <span key={`e${n}`} className="px-1 text-gray-400">…</span>}
                                    <button
                                        key={n}
                                        onClick={() => setCurrentPage(n)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${n === currentPage ? "bg-emerald-600 text-white border-emerald-600" : "border-gray-300 hover:bg-gray-100"}`}
                                    >{n}</button>
                                </>
                            ))}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium disabled:opacity-40 hover:bg-gray-100 transition-colors"
                        >Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
