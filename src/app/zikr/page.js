"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";

const ZIKR_OPTIONS = [
    "Surah Yaseen",
    "Surah Ikhlas",
    "Astagfaar",
    "Subhan Allah",
    "Surah Rehman",
    "Surah Mulk",
];

export default function Page() {
    const router = useRouter();
    const [theme, setTheme] = useState("system");
    const [selected, setSelected] = useState("");
    const [count, setCount] = useState("");
    const [toast, setToast] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("zikrHistory");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 6;
    const totalPages = Math.ceil(history.length / entriesPerPage);
    const paginatedHistory = history.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );
    // Clear history confirmation modal
    const [showClearHistoryConfirm, setShowClearHistoryConfirm] =
        useState(false);

    useEffect(() => {
        const saved = typeof window !== "undefined" && localStorage.getItem("theme");
        if (saved) setTheme(saved);
        applyTheme(saved || "system");

        if (typeof window !== "undefined" && window.matchMedia) {
            const mq = window.matchMedia("(prefers-color-scheme: dark)");
            const onChange = () => applyTheme(localStorage.getItem("theme") || "system");
            if (mq.addEventListener) mq.addEventListener("change", onChange);
            return () => mq.removeEventListener && mq.removeEventListener("change", onChange);
        }
    }, []);

    // Sync history to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("zikrHistory", JSON.stringify(history));
        }
    }, [history]);

    function applyTheme(t) {
        const root = document.documentElement;
        if (!root) return;
        if (t === "system") {
            root.removeAttribute("data-theme");
            localStorage.removeItem("theme");
        } else {
            root.setAttribute("data-theme", t === "dark" ? "night" : "light");
            localStorage.setItem("theme", t);
        }
        setTheme(t);
    }

    function effectiveTheme() {
        if (theme && theme !== "system") return theme;
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return "light";
    }

    function handleSubmit(e) {
        e?.preventDefault();
        setToast(null);
        if (isSubmitting) return;
        const num = Number(count);
        if (!selected) {
            showToast({ type: "error", text: "Please select a Zikr option." });
            return;
        }
        if (!count || Number.isNaN(num) || num <= 0 || !Number.isInteger(num)) {
            showToast({ type: "error", text: "Please enter a valid positive whole number for how many times." });
            return;
        }

        // Check if user is logged in
        const userData = localStorage.getItem('userData');

        if (userData) {
            // User exists, call zikr API directly
            submitZikrForAuthenticatedUser();
        } else {
            // User not logged in, redirect to profile page
            router.push('/myProfile');
        }
    }

    function showToast(t) {
        setToast(t);
        if (!t) return;
        setTimeout(() => setToast(null), 2000);
    }

    async function submitZikrForAuthenticatedUser() {
        try {
            setIsSubmitting(true);
            const userData = JSON.parse(localStorage.getItem("userData"));

            const { data } = await apiClient.post("/api/api-zikr", {
                gender: userData.gender,
                fullName: userData.fullName,
                address: userData.address,
                areaMasjid: userData.areaMasjid,
                mobile: userData.mobile || userData.email,
                zikrType: selected,
                zikrCounts: Number(count),
            });

            if (data && !data.error) {
                const newEntry = {
                    zikr: selected,
                    count: Number(count),
                    weeklyCounts: Number(count),
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                };
                setHistory((prev) => [newEntry, ...prev]);
                setSelected("");
                setCount("");

                showToast({
                    type: "success",
                    text: "Zikr submitted successfully!",
                });
            } else {
                showToast({
                    type: "error",
                    text: data?.error || "Failed to submit. Please try again.",
                });
            }
        } catch (error) {
            console.error("Error submitting zikr:", error);
            showToast({
                type: "error",
                text: "Failed to submit. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }



    return (
        <div
            className="min-h-screen py-8"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)' }}
        >
            <div className="max-w-3xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-9">
                    <div>
                        <button
                            className="btn btn-ghost gap-2 text-primary"
                            onClick={() => router.push("/")}
                            aria-label="Back to Home"
                            style={{ alignSelf: "flex-start" }}
                        >
                            <FaAngleLeft /> Back
                        </button>
                        <h1 className="text-2xl sm:text-3xl  font-semibold bg-linear-to-r from-green-400 via-green-200 to-white bg-clip-text text-transparent">
                            Aaj Aapne Kya Padha
                        </h1>
                        <img
                            src="/zikrImg.jpg"
                            alt="Zikr"
                            className={`mt-4 w-full max-w-full h-auto rounded-lg object-cover sm:h-40 transition-shadow duration-300 ${effectiveTheme() === "dark"
                                ? "border-4 border-green-400/60 shadow-lg"
                                : "border-2 border-green-400/30 shadow-sm"
                                }`}
                        />
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-base-200 p-6 rounded-xl shadow-sm relative z-10"
                    aria-label="Zikr registration form"
                >

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-1 sm:col-span-2">
                            <label className="label">
                                <span className="label-text  mb-2 font-bold text-white">Zikr</span>
                            </label>
                            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="select select-bordered w-full" aria-label="Select Zikr">
                                <option value="">Select</option>
                                {ZIKR_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text mb-2 font-bold text-white">How many times</span>
                            </label>
                            <input
                                inputMode="numeric"
                                pattern="[0-9]*"
                                type="number"
                                min="1"
                                value={count}
                                onChange={(e) => setCount(e.target.value.replace(/[^0-9]/g, ""))}
                                className="input input-bordered w-full"
                                placeholder="Enter number"
                                aria-label="How many times"
                            />
                        </div>

                        <div className="flex items-end justify-end">
                            <button
                                className="btn btn-primary w-full sm:w-auto"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Submitting
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
                <Toast toast={toast} isDark={typeof window !== "undefined" ? effectiveTheme() === "dark" : false} />

                {/* Zikr history list */}
                <div className="mt-6 mb-14 bg-gradient-to-br from-base-200 to-base-300 p-6 rounded-xl shadow-lg border border-primary/20">
                    <h3 className="text-xl font-bold mb-6 text-primary flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <span className="inline-block w-1 h-6 bg-primary rounded-full"></span>
                            Zikr History
                        </span>
                        {history.length > 0 && (
                            <button
                                className="btn btn-ghost btn-sm text-error border-2 border-error hover:bg-error hover:text-white transition-all duration-300 rounded-full"
                                aria-label="Clear History"
                                onClick={() => setShowClearHistoryConfirm(true)}
                            >
                                Clear History
                            </button>
                        )}
                    </h3>
                    {history.length === 0 ? (
                        <div className="text-center text-base text-primary/70 py-8">
                            No history yet. Register your zikr to see it here.
                        </div>
                    ) : (
                        <>
                            {/* Total Counts Display */}
                            <div className="mb-6 flex justify-center">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 rounded-2xl blur-xl"></div>
                                    <div className="relative bg-gradient-to-r from-primary/20 to-primary/30 backdrop-blur-sm px-8 py-4 rounded-2xl border-2 border-primary/40 shadow-xl">
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">Total Counts</div>
                                            <div className="text-4xl font-black text-primary">
                                                {history
                                                    .reduce(
                                                        (sum, item) => sum + Number(item.count),
                                                        0
                                                    )
                                                    .toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabular display for all screen sizes */}
                            <div className="w-full bg-base-100/50 rounded-lg overflow-hidden border border-primary/10">
                                <table className="table w-full text-primary">
                                    <thead>
                                        <tr className="bg-primary/10 border-b-2 border-primary/30">
                                            <th className="px-3 py-4 text-primary font-bold">Zikr Name</th>
                                            <th className="px-3 py-4 text-primary font-bold text-center">Counts</th>
                                            <th className="px-3 py-4 text-primary font-bold">Date & Time</th>
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
                                                className="hover:bg-primary/5 transition-colors duration-200 border-b border-primary/5"
                                            >
                                                <td className="align-middle px-3 py-3 font-medium">
                                                    {item.zikr}
                                                </td>
                                                <td className="align-middle px-3 py-3 text-center">
                                                    <span className="inline-block bg-primary/20 text-white font-bold px-3 py-1 rounded-full ">
                                                        {item.count
                                                            .toString()
                                                            .padStart(2, "0")}
                                                    </span>
                                                </td>
                                                <td className="align-middle px-3 py-3 text-sm opacity-90">
                                                    {item.date} {new Date(
                                                        `1970-01-01T${item.time}`
                                                    ).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination controls */}
                            {history.length > entriesPerPage && (
                                <div className="flex justify-center items-center gap-3 mt-6">
                                    <button
                                        className="btn btn-sm btn-primary btn-outline hover:scale-105 transition-transform"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage(currentPage - 1)
                                        }
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 font-semibold bg-primary/10 rounded-full text-primary">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-primary btn-outline hover:scale-105 transition-transform"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage(currentPage + 1)
                                        }
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Clear History confirmation modal */}
            {showClearHistoryConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg text-error">
                                Clear History
                            </h3>
                            <p className="py-4">
                                Are you sure you want to clear all Zikr history?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-error"
                                    onClick={() => {
                                        setHistory([]);
                                        localStorage.removeItem("zikrHistory");
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


        </div>
    );
}

function Toast({ toast, isDark }) {
    if (!toast) return null;
    if (typeof document === "undefined") return null;

    const content = (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none w-full max-w-md px-4"
            style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
            <div
                role="status"
                aria-live="polite"
                className={`w-full px-6 py-4 rounded-2xl shadow-lg pointer-events-auto transition-all duration-300 ease-out font-medium text-base ${toast.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                    }`}
            >
                {toast.text}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
