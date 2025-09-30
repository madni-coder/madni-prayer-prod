"use client";
import React, { useState, useCallback, useEffect } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { PiHandTapLight } from "react-icons/pi";
import UserModal from "../../components/UserModal";
import { FaAngleLeft } from "react-icons/fa";

export default function Tasbih() {
    // Initialize count from localStorage
    const [count, setCount] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("tasbihCount");
            return saved ? Number(saved) : 0;
        }
        return 0;
    });
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [history, setHistory] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("duroodHistory");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [savedMobile, setSavedMobile] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("userMobile") || "";
        }
        return "";
    });

    // Sync count to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("tasbihCount", count);
        }
    }, [count]);

    // Sync history to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("duroodHistory", JSON.stringify(history));
        }
    }, [history]);

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
            <button
                className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            <div className="w-full max-w-3xl flex items-center gap-2">
                <h2 className="flex-1 text-xl font-bold">Tasbih</h2>

                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowUserModal(true)}
                    aria-label="Register Durood"
                >
                    Submit Durood Sharif
                </button>
            </div>
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
                {/* Header row with label and reset button */}
                <div
                    className="w-full flex items-center justify-between mb-2"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-lg font-semibold">Tasbih Counter</p>
                    <button
                        aria-label="Reset"
                        className="btn btn-ghost btn-circle"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowResetConfirm(true);
                        }}
                    >
                        <RotateCw className="h-6 w-6" />
                    </button>
                </div>
                <div className="divider my-4" />

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
                                {count.toString().padStart(2, "0")}
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

            {/* User registration modal */}
            <UserModal
                open={showUserModal}
                onClose={() => setShowUserModal(false)}
                onSuccess={(data) => {
                    // Save mobile number to localStorage
                    if (data && data.mobile) {
                        localStorage.setItem("userMobile", data.mobile);
                        setSavedMobile(data.mobile);
                    }
                    setShowUserModal(false);
                    // Capture current count for history, then reset counter
                    const currentCount = count;
                    const newEntry = {
                        count: currentCount,
                        date: new Date().toLocaleDateString(),
                        time: new Date().toLocaleTimeString(),
                    };
                    setHistory((prev) => [newEntry, ...prev]);
                    setCount(0);
                }}
                tasbihCount={count}
                savedMobile={savedMobile}
            />

            {/* Durood history list */}
            <div className="w-full max-w-3xl mt-6 card bg-base-200 shadow-md rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-primary">
                    Durood History
                </h3>
                {history.length === 0 ? (
                    <div className="text-center text-base text-primary/70">
                        No history yet. Register your durood to see it here.
                    </div>
                ) : (
                    <table className="table w-full text-primary text-l">
                        <thead>
                            <tr>
                                <th>Counts</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, idx) => (
                                <tr key={idx}>
                                    <td>
                                        {item.count.toString().padStart(2, "0")}
                                    </td>
                                    <td>{item.date}</td>
                                    <td>
                                        {new Date(
                                            `1970-01-01T${item.time}`
                                        ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-ghost btn-square"
                                            onClick={() => setDeleteIndex(idx)}
                                            aria-label="Delete entry"
                                        >
                                            <Trash2 className="h-5 w-5 text-red-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {history.length > 0 && (
                    <div className="mt-4 text-right text-lg font-bold text-primary">
                        Total Counts:{" "}
                        {history
                            .reduce((sum, item) => sum + Number(item.count), 0)
                            .toString()
                            .padStart(2, "0")}
                    </div>
                )}
            </div>

            {/* Delete confirmation modal */}
            {deleteIndex !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg">Delete Entry</h3>
                            <p className="py-4">
                                Are you sure you want to delete this entry?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-error"
                                    onClick={() => {
                                        setHistory(
                                            history.filter(
                                                (_, i) => i !== deleteIndex
                                            )
                                        );
                                        setDeleteIndex(null);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setDeleteIndex(null)}
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
