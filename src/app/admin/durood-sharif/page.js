"use client";
const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
    const [toast, setToast] = useState(null);
    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2500);
    };
    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {toast && (
                <div
                    className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white font-semibold transition-all ${
                        toast.type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}
                >
                    {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
}
import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { FaBitcoin, FaMosque } from "react-icons/fa";
import { useRouter } from "next/navigation";
import fetchFromApi from "../../../utils/fetchFromApi";

function ClearWinnerListButton() {
    const [loading, setLoading] = useState(false);
    const showToast = React.useContext(ToastContext);

    const handleClear = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/api-rewards", { method: "DELETE" });
            const txt = await res.text();
            if (!res.ok) throw new Error(txt || res.statusText);
            let result;
            try {
                result = JSON.parse(txt);
            } catch (e) {
                result = { message: txt };
            }
            showToast(result.message || "Winner list cleared.", "success");
        } catch (e) {
            showToast(e.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inline-block">
            <button
                onClick={handleClear}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md"
                disabled={loading}
                title="Clear winner list (delete all rewards)"
            >
                {loading ? "Clearing..." : "Clear Winners List"}
            </button>
        </div>
    );
}

export default function DuroodSharifPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState(null);
    const showToast = React.useContext(ToastContext);

    useEffect(() => {
        // Check authentication on client side
        const checkAuth = () => {
            const isAuthenticated =
                localStorage.getItem("isAuthenticated") === "true";
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetchFromApi("/api/api-tasbihUsers");
                const json = await res.json();
                if (json.ok) setUsers(json.data);
            } catch (e) {
                setUsers([]);
            }
        }
        fetchUsers();
    }, []);

    // Sort users by weekly counts (durood counts for this week) in descending order and assign TOP rank
    const sortedUsers = [...users].sort((a, b) => {
        const aCount = Number(a["weekly counts"] || 0);
        const bCount = Number(b["weekly counts"] || 0);
        return bCount - aCount;
    });

    // Assign TOP rank to top 10 users
    const usersWithRank = sortedUsers.map((user, idx) => {
        return {
            ...user,
            TOP: idx < 10 ? idx + 1 : "",
        };
    });

    // Filter after ranking
    const filtered = usersWithRank.filter(
        (row) =>
            row["Full Name"].toLowerCase().includes(search.toLowerCase()) ||
            row["Address"].toLowerCase().includes(search.toLowerCase()) ||
            row["mobile number"].toLowerCase().includes(search.toLowerCase())
    );

    // Pagination
    const PAGE_SIZE = 15;
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
        <ToastProvider>
            <div className="bg-white rounded-xl shadow p-0 mt-8">
                <div className="p-4 flex items-start justify-between gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search by name, address or mobile number"
                            className="input input-bordered bg-white w-full max-w-xs text-black"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Theme-based publish and clear winner list buttons at top-right */}
                    <div className="ml-auto flex gap-2">
                        <button
                            onClick={async () => {
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
                                    const payloadItems = topTen.map(
                                        (row, i) => ({
                                            position:
                                                row.TOP !== "" &&
                                                row.TOP !== undefined
                                                    ? Number(row.TOP)
                                                    : i + 1,
                                            fullName: row["Full Name"] || "",
                                            address: row["Address"] || "",
                                            areaMasjid:
                                                row["areaMasjid"] ||
                                                row["Address"] ||
                                                "",
                                            counts: Number(
                                                row["Tasbih Counts"] || 0
                                            ),
                                            weeklyCounts: Number(
                                                row["weekly counts"] || 0
                                            ),
                                        })
                                    );
                                    const res = await fetch(
                                        "/api/api-rewards",
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json",
                                            },
                                            body: JSON.stringify({
                                                items: payloadItems,
                                            }),
                                        }
                                    );
                                    const txt = await res.text();
                                    if (!res.ok)
                                        throw new Error(txt || res.statusText);
                                    let result;
                                    try {
                                        result = JSON.parse(txt);
                                    } catch (e) {
                                        result = { message: txt };
                                    }
                                    setPublishStatus({
                                        ok:
                                            result.inserted ||
                                            (result.success
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
                            className="bg-purple-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
                            disabled={isPublishing || filtered.length === 0}
                            title="Publish top 10 results to rewards API"
                        >
                            {isPublishing ? "Publishing..." : "Publish Results"}
                        </button>
                        <ClearWinnerListButton />
                    </div>
                </div>
                <table className="table w-full">
                    <thead>
                        <tr className="bg-[#5fb923] rounded-t-xl">
                            <th className="font-semibold text-base text-white text-left rounded-tl-xl">
                                TOP
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Name
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Colony Address
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Mobile Number
                            </th>
                            <th className="font-semibold text-base text-white text-left flex items-center gap-2">
                                <span>This Week Counts</span>
                                <button
                                    title="Erase all weekly counts"
                                    className="ml-2 text-white hover:text-red-700"
                                    onClick={async () => {
                                        if (
                                            !window.confirm(
                                                "Are you sure you want to erase ALL weekly counts for all users?"
                                            )
                                        )
                                            return;
                                        try {
                                            // Call DELETE API for each user
                                            let errorCount = 0;
                                            for (const user of users) {
                                                const res = await fetch(
                                                    "/api/api-tasbihUsers",
                                                    {
                                                        method: "DELETE",
                                                        headers: {
                                                            "Content-Type":
                                                                "application/json",
                                                        },
                                                        body: JSON.stringify({
                                                            "mobile number":
                                                                user[
                                                                    "mobile number"
                                                                ],
                                                        }),
                                                    }
                                                );
                                                const json = await res.json();
                                                if (!json.ok) errorCount++;
                                            }
                                            setUsers((prev) =>
                                                prev.map((u) => ({
                                                    ...u,
                                                    "weekly counts": 0,
                                                }))
                                            );
                                            showToast(
                                                errorCount === 0
                                                    ? "All weekly counts erased."
                                                    : `Some users failed to erase (${errorCount})`,
                                                errorCount === 0
                                                    ? "success"
                                                    : "error"
                                            );
                                        } catch (e) {
                                            showToast(e.message, "error");
                                        }
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </th>
                            <th className="font-semibold text-base text-white text-left">
                                Life Time Counts
                            </th>

                            <th className="font-semibold text-base text-white text-left rounded-tr-xl">
                                Date
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
                                    {row.TOP}
                                </td>
                                <td className="flex items-center gap-3 py-4 text-gray-800 text-left">
                                    <span className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                                        <FaBitcoin className="text-2xl text-amber-700" />
                                    </span>
                                    <span className="font-medium">
                                        {row["Full Name"]}
                                    </span>
                                </td>
                                <td className="py-4 text-gray-800 text-left">
                                    {row["Address"]}
                                </td>
                                <td className="py-4 text-gray-800 text-left">
                                    {row["mobile number"]}
                                </td>
                                <td className="py-4 text-gray-800 text-left flex items-center gap-2">
                                    {row["weekly counts"] || "00"}
                                </td>
                                <td className="py-4 text-gray-800 text-left">
                                    {row["Tasbih Counts"] || "NA"}
                                </td>
                                <td className="py-4 text-gray-800 text-left">
                                    {row["date"] ||
                                        new Date().toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination controls - show only when more than one page */}
                {filtered.length > PAGE_SIZE && (
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
                                            className={`px-3 py-1 rounded-md border transition-colors ${
                                                p === currentPage
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
                )}
            </div>
        </ToastProvider>
    );
}
