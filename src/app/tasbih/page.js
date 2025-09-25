"use client";
import React, { useState, useCallback } from "react";
import { RotateCw } from "lucide-react";
import { PiHandTapLight } from "react-icons/pi";

export default function Tasbih() {
    const [count, setCount] = useState(0);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // shared increment handler (1..100 then wrap to 0)
    const increment = useCallback(() => {
        setCount((c) => (c + 1) % 101);
    }, []);

    // determine which tick is active (one-based count -> zero-based index)
    const activeTick = count > 0 ? (count - 1) % 100 : -1;

    // helper to render 100 tick marks around a circle
    const ticks = Array.from({ length: 100 }).map((_, i) => {
        const angle = (i / 100) * 360;
        const long = i % 5 === 0; // every 5th tick longer
        const isActive = i === activeTick;
        const y2 = isActive ? -72 : long ? -78 : -84;
        const strokeW = isActive ? 2.5 : long ? 2 : 1;
        const strokeColor = isActive ? "white" : "currentColor";
        return (
            <line
                key={i}
                x1="0"
                y1={-90}
                x2="0"
                y2={y2}
                strokeWidth={strokeW}
                transform={`rotate(${angle})`}
                stroke={strokeColor}
                strokeLinecap="round"
            />
        );
    });

    return (
        <section className="flex flex-col items-center min-h-screen px-4 py-6 bg-base-100 text-base-content">
            {/* Header */}
            <div className="w-full max-w-3xl flex items-center gap-2">
                <button aria-label="Back" className="btn btn-ghost btn-square">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                <h2 className="flex-1 text-xl font-bold">Tasbih</h2>
            </div>
            <button
                aria-label="Reset"
                className="fixed mt-6 right-4 z-50 btn btn-ghost btn-circle"
                onClick={() => setShowResetConfirm(true)}
            >
                <RotateCw className="h-6 w-6" />
            </button>
            {/* Card */}
            {/* Make this entire card respond to pointer and keyboard so taps anywhere increment the counter */}
            <div
                className="w-full max-w-3xl mt-6 card bg-base-200 shadow-md rounded-2xl p-6 flex flex-col items-center"
                onPointerDown={(e) => {
                    // increment on any pointer (touch/mouse/stylus)
                    increment();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    // support keyboard activation
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        increment();
                    }
                }}
                aria-label="Tasbih tappable area"
            >
                <div className="w-full text-center">
                    <p className="text-lg font-semibold">Tasbih Counter</p>
                    <div className="divider my-4" />
                </div>
                {/* fixed top-right reset button */}

                {/* Circular ring with ticks */}
                <div className="relative flex items-center justify-center mb-8">
                    <svg
                        viewBox="-110 -110 220 220"
                        width="260"
                        height="260"
                        className="text-primary/80"
                    >
                        <g transform="translate(0,0)">{ticks}</g>
                        <circle
                            cx="0"
                            cy="0"
                            r="92"
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.08"
                            strokeWidth="6"
                        />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary">
                                {count}
                            </div>
                            <div className="text-sm text-muted">/100</div>
                        </div>
                    </div>
                </div>

                {/* Large tappable area */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <button
                        // stop propagation so the parent doesn't double-increment when the inner button is used
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            increment();
                        }}
                        className="btn btn-circle bg-base-100 border border-primary text-primary shadow-md hover:scale-105 transition-transform w-28 h-28 flex items-center justify-center"
                        aria-label="Increment Tasbih"
                    >
                        <PiHandTapLight className="h-20 w-20" />
                    </button>

                    <div className="text-xl font-bold">Tap Anywhere</div>
                </div>
            </div>

            {/* Reset confirmation modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg">Reset Counter</h3>
                            <p className="py-4">
                                Are you sure you want to reset the tasbih
                                counter?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setCount(0);
                                        setShowResetConfirm(false);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowResetConfirm(false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
