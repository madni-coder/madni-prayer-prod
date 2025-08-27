'use client'
import React, { useState } from "react";

export default function Tasbih() {
    const [count, setCount] = useState(0);

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in bg-base-100">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Tasbih Counter
            </h2>
            <div className="glass-card p-8 max-w-2xl w-full text-center bg-base-200 text-base-content shadow-2xl rounded-3xl flex flex-col items-center">
                {/* 3D Counter Display */}
                <div
                    className="relative mb-8"
                    style={{
                        perspective: "600px",
                    }}
                >
                    <div
                        className="bg-gradient-to-br from-primary to-secondary text-white text-6xl md:text-7xl font-mono font-bold py-8 px-16 rounded-2xl shadow-2xl border-4 border-primary/30"
                        style={{
                            transform: "rotateX(18deg) rotateY(-12deg)",
                            boxShadow:
                                "0 8px 32px 0 rgba(31, 38, 135, 0.37), 0 1.5px 0 #fff inset",
                        }}
                    >
                        {count}
                    </div>
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-primary/30 blur-md rounded-full opacity-60"></span>
                </div>
                {/* 3D Buttons */}
                <div className="flex gap-6 justify-center">
                    <button
                        className="relative bg-gradient-to-br from-primary to-secondary text-white text-xl font-bold py-4 px-10 rounded-full shadow-lg transition-transform active:scale-95 border-2 border-primary/40 hover:brightness-110"
                        style={{
                            boxShadow:
                                "0 6px 20px 0 rgba(31, 38, 135, 0.25), 0 2px 0 #fff inset",
                            transform: "translateZ(0)",
                        }}
                        onClick={() => setCount((c) => c + 1)}
                        aria-label="Increment Tasbih"
                    >
                        <span className="drop-shadow-lg">Count +1</span>
                    </button>
                    <button
                        className="relative bg-gradient-to-br from-base-300 to-base-100 text-primary text-xl font-bold py-4 px-8 rounded-full shadow-md border-2 border-primary/20 hover:bg-base-200 transition-all active:scale-95"
                        style={{
                            boxShadow:
                                "0 4px 12px 0 rgba(31, 38, 135, 0.10), 0 1px 0 #fff inset",
                        }}
                        onClick={() => setCount(0)}
                        aria-label="Reset Tasbih"
                    >
                        <span className="drop-shadow">Reset</span>
                    </button>
                </div>
                <p className="text-lg mb-2">
                    Digital counter, auto count, reset, audio, leaderboard.
                </p>
                <p className="text-sm text-base-content/60">
                    (Feature coming soon)
                </p>
            </div>
        </section>
    );
}
