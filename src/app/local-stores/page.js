"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaStore, FaSearch, FaAngleLeft } from "react-icons/fa";

// simple in-memory cache to avoid duplicate network calls (dev strict mode / remounts)
let storesCache = null;
let storesPromise = null;

export default function LocalStoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("");
    const router = useRouter();

    const filteredStores = useMemo(() => {
        if (!query) return stores || [];
        const q = query.toLowerCase();
        return (stores || []).filter((st) => (st.shopName || "").toLowerCase().includes(q));
    }, [stores, query]);

    // show a limited number of items initially to reduce render cost
    const INITIAL_VISIBLE = 10;
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (storesCache) {
                if (!mounted) return;
                setStores(storesCache);
                setLoading(false);
                return;
            }

            // if a fetch is already in progress, reuse its promise
            // When statically exported for Tauri, API routes are not available
            // so use the external API base if configured.
            const apiBase = process.env.NEXT_PUBLIC_TAURI_STATIC_EXPORT === "1" || process.env.NEXT_PUBLIC_TAURI_BUILD === "1"
                ? (process.env.NEXT_PUBLIC_API_BASE_URL || "")
                : "";

            const apiUrl = `${apiBase}/api/local-stores`.replace(/([^:]?)\/\//g, "$1/");

            if (!storesPromise) {
                storesPromise = fetch(apiUrl).then((r) => r.json());
            }

            try {
                const data = await storesPromise;
                if (!mounted) return;
                if (data && data.ok) {
                    storesCache = data.data || [];
                    setStores(storesCache);
                } else {
                    setError(data?.error || "Failed to load stores");
                }
            } catch (err) {
                if (!mounted) return;
                setError(String(err));
            } finally {
                if (!mounted) return;
                setLoading(false);
                // allow subsequent refetches later if needed
                storesPromise = null;
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <main className="min-h-screen py-4 px-4 bg-base-100 text-base-content">
            <div className="max-w-6xl mx-auto">

                <div className="mb-2 flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>

                </div>
                <div>
                    <h1 className="text-2xl font-bold text-primary mb-1">Olmaa's Stores</h1>
                    <p className="text-sm text-muted mb-2">This stores belongs to only Olmaa,Imaam or Moizzan </p>
                </div>
                {loading ? (
                    <div className="min-h-screen flex items-center justify-center bg-base-200">
                        <style>{`\n                        .loader {\n                            position: relative;\n                            width: 100px;\n                            height: 100px;\n                        }\n                        .loader:before{\n                            content: '';\n                            position: absolute;\n                            width: 48px;\n                            height: 48px;\n                            border-radius: 50%;\n                            top: 50%;\n                            left: 0;\n                            transform: translate(-5px, -50%);\n                            background: linear-gradient(to right, #fff 50%, var(--primary-color, #de3500) 50%) no-repeat;\n                            background-size: 200% auto;\n                            background-position: 100% 0;\n                            animation: colorBallMoveX 1.5s linear infinite alternate;\n                        }\n                        .loader:after{\n                            content: '';\n                            position: absolute;\n                            left: 50%;\n                            top: 0;\n                            transform: translateX(-50%);\n                            width: 2px;\n                            height: 100%;\n                            background: var(--primary-color, #de3500);\n                        }\n                        @keyframes colorBallMoveX {\n                          0%  {\n                            background-position: 0% 0;\n                            transform: translate(-15px, -50%);\n                          }\n                          15%  , 25% {\n                            background-position: 0% 0;\n                            transform: translate(0px, -50%);\n                          }\n                          75% , 85% {\n                            background-position: 100% 0;\n                            transform: translate(50px, -50%);\n                          }\n                          100% {\n                            background-position: 100% 0;\n                            transform: translate(65px, -50%);\n                          }\n                        }\n                        `}</style>

                        <span className="loader" aria-hidden="true"></span>
                    </div>
                ) : error ? (
                    <div className="py-12 text-center text-error">{error}</div>
                ) : stores.length === 0 ? (
                    <div className="py-12 flex items-center justify-center">
                        <div className="rounded-lg p-6 bg-base-200 text-base-content shadow-sm max-w-md text-center">
                            No stores are added as of now
                        </div>
                    </div>
                ) : (
                    <>
                        {/* show search when we have stores */}
                        {stores.length > 0 && (
                            <div className="mb-6">
                                <div className="max-w-2xl">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-base-200/60 border border-gray-600/30 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                                        <FaSearch className="text-muted" />
                                        <input
                                            type="search"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Search shops by name..."
                                            className="bg-transparent outline-none w-full text-base-content placeholder:text-muted"
                                        />
                                        {query ? (
                                            <button onClick={() => setQuery("")} className="text-sm text-muted">Clear</button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6">
                            {filteredStores.length === 0 ? (
                                <div className="py-12 text-center text-muted">No stores match your search</div>
                            ) : (
                                // only render a subset initially to speed up first paint
                                filteredStores.slice(0, visibleCount).map((s) => (
                                    <div key={s.id} className="block">
                                        <div className="relative overflow-hidden rounded-2xl shadow-lg transform transition hover:shadow-2xl bg-transparent border border-primary/100">
                                            <div className="relative w-full h-40 sm:h-44 md:h-48 bg-gray-100 dark:bg-gray-800">
                                                {s.imageSrcPortrait || s.imageSrc ? (
                                                    <img src={s.imageSrcPortrait || s.imageSrc} alt={s.shopName || "store"} className="object-cover w-full h-full" loading="lazy" decoding="async" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full w-full text-4xl text-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800">
                                                        <FaStore />
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                                {/* removed overlaid name/category to keep image clean */}
                                            </div>

                                            <div className="p-4 bg-white/70 dark:bg-base-200/70 backdrop-blur-sm border border-base-200/50">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="flex-1">
                                                        <h2 className="text-lg font-semibold text-emerald-600">{s.shopName || "Untitled Store"}</h2>
                                                    </div>
                                                </div>

                                                {s.description ? <p className="text-sm text-base-content/85 line-clamp-4">{s.description}</p> : <p className="text-sm text-muted">No description provided.</p>}

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-xs text-muted">Owner</div>
                                                        <div className="text-sm font-medium">{s.fullName || "—"}</div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <a href={s.mobile ? `tel:${s.mobile}` : "#"} aria-label={s.mobile ? `Call ${s.mobile}` : "No number"} className="inline-block px-4 py-2 rounded-md bg-emerald-500 text-white text-sm font-medium shadow hover:brightness-95">Call</a>
                                                        <a href={`/local-stores/viewStore?id=${s.id}`} aria-label={`View ${s.shopName || 'store'}`} className="inline-block px-4 py-2 rounded-md bg-yellow-800 text-white text-sm font-medium shadow hover:brightness-95">View</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* show load more when there are more items than currently visible */}
                            {visibleCount < filteredStores.length && (
                                <div className="flex justify-center">
                                    <button className="px-4 py-2 rounded-md bg-primary text-white" onClick={() => setVisibleCount((v) => v + INITIAL_VISIBLE)}>Load more</button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
