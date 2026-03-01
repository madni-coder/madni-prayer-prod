"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { FaBitcoin, FaMosque } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import { useRouter } from "next/navigation";
import apiClient from "../../../lib/apiClient";
import { useTasbihUserContext } from "../../../context/TasbihUserContext";
import { useRewardContext } from "../../../context/RewardContext";

const ToastContext = React.createContext(null);

function ToastProvider({ children }) {
    const showToast = (message, type = "success") => {
        if (type === "error") {
            toast.error(message);
        } else {
            toast.success(message);
        }
    };
    return (
        <ToastContext.Provider value={showToast}>
            {children}
        </ToastContext.Provider>
    );
}
// Theme-based Yes/No confirmation modal
function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-md mx-auto">
                <h2 className="text-base sm:text-lg font-bold mb-2 text-gray-900 dark:text-white">
                    {title}
                </h2>
                <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">{message}</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-end">
                    <button
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={onCancel}
                    >
                        No
                    </button>
                    <button
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-[#5fb923] text-white font-semibold hover:bg-green-700 transition-colors"
                        onClick={onConfirm}
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DuroodSharifPage() {
    // Date change handlers for calendar inputs
    const handleFromDateChange = (e) => {
        setFromDate(e.target.value);
        if (toDate && e.target.value > toDate) {
            setError("'To' date cannot be before 'From' date.");
        } else {
            setError("");
        }
    };

    const handleToDateChange = (e) => {
        setToDate(e.target.value);
        if (fromDate && e.target.value < fromDate) {
            setError("'To' date cannot be before 'From' date.");
        } else {
            setError("");
        }
    };
    const router = useRouter();
    const { users, fetchAll: fetchTasbihUsers } = useTasbihUserContext();
    const { create: createReward } = useRewardContext();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState(null);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [clearingRewards, setClearingRewards] = useState(false);
    const [showClearPrevConfirm, setShowClearPrevConfirm] = useState(false);
    const [rewardsDeleted, setRewardsDeleted] = useState(false);
    const showToast = React.useContext(ToastContext);
    const [clearingWeek, setClearingWeek] = useState(false);
    const [showClearWeekConfirm, setShowClearWeekConfirm] = useState(false);
    const [copiedMobile, setCopiedMobile] = useState(null);

    // Date range states
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [error, setError] = useState("");
    // refs for native date inputs so we can trigger picker programmatically
    const fromDateRef = React.useRef(null);
    const toDateRef = React.useRef(null);

    const openDatePicker = (ref) => {
        if (!ref || !ref.current) return;
        // Modern browsers (Chrome/Edge/Opera) support showPicker()
        try {
            if (typeof ref.current.showPicker === "function") {
                ref.current.showPicker();
                return;
            }
        } catch (e) {
            // ignore and fallback
        }
        // Fallback: focus and attempt click
        ref.current.focus();
        if (typeof ref.current.click === "function") ref.current.click();
    };

    useEffect(() => {
        // Check authentication on client side
        const isAuthenticated =
            localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        fetchTasbihUsers();
    }, [fetchTasbihUsers]);

    // Sort users by weekly counts (durood counts for this week) in descending order and assign TOP rank
    const sortedUsers = [...users].sort((a, b) => {
        const aCount = Number(a["weekly counts"] || 0);
        const bCount = Number(b["weekly counts"] || 0);
        return bCount - aCount;
    });

    // Assign TOP rank to top 10 users and a serial number to every user
    const usersWithRank = sortedUsers.map((user, idx) => {
        return {
            ...user,
            TOP: idx < 10 ? idx + 1 : "",
            SERIAL: idx + 1,
        };
    });

    const filtered = usersWithRank.filter(
        (row) =>
            (row["Full Name"] || '').toLowerCase().includes(search.toLowerCase()) ||
            (row["Address"] || '').toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const PAGE_SIZE = 12;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    // Keep current page in range when filtered changes
    useEffect(() => {
        setCurrentPage((p) => Math.min(p, totalPages));
    }, [totalPages]);

    useEffect(() => {
        // whenever search changes, go back to page 1 for UX
        setCurrentPage(1);
    }, [search]);

    const paginated = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <>
            <ToastProvider>
                <div className="bg-white rounded-xl shadow p-0 mt-8">
                    {/* ...existing code... */}
                </div>
                <div className="p-4 flex flex-col md:flex-row gap-3 md:gap-4 md:items-center md:justify-between">
                    <div className="w-full md:flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or address"
                            className="input input-bordered bg-white w-full md:max-w-xs text-black"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 md:ml-auto relative w-full md:w-auto">
                        <button
                            onClick={() => setShowPublishConfirm(true)}
                            className="bg-purple-500 hover:bg-green-600 text-white font-semibold py-2.5 md:py-2 px-4 rounded-md text-sm md:text-base whitespace-nowrap"
                            disabled={isPublishing || filtered.length === 0}
                            title={"Publish top 10 results to rewards API"}
                        >
                            {isPublishing ? "Publishing..." : "Publish Results"}
                        </button>
                        <button
                            onClick={() => setShowClearWeekConfirm(true)}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 md:py-2 px-4 rounded-md text-sm md:text-base whitespace-nowrap"
                            disabled={clearingWeek || filtered.length === 0}
                            title="Set 'This Week Counts' to 0 for all users"
                        >
                            {clearingWeek ? "Clearing..." : "Clear This Week Counts"}
                        </button>
                        {showClearWeekConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
                                <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:gap-4 w-full max-w-[95vw] sm:max-w-md mx-auto">
                                    <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-gray-900">
                                        Clear This Week Counts
                                    </h2>
                                    <div className="text-xs sm:text-sm text-gray-700">This will set the "This Week Counts" column to 0 for all users. It will NOT add these numbers to lifetime counts.</div>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-2 sm:mt-4">
                                        <button
                                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition-colors"
                                            onClick={() => setShowClearWeekConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-[#5fb923] text-white font-semibold hover:bg-green-700 transition-colors"
                                            onClick={async () => {
                                                setShowClearWeekConfirm(false);
                                                setClearingWeek(true);
                                                try {
                                                    const { data: jsonUsers } = await apiClient.get("/api/api-tasbihUsers");
                                                    if (!jsonUsers?.ok || !Array.isArray(jsonUsers.data)) throw new Error("Failed to fetch users");
                                                    let userErrorCount = 0;
                                                    for (const user of jsonUsers.data) {
                                                        const mobileNumber = user["mobile number"];
                                                        const weeklyCounts = Number(user["weekly counts"] || 0);
                                                        if (!mobileNumber || weeklyCounts === 0) continue;
                                                        try {
                                                            // call API to reset weekly counts only (do NOT add to lifetime)
                                                            await apiClient.delete('/api/api-tasbihUsers', {
                                                                data: {
                                                                    mobileNumber,
                                                                    addWeeklyToCount: false,
                                                                },
                                                            });
                                                        } catch (e) {
                                                            userErrorCount++;
                                                        }
                                                    }
                                                    if (userErrorCount === 0) {
                                                        showToast("This week counts cleared for all users.", "success");
                                                    } else {
                                                        showToast(`${userErrorCount} users failed to update.`, "error");
                                                    }
                                                    // refresh local data
                                                    try { await fetchTasbihUsers(); } catch (e) { /* ignore */ }
                                                } catch (e) {
                                                    showToast(e.message || String(e), "error");
                                                } finally {
                                                    setClearingWeek(false);
                                                }
                                            }}
                                        >
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Modal for publish with date fields */}
                        {showPublishConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
                                <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-5 md:p-6 border border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:gap-4 w-full max-w-[95vw] sm:max-w-md lg:max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
                                    <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-gray-900">
                                        Publish Top 10 Results - Enter Week
                                        Dates Correctly
                                    </h2>
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                                        <div className="flex-1 flex flex-col gap-1">
                                            <label className="font-semibold text-black text-xs sm:text-sm">
                                                From Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    ref={fromDateRef}
                                                    value={fromDate}
                                                    onChange={
                                                        handleFromDateChange
                                                    }
                                                    className="text-black border border-gray-300 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10 text-sm"
                                                    max={toDate || undefined}
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Open from date picker"
                                                    onClick={() =>
                                                        openDatePicker(
                                                            fromDateRef
                                                        )
                                                    }
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="feather feather-calendar"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="4"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                            ry="2"
                                                        ></rect>
                                                        <line
                                                            x1="16"
                                                            y1="2"
                                                            x2="16"
                                                            y2="6"
                                                        ></line>
                                                        <line
                                                            x1="8"
                                                            y1="2"
                                                            x2="8"
                                                            y2="6"
                                                        ></line>
                                                        <line
                                                            x1="3"
                                                            y1="10"
                                                            x2="21"
                                                            y2="10"
                                                        ></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <label className="font-semibold text-black text-xs sm:text-sm">
                                                To Date
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    ref={toDateRef}
                                                    value={toDate}
                                                    onChange={
                                                        handleToDateChange
                                                    }
                                                    className="text-black border border-gray-300 rounded px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10 text-sm"
                                                    min={fromDate || undefined}
                                                />
                                                <button
                                                    type="button"
                                                    aria-label="Open to date picker"
                                                    onClick={() =>
                                                        openDatePicker(
                                                            toDateRef
                                                        )
                                                    }
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="feather feather-calendar"
                                                    >
                                                        <rect
                                                            x="3"
                                                            y="4"
                                                            width="18"
                                                            height="18"
                                                            rx="2"
                                                            ry="2"
                                                        ></rect>
                                                        <line
                                                            x1="16"
                                                            y1="2"
                                                            x2="16"
                                                            y2="6"
                                                        ></line>
                                                        <line
                                                            x1="8"
                                                            y1="2"
                                                            x2="8"
                                                            y2="6"
                                                        ></line>
                                                        <line
                                                            x1="3"
                                                            y1="10"
                                                            x2="21"
                                                            y2="10"
                                                        ></line>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="text-red-500 font-semibold text-xs sm:text-sm">
                                            {error}
                                        </div>
                                    )}
                                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-2 sm:mt-4">
                                        <button
                                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors text-sm order-3 sm:order-1"
                                            onClick={() =>
                                                setShowPublishConfirm(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm order-1 sm:order-2"
                                            onClick={() => setShowClearPrevConfirm(true)}
                                            disabled={clearingRewards}
                                            title="Delete previous rewards from server"
                                        >
                                            {clearingRewards ? "Clearing..." : "Clear Previous Week Results"}
                                        </button>
                                        <button
                                            className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded font-semibold transition-colors text-sm order-2 sm:order-3 ${isPublishing || clearingRewards || !rewardsDeleted ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#5fb923] text-white hover:bg-green-700'}`}
                                            disabled={isPublishing || clearingRewards || !rewardsDeleted}
                                            onClick={async () => {
                                                // Validate dates explicitly
                                                if (!fromDate || !toDate) {
                                                    setError("Please select date");
                                                    return;
                                                }
                                                setShowPublishConfirm(false);
                                                setIsPublishing(true);
                                                setPublishStatus(null);
                                                try {
                                                    const topTen = usersWithRank
                                                        .filter((u) => u.TOP)
                                                        .slice(0, 10);
                                                    if (!topTen.length) {
                                                        setPublishStatus({
                                                            ok: 0,
                                                            fail: 0,
                                                            error: "No top entries to publish",
                                                        });
                                                        setIsPublishing(false);
                                                        return;
                                                    }
                                                    const payloadItems =
                                                        topTen.map(
                                                            (row, i) => ({
                                                                position:
                                                                    row.TOP !==
                                                                        "" &&
                                                                        row.TOP !==
                                                                        undefined
                                                                        ? Number(
                                                                            row.TOP
                                                                        )
                                                                        : i + 1,
                                                                fullName:
                                                                    row[
                                                                    "Full Name"
                                                                    ] || "",
                                                                address:
                                                                    row[
                                                                    "Address"
                                                                    ] || "",
                                                                areaMasjid:
                                                                    row[
                                                                    "areaMasjid"
                                                                    ] ||
                                                                    row[
                                                                    "Address"
                                                                    ] ||
                                                                    "",
                                                                counts: Number(
                                                                    row[
                                                                    "Tasbih Counts"
                                                                    ] || 0
                                                                ),
                                                                weeklyCounts:
                                                                    Number(
                                                                        row[
                                                                        "weekly counts"
                                                                        ] || 0
                                                                    ),
                                                                from: fromDate,
                                                                to: toDate,
                                                            })
                                                        );
                                                    const { data: result } =
                                                        await createReward({
                                                            items: payloadItems,
                                                        });
                                                    setPublishStatus({
                                                        ok:
                                                            result?.inserted ||
                                                            (result?.success
                                                                ? payloadItems.length
                                                                : 0),
                                                        fail: 0,
                                                    });
                                                } catch (e) {
                                                    setPublishStatus({
                                                        ok: 0,
                                                        fail: 1,
                                                        error: e.message,
                                                    });
                                                } finally {
                                                    setIsPublishing(false);
                                                }
                                            }}
                                        >
                                            Publish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {showClearPrevConfirm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
                                <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700 flex flex-col gap-3 sm:gap-4 w-full max-w-[95vw] sm:max-w-md mx-auto">
                                    <h2 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 text-gray-900">Clear Previous Week Results</h2>
                                    <div className="text-xs sm:text-sm text-gray-700">This will delete all previous published rewards from the server (the rewards API). The publish button will be disabled while this operation runs.</div>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-2 sm:mt-4">
                                        <button
                                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300 transition-colors"
                                            onClick={() => setShowClearPrevConfirm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                                            onClick={async () => {
                                                setShowClearPrevConfirm(false);
                                                setClearingRewards(true);
                                                try {
                                                    await apiClient.delete('/api/api-rewards');
                                                    setRewardsDeleted(true);
                                                    showToast('Previous rewards cleared successfully', 'success');
                                                } catch (e) {
                                                    showToast(e?.message || String(e), 'error');
                                                } finally {
                                                    setClearingRewards(false);
                                                }
                                            }}
                                        >
                                            {clearingRewards ? 'Clearing...' : 'Confirm'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Mobile: stacked cards */}
                <div className="md:hidden space-y-4">
                    {paginated.map((row, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-lg shadow-sm p-4 border last:border-b-0"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                                        <FaBitcoin className="text-xl text-amber-700" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800">
                                            {row.SERIAL}. {row["Full Name"] || 'Not Provided'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {row.Email || row.email || 'Not Provided'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-sm font-medium text-gray-700">
                                    <div className="text-orange-800 font-bold">{row["weekly counts"] || '00'}</div>
                                    <div className="text-gray-600 text-xs">Weekly</div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-col gap-2">
                                <div className="text-sm text-gray-700">{row["Address"] || 'Not Provided'}</div>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm text-gray-800 truncate">
                                        {row["mobile number"] || 'Not Provided'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {row["mobile number"] ? (
                                            <>
                                                <button
                                                    onClick={async () => {
                                                        const textToCopy = String(row["mobile number"] || "");
                                                        try {
                                                            if (navigator?.clipboard?.writeText) {
                                                                await navigator.clipboard.writeText(textToCopy);
                                                            } else {
                                                                const ta = document.createElement('textarea');
                                                                ta.value = textToCopy;
                                                                document.body.appendChild(ta);
                                                                ta.select();
                                                                document.execCommand('copy');
                                                                document.body.removeChild(ta);
                                                            }
                                                            setCopiedMobile(textToCopy);
                                                            setTimeout(() => setCopiedMobile(null), 2000);
                                                            showToast("Mobile copied to clipboard", "success");
                                                        } catch (e) {
                                                            showToast("Failed to copy mobile", "error");
                                                        }
                                                    }}
                                                    className="p-1 rounded hover:bg-gray-100"
                                                    title="Copy mobile number"
                                                >
                                                    <FiCopy />
                                                </button>
                                                {copiedMobile === String(row["mobile number"]) && (
                                                    <span className="text-sm text-green-600 font-semibold">Copied</span>
                                                )}
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                                    <div>Life Time: <span className="text-gray-800 font-semibold">{row["Tasbih Counts"] || 'NA'}</span></div>
                                    <div className="hidden" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop/table view (md and up) - unchanged layout */}
                <table className="hidden md:table w-full">
                    <thead>
                        <tr className="bg-[#5fb923] rounded-t-xl">
                            <th className="font-semibold text-base text-white text-left rounded-tl-xl">
                                TOP
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Name
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Email
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Colony Address
                            </th>
                            <th className="font-semibold text-base text-white text-left w-56">
                                Mobile
                            </th>
                            <th className="font-semibold text-base text-white text-right">
                                This Week Counts
                            </th>
                            <th className="font-semibold text-base text-white text-left rounded-tr-xl">
                                Life Time Counts
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.map((row, idx) => (
                            <tr
                                key={idx}
                                className="border-b last:border-b-0 hover:bg-gray-50"
                            >
                                <td className="py-4 text-gray-800 text-left font-bold">
                                    {row.SERIAL}
                                </td>
                                <td className="flex items-center gap-3 py-4 text-gray-800 text-left">
                                    <span className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                                        <FaBitcoin className="text-2xl text-amber-700" />
                                    </span>
                                    <span className="font-medium">
                                        {row["Full Name"] || 'Not Provided'}
                                    </span>
                                </td>
                                <td className="py-4 text-gray-800 text-left">
                                    {row.Email || row.email || 'Not Provided'}
                                </td>
                                <td className="py-4 text-gray-800 text-left">
                                    {row["Address"] || 'Not Provided'}
                                </td>
                                <td className="py-4 text-gray-800 text-left flex items-center gap-2 whitespace-nowrap">
                                    <span className="truncate">{row["mobile number"] || 'Not Provided'}</span>
                                    {row["mobile number"] ? (
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    const textToCopy = String(row["mobile number"] || "");
                                                    try {
                                                        if (navigator?.clipboard?.writeText) {
                                                            await navigator.clipboard.writeText(textToCopy);
                                                        } else {
                                                            const ta = document.createElement('textarea');
                                                            ta.value = textToCopy;
                                                            document.body.appendChild(ta);
                                                            ta.select();
                                                            document.execCommand('copy');
                                                            document.body.removeChild(ta);
                                                        }
                                                        setCopiedMobile(textToCopy);
                                                        setTimeout(() => setCopiedMobile(null), 2000);
                                                        showToast("Mobile copied to clipboard", "success");
                                                    } catch (e) {
                                                        showToast("Failed to copy mobile", "error");
                                                    }
                                                }}
                                                className="p-1 rounded hover:bg-gray-100"
                                                title="Copy mobile number"
                                            >
                                                <FiCopy />
                                            </button>
                                            {copiedMobile === String(row["mobile number"]) && (
                                                <span className="text-sm text-green-600 font-semibold">Copied</span>
                                            )}
                                        </div>
                                    ) : null}
                                </td>
                                <td className="py-4 text-orange-800 font-bold text-right">
                                    {row["weekly counts"] || "00"}
                                </td>
                                <td className="py-4 text-gray-800 text-right">
                                    {row["Tasbih Counts"] || "NA"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination controls */}
                <div className="p-4 flex items-center justify-center">
                    <nav
                        className="inline-flex items-center space-x-2"
                        aria-label="Pagination"
                    >
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700`}
                        >
                            Prev
                        </button>

                        {/* Simple page number window: show up to 7 numbers around current page */}
                        {(() => {
                            const pages = [];
                            const windowSize = 7;
                            let start = Math.max(
                                1,
                                currentPage - Math.floor(windowSize / 2)
                            );
                            let end = start + windowSize - 1;
                            if (end > totalPages) {
                                end = totalPages;
                                start = Math.max(1, end - windowSize + 1);
                            }
                            for (let p = start; p <= end; p++) {
                                pages.push(
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        aria-current={
                                            p === currentPage
                                                ? "page"
                                                : undefined
                                        }
                                        className={`px-3 py-1 rounded-md border transition-colors ${p === currentPage
                                            ? "bg-[#5fb923] text-white border-[#5fb923]"
                                            : "bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            // if start > 1, show leading first and ellipsis
                            if (start > 1) {
                                pages.unshift(
                                    <React.Fragment key="lead">
                                        <button
                                            onClick={() =>
                                                setCurrentPage(1)
                                            }
                                            className="px-3 py-1 rounded-md border bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                                        >
                                            1
                                        </button>
                                        <span className="px-2">...</span>
                                    </React.Fragment>
                                );
                            }
                            if (end < totalPages) {
                                pages.push(
                                    <React.Fragment key="trail">
                                        <span className="px-2">...</span>
                                        <button
                                            onClick={() =>
                                                setCurrentPage(totalPages)
                                            }
                                            className="px-3 py-1 rounded-md border bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                                        >
                                            {totalPages}
                                        </button>
                                    </React.Fragment>
                                );
                            }

                            return pages;
                        })()}

                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md border transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700`}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </ToastProvider>
        </>
    );
}
