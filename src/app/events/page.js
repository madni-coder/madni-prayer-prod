"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarRange, Clock, MapPin, Loader2 } from "lucide-react";

export default function EventsListingPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        import("axios").then((axios) => {
            axios.default.get(`/api/events`)
                .then((res) => {
                    if (mounted) {
                        setEvents(res.data?.events || []);
                        setLoading(false);
                    }
                })
                .catch((err) => {
                    console.error("Failed to load active events:", err);
                    if (mounted) setLoading(false);
                });
        });
        return () => { mounted = false; };
    }, []);

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarRange className="w-6 h-6 text-rose-500" />
                            Events & Programs
                        </h1>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero / Info */}
                <div className="mb-10 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Active Registrations</h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
                        Discover and register for upcoming programs, events, and volunteer opportunities.
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium">Loading events...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 px-4 text-center">
                        <CalendarRange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900">No active events</h3>
                        <p className="text-sm text-gray-500 mt-1">There are currently no active programs to register for. Please check back later.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {events.map((event) => {
                            return (
                                <div 
                                    key={event.slug}
                                    className="group flex flex-col sm:flex-row bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Color Banner / Indicator */}
                                    <div 
                                        className="w-full sm:w-4 flex-shrink-0 bg-primary" 
                                    />
                                    
                                    {/* Card Body */}
                                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 sm:p-6 gap-6 bg-base-100 text-base-content">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold mb-2 truncate group-hover:text-primary transition-colors">
                                                {event.title}
                                            </h3>
                                            {event.description && (
                                                <p className="text-sm opacity-70 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <Link 
                                            href={`/events/${event.slug}`}
                                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-primary-content shadow-sm hover:shadow-md transition-all whitespace-nowrap bg-primary"
                                        >
                                            View event
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
