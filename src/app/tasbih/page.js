"use client";
import React, { useState } from "react";

export default function Tasbih() {
    const [count, setCount] = useState(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in bg-base-100">
            <div className="relative w-full max-w-2xl">
                {/* Confirmation Popup */}
                {showResetConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div
                            sx={{
                                bg: "background",
                                color: "text",
                                borderRadius: 12,
                                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                                p: 4,
                                minWidth: 300,
                                textAlign: "center",
                            }}
                            className="bg-base-100 text-base-content rounded-2xl shadow-2xl p-6"
                        >
                            <p className="mb-6 text-lg font-semibold">
                                Are you sure want to RESET?
                            </p>
                            <div className="flex justify-center gap-6">
                                <button
                                    className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary/90"
                                    onClick={() => {
                                        setCount(0);
                                        setShowResetConfirm(false);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="bg-base-300 text-primary px-6 py-2 rounded-full font-bold hover:bg-base-200"
                                    onClick={() => setShowResetConfirm(false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                    Tasbih Counter
                </h2>
                <div className="glass-card p-8 max-w-2xl w-full text-center bg-base-200 text-base-content shadow-2xl rounded-3xl flex flex-col items-center relative">
                    {/* Reset Button Top Right (inside card) */}
                    <button
                        className="absolute top-4 right-4 z-10 bg-gradient-to-br from-base-300 to-base-100 text-primary text-lg font-bold py-2 px-5 rounded-full shadow-md border-2 border-primary/20 hover:bg-base-200 transition-all active:scale-95"
                        onClick={() => setShowResetConfirm(true)}
                        aria-label="Reset Tasbih"
                    >
                        Reset
                    </button>
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
                    </div>
                    <p className="text-lg mb-2">
                        Digital counter, auto count, reset, audio, leaderboard.
                    </p>
                    <p className="text-sm text-base-content/60">
                        (Feature coming soon)
                    </p>
                </div>
            </div>
        </section>
    );
}
