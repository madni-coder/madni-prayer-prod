"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    RefreshCw, PlusCircle, Trash2, CalendarCheck2,
    ImageIcon, FileText, ChevronRight, Users, Pencil
} from "lucide-react";

export default function MasjidCommitteePage() {
    const router = useRouter();

    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Events state
    const [events, setEvents] = useState([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Auth check
    useEffect(() => {
        const ok =
            typeof window !== "undefined" &&
            localStorage.getItem("isAuthenticated") === "true";
        if (!ok) router.push("/login");
        else setIsAuthenticated(true);
        setAuthLoading(false);
    }, [router]);

    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const res = await fetch("/api/committee-events");
            const json = await res.json();
            if (res.ok) setEvents(json.events || []);
        } catch (e) {
            console.error(e);
        } finally {
            setEventsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchEvents();
    }, [isAuthenticated, fetchEvents]);

    const handleDeleteEvent = async (e, id) => {
        e.stopPropagation(); // don't trigger card click
        if (!window.confirm("Delete this event?")) return;
        setDeletingId(id);
        try {
            await fetch(`/api/committee-events?id=${id}`, { method: "DELETE" });
            setEvents((prev) => prev.filter((ev) => ev.id !== id));
        } catch (err) {
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    if (authLoading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500" />
            </div>
        );
    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Masjid Committee</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Create events &amp; view masjid responses
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchEvents}
                        disabled={eventsLoading}
                        title="Refresh"
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw size={16} className={eventsLoading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() =>
                            router.push("/admin/masjid-committee/createMasjidEvent")
                        }
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                    >
                        <PlusCircle size={16} />
                        Create Masjid Event
                    </button>
                </div>
            </div>

            {/* ── Events Section ── */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-800">Created Events</h2>
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                    {events.length} event{events.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Loading */}
            {eventsLoading && (
                <div className="flex items-center gap-2 py-8 text-gray-400 text-sm justify-center">
                    <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    Loading events…
                </div>
            )}

            {/* Empty */}
            {!eventsLoading && events.length === 0 && (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <CalendarCheck2 size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No events created yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Create an event to collect votes from all committee masjids.
                    </p>
                    <button
                        onClick={() =>
                            router.push("/admin/masjid-committee/createMasjidEvent")
                        }
                        className="mt-4 inline-flex items-center gap-1.5 text-sm text-emerald-600 font-semibold hover:underline"
                    >
                        <PlusCircle size={14} /> Create your first event
                    </button>
                </div>
            )}

            {/* Event Cards Grid */}
            {!eventsLoading && events.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {events.map((ev) => (
                        <div
                            key={ev.id}
                            onClick={() =>
                                router.push(
                                    `/admin/masjid-committee/viewResponse?eventId=${ev.id}`
                                )
                            }
                            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden
                                       hover:shadow-md hover:border-emerald-400 cursor-pointer
                                       transition-all duration-200 group relative"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                    <CalendarCheck2 size={15} className="text-white shrink-0" />
                                    <span className="text-white text-sm font-bold truncate">
                                        {ev.title}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {/* View responses hint */}
                                    <span className="text-white/60 text-xs group-hover:text-white transition-colors mr-1">
                                        View responses
                                    </span>
                                    <ChevronRight
                                        size={15}
                                        className="text-white/60 group-hover:text-white transition-colors"
                                    />
                                    {/* Edit Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/admin/masjid-committee/${ev.id}`);
                                        }}
                                        className="ml-1 p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                        title="Edit event"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDeleteEvent(e, ev.id)}
                                        disabled={deletingId === ev.id}
                                        className="ml-1 p-1.5 text-white/60 hover:text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-40"
                                        title="Delete event"
                                    >
                                        {deletingId === ev.id ? (
                                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                                    {ev.description}
                                </p>
                            </div>

                            {/* Meta Row */}
                            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                                {/* Vote button badges */}
                                {Array.isArray(ev.buttons) && ev.buttons.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {ev.buttons.map((btn, i) => (
                                            <span
                                                key={i}
                                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${btn.color === "red"
                                                    ? "bg-red-100 text-red-600"
                                                    : btn.color === "blue"
                                                        ? "bg-blue-100 text-blue-600"
                                                        : btn.color === "orange"
                                                            ? "bg-orange-100 text-orange-600"
                                                            : btn.color === "purple"
                                                                ? "bg-purple-100 text-purple-600"
                                                                : "bg-emerald-100 text-emerald-700"
                                                    }`}
                                            >
                                                {btn.label}
                                            </span>
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
                                {Array.isArray(ev.pdf_attachments) &&
                                    ev.pdf_attachments.length > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <FileText size={11} /> {ev.pdf_attachments.length} PDF
                                        </span>
                                    )}

                                {/* Responses chip */}
                                <span className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                    <Users size={11} /> Responses
                                </span>
                            </div>

                            {/* Date */}
                            <div className="px-4 pb-3">
                                <p className="text-xs text-gray-300">
                                    {new Date(ev.created_at).toLocaleString("en-IN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
