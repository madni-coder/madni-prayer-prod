"use client";

import React, { useEffect, useState } from "react";
import { FaStore } from "react-icons/fa";

// simple in-memory cache to avoid duplicate network calls (dev strict mode / remounts)
let storesCache = null;
let storesPromise = null;

export default function LocalStoresPage() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            if (!storesPromise) {
                storesPromise = fetch("/api/local-stores").then((r) => r.json());
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
        <main className="min-h-screen py-8 px-4 bg-base-100 text-base-content">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-full bg-emerald-500 text-white">
                        <FaStore size={20} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Local Stores</h1>
                        <p className="text-sm text-muted">There store belongs to only Imaam or Moizzan </p>
                    </div>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-muted">Loading stores…</div>
                ) : error ? (
                    <div className="py-12 text-center text-error">{error}</div>
                ) : stores.length === 0 ? (
                    <div className="py-12 flex items-center justify-center">
                        <div className="rounded-lg p-6 bg-base-200 text-base-content shadow-sm max-w-md text-center">
                            No stores are added as of now
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {stores.map((s) => (
                            <div key={s.id} className="relative overflow-hidden rounded-2xl shadow-lg transform transition hover:shadow-2xl bg-transparent">
                                <div className="relative w-full h-40 sm:h-44 md:h-48 bg-gray-100 dark:bg-gray-800">
                                    {s.imageSrcPortrait || s.imageSrc ? (
                                        <img src={s.imageSrcPortrait || s.imageSrc} alt={s.shopName || "store"} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-4xl text-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800">
                                            <FaStore />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                    <div className="absolute left-4 bottom-4 right-4">
                                        <div>
                                            <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white shadow">{s.workType || "Local"}</div>
                                            <h3 className="mt-2 text-white text-lg font-bold drop-shadow">{s.shopName || "Untitled Store"}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/70 dark:bg-base-200/70 backdrop-blur-sm border border-base-200/50">
                                    <div className="flex items-center justify-between gap-3 mb-3">
                                        <div className="flex-1">
                                            <div className="inline-block px-3 py-1 rounded-md bg-primary text-primary-content font-semibold">{s.shopName || "Untitled Store"}</div>
                                        </div>
                                        {s.workType ? (
                                            <div className="inline-block px-3 py-1 rounded-md bg-error text-error-content text-sm font-medium">{s.workType}</div>
                                        ) : null}
                                    </div>

                                    {s.description ? <p className="text-sm text-base-content/85 line-clamp-4">{s.description}</p> : <p className="text-sm text-muted">No description provided.</p>}

                                    <div className="mt-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs text-muted">Owner</div>
                                            <div className="text-sm font-medium">{s.fullName || "—"}</div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <a href={s.mobile ? `tel:${s.mobile}` : "#"} aria-label={s.mobile ? `Call ${s.mobile}` : "No number"} className="inline-block px-4 py-2 rounded-md bg-emerald-500 text-white text-sm font-medium shadow hover:brightness-95">Call</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
