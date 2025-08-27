// ...existing code from tasbih.js moved here...
import React from "react";

export default function Tasbih() {
    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary-green)] mb-4">
                Tasbih Counter
            </h2>
            <div className="glass-card p-6 max-w-2xl w-full text-center">
                <p className="text-lg text-[var(--foreground)] mb-2">
                    Digital counter, auto count, reset, audio, leaderboard.
                </p>
                <p className="text-sm text-gray-500">(Feature coming soon)</p>
            </div>
        </section>
    );
}
