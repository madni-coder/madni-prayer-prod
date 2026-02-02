"use client";
import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { RotateCw, Trash2 } from "lucide-react";
import { PiHandTapLight } from "react-icons/pi";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";

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
    const [showLimitReached, setShowLimitReached] = useState(false);
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
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem('userData');
            return !!userData;
        }
        return false;
    });
    const [submitting, setSubmitting] = useState(false);
    const [theme, setTheme] = useState("system");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;
    const totalPages = Math.ceil(history.length / entriesPerPage);
    const paginatedHistory = history.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );
    // Clear history confirmation modal
    const [showClearHistoryConfirm, setShowClearHistoryConfirm] =
        useState(false);

    const router = useRouter();

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

    // Detect theme changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme") || "system";
            setTheme(savedTheme);

            const observer = new MutationObserver(() => {
                const currentTheme = localStorage.getItem("theme") || "system";
                setTheme(currentTheme);
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["data-theme", "class"],
            });

            return () => observer.disconnect();
        }
    }, []);

    // Helper function to show toast (react-toastify)
    const showToast = (t) => {
        if (!t) return;
        if (t.type === "error") toast.error(t.text || t.message || String(t));
        else toast.success(t.text || t.message || String(t));
    };

    // Helper to get effective theme
    const effectiveTheme = () => {
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return theme;
    };

    // Helper function to trigger low intensity vibration on mobile
    // Tries multiple fallbacks: standard Vibration API, common WebView bridges,
    // and a Tauri invoke if available. Nothing is done if no API exists.
    const triggerVibration = useCallback(() => {
        if (typeof window === "undefined") return;

        try {
            // 1) Standard web Vibration API (works in Android Chrome and many browsers)
            if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                navigator.vibrate(20);
                return;
            }

            // 2) React Native WebView bridge
            if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: "vibrate", duration: 20 }));
                return;
            }

            // 3) Android/JavascriptInterface commonly exposed as `Android` or `android`
            if (window.Android && typeof window.Android.vibrate === "function") {
                window.Android.vibrate(20);
                return;
            }
            if (window.android && typeof window.android.vibrate === "function") {
                window.android.vibrate(20);
                return;
            }

            // 4) WKWebView iOS message handler (app must expose a `vibrate` handler)
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.vibrate) {
                window.webkit.messageHandlers.vibrate.postMessage({ duration: 20 });
                return;
            }

            // 5) Tauri: try invoking a vibration command if the host exposes one
            // Note: plugin name and command depend on your Tauri setup.
            // This attempts a generic `invoke('vibrate', { duration })` if available.
            if (window.__TAURI__ && typeof window.__TAURI__.invoke === "function") {
                // best-effort, ignore errors
                window.__TAURI__.invoke("vibrate", { duration: 20 }).catch(() => { });
                return;
            }
        } catch (err) {
            // swallow errors — vibration is non-essential
            // eslint-disable-next-line no-console
            console.warn("triggerVibration error:", err);
        }
    }, []);

    // shared increment handler (1..10000 then show popup)
    const increment = useCallback(() => {
        setCount((c) => {
            if (c >= 10000) {
                setShowLimitReached(true);
                return c;
            }
            triggerVibration(); // Add vibration feedback
            return c + 1;
        });
    }, [triggerVibration]);

    // determine which tick is active (scale count to 100 ticks)
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
        <section className="flex flex-col items-center min-h-screen px-4 py-1 bg-base-100 text-base-content">
            {/* Header */}
            <button
                className="flex items-center gap-2 mb-2 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            <div className="w-full max-w-3xl flex items-center gap-2">


            </div>

            {/* Hidden message removed from page — now shown only in modal */}

            {/* Card */}
            {/* Make this entire card respond to pointer and keyboard so taps anywhere increment the counter */}
            <div
                className="w-full max-w-3xl  card bg-base-200 shadow-md rounded-2xl p-6 flex flex-col items-center"
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

            {/* Limit reached modal */}
            {showLimitReached && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg text-primary">
                                🎉 Congratulations!
                            </h3>
                            <p className="py-4">
                                You have reached the maximum count of 10,000!
                                Please reset the counter to continue.
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setCount(0);
                                        setShowLimitReached(false);
                                    }}
                                >
                                    Reset Counter
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowLimitReached(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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



            {/* Durood history list */}
            <div className="w-full max-w-3xl mt-6 mb-14 card bg-base-200 shadow-md rounded-2xl p-6">
                <button
                    className="btn btn-sm btn-primary mb-4"
                    onClick={async () => {
                        // Prevent submit when count is not greater than 0
                        if (!count || Number(count) <= 0) {
                            showToast({ type: "error", text: "Count Value must be greater than 0" });
                            return;
                        }
                        // Check if user is logged in
                        const userData = localStorage.getItem('userData');

                        if (userData) {
                            // User exists, call tasbih API directly
                            try {
                                setSubmitting(true);
                                const user = JSON.parse(userData);
                                const { data } = await apiClient.post(
                                    "/api/api-tasbihUsers",
                                    {
                                        fullName: user.fullName,
                                        address: user.address,
                                        mobileNumber: user.mobile || user.email,
                                        tasbihCount: count,
                                        weeklyCounts: count,
                                    }
                                );

                                if (data.ok) {
                                    // Add to history
                                    const newEntry = {
                                        count: count,
                                        weeklyCounts: count,
                                        date: new Date().toLocaleDateString(),
                                        time: new Date().toLocaleTimeString(),
                                    };
                                    setHistory((prev) => [newEntry, ...prev]);
                                    setCount(0);
                                    showToast({ type: "success", text: "Durood Counts Submitted Successfully" });
                                } else {
                                    showToast({ type: "error", text: data.message || "Failed to submit. Please try again." });
                                }
                            } catch (error) {
                                console.error('Error submitting tasbih:', error);
                                showToast({ type: "error", text: "Failed to submit. Please try again." });
                            } finally {
                                setSubmitting(false);
                            }
                        } else {
                            // User not logged in, redirect to profile page
                            router.push('/myProfile');
                        }
                    }}
                    disabled={submitting}
                    aria-label="Register Durood"
                >
                    {submitting ? 'Submitting...' : 'Submit Durood Sharif'}
                </button>
                <h3 className="text-lg font-bold mb-4 text-primary">
                    <span>Durood History</span>
                    <button
                        className="btn btn-ghost btn-sm text-error border border-error hover:bg-error/10 float-right"
                        style={{ float: "right" }}
                        aria-label="Clear History"
                        onClick={() => setShowClearHistoryConfirm(true)}
                    >
                        Clear History
                    </button>
                </h3>
                {history.length === 0 ? (
                    <div className="text-center text-base text-primary/70">
                        No history yet. Register your durood to see it here.
                    </div>
                ) : (
                    <>
                        {/* Desktop / Tablet: scrollable fixed table to avoid layout shift */}
                        <div className="hidden md:block w-full overflow-x-auto">
                            <table className="table table-fixed w-full text-primary text-l">
                                <thead>
                                    <tr>
                                        <th className="w-24">Counts</th>
                                        <th className="w-40">Date</th>
                                        <th className="w-36">Time</th>
                                        {/* Action column removed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedHistory.map((item, idx) => (
                                        <tr
                                            key={
                                                idx +
                                                (currentPage - 1) *
                                                entriesPerPage
                                            }
                                        >
                                            <td className="align-middle">
                                                {item.count
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </td>
                                            <td className="align-middle">
                                                {item.date}
                                            </td>
                                            <td className="align-middle">
                                                {new Date(
                                                    `1970-01-01T${item.time}`
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </td>
                                            {/* Action button removed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: stacked cards for each history row to avoid narrow columns and right overflow */}
                        <div className="md:hidden flex flex-col gap-3">
                            {paginatedHistory.map((item, idx) => (
                                <div
                                    key={
                                        idx + (currentPage - 1) * entriesPerPage
                                    }
                                    className="w-full bg-base-100 rounded-lg p-3 flex items-center justify-between border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono text-lg text-primary w-12 text-center">
                                            {item.count
                                                .toString()
                                                .padStart(2, "0")}
                                        </div>
                                        <div className="flex flex-col text-sm text-primary/90">
                                            <span className="font-semibold">
                                                {item.date}
                                            </span>
                                            <span className="text-xs text-primary/70">
                                                {new Date(
                                                    `1970-01-01T${item.time}`
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div>{/* Action button removed */}</div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {history.length > entriesPerPage && (
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <button
                                    className="btn btn-sm btn-outline"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                >
                                    Previous
                                </button>
                                <span className="px-2 font-semibold">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-sm btn-outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        <div className="mt-4 text-right text-lg font-bold text-primary">
                            Total Counts:{" "}
                            {history
                                .reduce(
                                    (sum, item) => sum + Number(item.count),
                                    0
                                )
                                .toString()
                                .padStart(2, "0")}
                        </div>
                    </>
                )}
            </div>

            {/* Delete confirmation modal */}
            {/* Clear History confirmation modal */}
            {showClearHistoryConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg text-error">
                                Clear History
                            </h3>
                            <p className="py-4">
                                Are you sure you want to clear all Durood
                                history?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-error"
                                    onClick={() => {
                                        setHistory([]);
                                        localStorage.removeItem(
                                            "duroodHistory"
                                        );
                                        setShowClearHistoryConfirm(false);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() =>
                                        setShowClearHistoryConfirm(false)
                                    }
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {deleteIndex !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 ">
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

