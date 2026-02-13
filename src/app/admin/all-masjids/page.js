"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, X, Pencil, Copy, Check } from "lucide-react";
import apiClient from "../../../lib/apiClient";
import { useRouter } from "next/navigation";

export default function Page() {
    const router = useRouter();

    // All state hooks at the top level - called unconditionally
    const [loading, setLoading] = useState(true);
    const [masjids, setMasjids] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [colonySearch, setColonySearch] = useState(""); // new state for colony search
    const [showRaipur, setShowRaipur] = useState(false);
    const [reloading, setReloading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    // Copy state and handler for mobile numbers (hooks must be top-level)
    const [copiedId, setCopiedId] = useState(null);
    // Pagination state: theme-friendly UI at bottom after 15 entries
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 15;

    const handleCopy = async (mobile, id) => {
        if (!mobile) return;
        try {
            await navigator.clipboard.writeText(String(mobile));
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (e) {
            console.error("Failed to copy mobile number:", e);
        }
    };

    const fetchMasjids = useCallback(async () => {
        try {
            setError(null);
            setReloading(true);
            const { data } = await apiClient.get("/api/all-masjids");
            setMasjids(data?.data || []);
        } catch (e) {
            setError(e?.response?.data?.error || e.message);
        } finally {
            setLoading(false);
            setReloading(false);
        }
    }, []);

    // Authentication check effect
    useEffect(() => {
        const checkAuth = () => {
            const authenticated =
                typeof window !== "undefined" &&
                localStorage.getItem("isAuthenticated") === "true";

            if (!authenticated) {
                router.push("/login");
            } else {
                setIsAuthenticated(true);
            }
            setAuthLoading(false);
        };

        checkAuth();
    }, [router]);

    // Fetch masjids effect - only run when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchMasjids();
        }
    }, [fetchMasjids, isAuthenticated]);

    // load persisted showRaipur toggle on mount
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("showRaipur");
                if (saved === "true") setShowRaipur(true);
            }
        } catch (e) {
            console.warn("Failed to read showRaipur from localStorage", e);
        }
    }, []);

    // persist showRaipur toggle to localStorage when changed
    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            if (showRaipur) localStorage.setItem("showRaipur", "true");
            else localStorage.removeItem("showRaipur");
        } catch (e) {
            console.warn("Failed to persist showRaipur to localStorage", e);
        }
    }, [showRaipur]);

    // Reset to first page when filters or masjids change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, colonySearch, masjids, showRaipur]);

    // Show loading while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Don't render main content if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    const handleReset = () => {
        setSearchQuery("");
        setColonySearch(""); // reset colony search
    };

    const clearSearch = () => setSearchQuery("");
    const clearColonySearch = () => setColonySearch("");

    // derive visibleMasjids based on Show Raipur toggle
    const visibleMasjids = showRaipur
        ? masjids.filter((m) => (m.city || "").toString().trim().toLowerCase() === "raipur")
        : masjids.filter((m) => {
            const city = (m.city || "").toString().trim().toLowerCase();
            return city === "" || city === "bilaspur";
        });

    const filteredMasjids = visibleMasjids.filter((m) => {
        const matchesSearch = (m.masjidName || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesColonySearch = (m.colony || "")
            .toLowerCase()
            .includes(colonySearch.toLowerCase());
        return matchesSearch && matchesColonySearch;
    });

    const totalPages = Math.max(
        1,
        Math.ceil(filteredMasjids.length / PAGE_SIZE)
    );
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedMasjids = filteredMasjids.slice(startIndex, endIndex);

    // Helper to display 'Not Added' when a value is empty or only whitespace
    const displayOrNotAdded = (val) => {
        if (val === null || val === undefined)
            return <span className="text-red-600">Not Added</span>;
        const s = String(val).trim();
        return s.length === 0 ? (
            <span className="text-red-600">Not Added</span>
        ) : (
            val
        );
    };

    return (
        <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900">All Masjid</h1>
                <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                    <button
                        onClick={fetchMasjids}
                        disabled={reloading}
                        className="flex items-center gap-1 md:gap-2 border text-black font-bold border-black-300 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm hover:bg-gray-100 disabled:opacity-60"
                        title="Refresh list"
                    >
                        <RefreshCw
                            size={14}
                            className={reloading ? "animate-spin" : "md:w-4 md:h-4"}
                        />
                        <span className="hidden sm:inline">{reloading ? "Refreshing" : "Refresh"}</span>
                    </button>
                    <Link href="/admin/all-masjids/add" className="flex-1 md:flex-none">
                        <button className="bg-green-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors w-full md:w-auto">
                            Add Masjid Entry
                        </button>
                    </Link>
                </div>
            </div>
            {loading && (
                <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-gray-600 text-xs md:text-sm rounded">
                    Loading masjids...
                </div>
            )}

            {/* Filters */}
            <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm mb-4 md:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Masjid Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search masjid name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                            Colony Address
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search colony address"
                                value={colonySearch}
                                onChange={(e) =>
                                    setColonySearch(e.target.value)
                                }
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                            />
                            {colonySearch && (
                                <button
                                    onClick={clearColonySearch}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear colony search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center md:items-end gap-2 md:gap-3">
                        <label className="flex items-center gap-2 text-xs md:text-sm text-black font-bold flex-1">
                            <input
                                type="checkbox"
                                className="toggle toggle-md md:toggle-xl bg-error border-error checked:bg-primary checked:border-primary checked:after:bg-primary"
                                checked={showRaipur}
                                onChange={(e) => setShowRaipur(e.target.checked)}
                                aria-label="Show only Raipur masjids"
                            />
                            <span className="select-none">Show Raipur's Masjid</span>
                        </label>
                        <button
                            onClick={handleReset}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            title="Reset all filters"
                        >
                            <RefreshCw size={18} className="text-gray-600 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table - Desktop View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="bg-yellow-600 text-white">
                    <div className="grid grid-cols-10 gap-4 px-6 py-4 font-medium text-sm">
                        <div className="">No.</div>
                        <div className="col-span-2">Masjid Names</div>
                        <div className="col-span-2">Colony Address</div>
                        <div>Role</div>
                        <div>Name</div>
                        <div>Mobile Number</div>
                        <div>Location URL exists</div>
                        <div>Actions</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                    {!loading && filteredMasjids.length === 0 && (
                        <div className="px-6 py-6 text-sm text-gray-500">
                            No masjids found.
                        </div>
                    )}
                    {paginatedMasjids.map((m, idx) => (
                        <div
                            key={m.id}
                            className="grid grid-cols-10 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-center text-sm text-gray-700">
                                {startIndex + idx + 1}
                            </div>
                            <div className="col-span-2 flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-lg">🕌</span>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {m.masjidName}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="text-sm text-gray-900">
                                    {m.colony || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-900">
                                    {displayOrNotAdded(m.role)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-900">
                                    {displayOrNotAdded(m.name)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-900">
                                    {/* Show mobile and a copy button that copies only the mobile number */}
                                    {m.mobile &&
                                        String(m.mobile).trim().length > 0 ? (
                                        <div className="flex items-center">
                                            <span>{m.mobile}</span>
                                            <button
                                                onClick={() =>
                                                    handleCopy(m.mobile, m.id)
                                                }
                                                className="ml-2 p-1 text-gray-500 hover:text-gray-700 rounded-md"
                                                title="Copy mobile number"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            {copiedId === m.id && (
                                                <Check
                                                    size={16}
                                                    className="ml-2 text-green-600"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-red-600">
                                            Not Added
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm">
                                    {m.pasteMapUrl &&
                                        String(m.pasteMapUrl).trim().length > 0 ? (
                                        <span className="text-green-600 font-medium">
                                            YES
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-medium">
                                            NO
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div>
                                <Link
                                    href={`/admin/all-masjids/edit-jamatTime?id=${m.id}`}
                                >
                                    <button
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                        title="Edit Masjid"
                                    >
                                        <Pencil size={22} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Card View - Mobile Only */}
            <div className="md:hidden space-y-3">
                {!loading && filteredMasjids.length === 0 && (
                    <div className="bg-white rounded-lg p-4 text-sm text-gray-500 text-center">
                        No masjids found.
                    </div>
                )}
                {paginatedMasjids.map((m, idx) => (
                    <div
                        key={m.id}
                        className="bg-white rounded-lg shadow-sm p-4 space-y-3"
                    >
                        {/* Header with Number and Actions */}
                        <div className="flex items-start justify-between border-b pb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-700 font-bold text-sm">
                                    {startIndex + idx + 1}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 text-base">
                                        {m.masjidName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {m.colony || "-"}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={`/admin/all-masjids/edit-jamatTime?id=${m.id}`}
                            >
                                <button
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit Masjid"
                                >
                                    <Pencil size={18} />
                                </button>
                            </Link>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-medium">Role:</span>
                                <span className="text-gray-900">
                                    {displayOrNotAdded(m.role)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-medium">Name:</span>
                                <span className="text-gray-900">
                                    {displayOrNotAdded(m.name)}
                                </span>
                            </div>
                            <div className="flex justify-between py-1 items-center">
                                <span className="text-gray-500 font-medium">Mobile:</span>
                                <div className="text-gray-900">
                                    {m.mobile &&
                                        String(m.mobile).trim().length > 0 ? (
                                        <div className="flex items-center gap-2">
                                            <span>{m.mobile}</span>
                                            <button
                                                onClick={() =>
                                                    handleCopy(m.mobile, m.id)
                                                }
                                                className="p-1 text-gray-500 hover:text-gray-700 rounded-md"
                                                title="Copy mobile number"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            {copiedId === m.id && (
                                                <Check
                                                    size={14}
                                                    className="text-green-600"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-red-600">
                                            Not Added
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-gray-500 font-medium">
                                    Location URL:
                                </span>
                                <span>
                                    {m.pasteMapUrl &&
                                        String(m.pasteMapUrl).trim().length > 0 ? (
                                        <span className="text-green-600 font-medium text-xs">
                                            YES
                                        </span>
                                    ) : (
                                        <span className="text-red-600 font-medium text-xs">
                                            NO
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredMasjids.length > PAGE_SIZE && (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Showing{" "}
                        {Math.min(startIndex + 1, filteredMasjids.length)}-
                        {Math.min(endIndex, filteredMasjids.length)} of{" "}
                        {filteredMasjids.length}
                    </div>
                    <nav
                        className="flex items-center space-x-1 md:space-x-2"
                        aria-label="Pagination"
                    >
                        <button
                            onClick={() =>
                                setCurrentPage((p) => Math.max(1, p - 1))
                            }
                            disabled={currentPage === 1}
                            className={`px-2 md:px-3 py-1 rounded-md border text-xs md:text-sm transition-colors disabled:opacity-50 ${"bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"}`}
                        >
                            Prev
                        </button>

                        {/* Page numbers: show a compact set when many pages */}
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                // display a few pages around current page, plus first/last
                                const shouldShow =
                                    totalPages <= 7 ||
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= currentPage - 1 &&
                                        pageNum <= currentPage + 1);
                                if (!shouldShow) {
                                    // show ellipsis placeholder when skipping
                                    const isLeftEllipsis =
                                        pageNum === 2 && currentPage > 3;
                                    const isRightEllipsis =
                                        pageNum === totalPages - 1 &&
                                        currentPage < totalPages - 2;
                                    if (isLeftEllipsis || isRightEllipsis) {
                                        return (
                                            <span
                                                key={`ell-${pageNum}`}
                                                className="px-1 md:px-2 text-xs md:text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                …
                                            </span>
                                        );
                                    }
                                    return null;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        aria-current={
                                            pageNum === currentPage
                                                ? "page"
                                                : undefined
                                        }
                                        className={`px-2 md:px-3 py-1 rounded-md text-xs md:text-sm border transition-colors ${pageNum === currentPage
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() =>
                                setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                )
                            }
                            disabled={currentPage === totalPages}
                            className={`px-2 md:px-3 py-1 rounded-md border text-xs md:text-sm transition-colors disabled:opacity-50 ${"bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"}`}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}
