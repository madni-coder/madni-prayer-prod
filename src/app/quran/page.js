"use client";
import React, { useState } from "react";

// Sample Surah data (in real app, fetch from API or static JSON)
const surahs = [
    { number: 1, name: "Al-Fatiha", arabic: "الفاتحة", ayahs: 7 },
    { number: 2, name: "Al-Baqarah", arabic: "البقرة", ayahs: 286 },
    { number: 3, name: "Al-Imran", arabic: "آل عمران", ayahs: 200 },
    // ...add more or fetch dynamically
];

export default function Quran() {
    const [search, setSearch] = useState("");
    const filtered = surahs.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.arabic.includes(search) ||
            String(s.number) === search
    );

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary-green)] mb-4">
                Quran
            </h2>
            <div className="glass-card p-6 max-w-2xl w-full">
                <input
                    className="input input-bordered w-full mb-4"
                    placeholder="Search Surah by name, number, or Arabic..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((s) => (
                        <div
                            key={s.number}
                            className="neumorph-card p-4 flex flex-col items-center transition hover:scale-105 cursor-pointer"
                        >
                            <span className="text-lg font-bold text-[var(--primary-green)]">
                                {s.number}. {s.name}
                            </span>
                            <span className="text-2xl mb-1">{s.arabic}</span>
                            <span className="text-xs text-gray-500">
                                Ayahs: {s.ayahs}
                            </span>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-2 text-center text-gray-400">
                            No Surah found.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
