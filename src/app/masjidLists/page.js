"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAllMasjidContext } from "../../context/AllMasjidContext";
import AnimatedLooader from "../../components/animatedLooader";
import { FaChevronRight, FaChevronLeft, FaAngleLeft } from "react-icons/fa";

export default function MasjidListsPage() {
    const { masjids, loading, error, fetchAll } = useAllMasjidContext();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [isRaipur, setIsRaipur] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Fetch all masjids when the page loads
        fetchAll();
    }, [fetchAll]);

    // Filter by city and search query
    const filteredMasjids = useMemo(() => {
        if (!masjids) return [];
        let filtered = masjids;

        // "Only Raipur" toggle logic: if turned on, show Raipur, else Bilaspur
        if (isRaipur) {
            filtered = filtered.filter(m => m.city?.toLowerCase() === 'raipur');
        } else {
            // Default show Bilaspur
            filtered = filtered.filter(m => !m.city || m.city?.toLowerCase() === 'bilaspur');
        }

        // Apply search
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(m => 
                (m.masjidName && m.masjidName.toLowerCase().includes(query)) ||
                (m.colony && m.colony.toLowerCase().includes(query)) ||
                (m.locality && m.locality.toLowerCase().includes(query))
            );
        }

        // Sort alphabetically
        filtered.sort((a, b) => {
            const nameA = a.masjidName || a.name || "";
            const nameB = b.masjidName || b.name || "";
            return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });

        return filtered;
    }, [masjids, isRaipur, searchQuery]);

    // Pagination calculations
    const totalItems = filteredMasjids.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    // Reset to page 1 if query/toggle changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, isRaipur]);

    const paginatedMasjids = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredMasjids.slice(start, end);
    }, [filteredMasjids, currentPage]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <AnimatedLooader message="Loading Masjids..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100 text-red-500 p-4">
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-md text-center">
                    <p className="text-lg font-semibold mb-2">Failed to load masjids.</p>
                    <p className="text-sm text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-start pt-16 pb-28 bg-base-100 text-base-content p-4 sm:p-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}>
            
            <div className="w-full max-w-lg flex flex-col gap-5">
                
                {/* Back Button */}
                <div style={{ alignSelf: "flex-start" }}>
                    <button
                        className="flex items-center gap-2 mb-[-500] mt-[-50] text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>
                </div>

                {/* Header */}
                <h1 className="text-center text-3xl font-bold tracking-wider text-primary uppercase mt-[-30] mb-2 drop-shadow-sm">
                    ALL MASJIDS
                </h1>

                {/* Search Bar */}
                <div className="relative w-full">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name or address..."
                        className="w-full bg-base-200 border border-base-300 rounded-full py-3 px-5 text-sm text-base-content placeholder:text-neutral-500 focus:outline-none focus:border-primary/60 transition-colors shadow-inner"
                    />
                </div>

                {/* Toggle - Only Raipur */}
                <div className="flex items-center justify-center gap-3 w-full">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={isRaipur}
                            onChange={(e) => setIsRaipur(e.target.checked)}
                        />
                        <div className="w-12 h-6 bg-black peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <span className="text-sm font-medium text-base-content/80">Only Raipur</span>
                </div>

                {/* List Container */}
                <div className="flex flex-col gap-3 mt-4">
                    {paginatedMasjids.length > 0 ? (
                        paginatedMasjids.map((masjid, index) => {
                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                            return (
                                <div 
                                    key={masjid.id}
                                    onClick={() => router.push(`/masjidLists/viewThisMasjid/${masjid.id}`)}
                                    className="w-full bg-base-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-base-300 active:bg-base-300 transition-colors border border-base-300/50 shadow-sm"
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <span className="text-xs font-semibold text-neutral-500 w-4 text-center shrink-0">
                                            {globalIndex}
                                        </span>
                                        <div className="text-2xl drop-shadow-md shrink-0">
                                            🕌
                                        </div>
                                        <div className="flex flex-col flex-1 pl-1">
                                            <h2 className="text-base font-bold text-base-content break-words">
                                                {masjid.masjidName}
                                            </h2>
                                            <p className="text-xs font-bold mt-1 break-words leading-relaxed">
                                                {masjid.colony}
                                                {masjid.locality && `, ${masjid.locality}`}
                                                {masjid.city && `, ${masjid.city}`}
                                            </p>
                                        </div>
                                    </div>
                                    <FaChevronRight className="text-xs text-neutral-500 ml-3 flex-shrink-0" />
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 text-[#78716c]">
                            <p className="text-4xl mb-4">🕌</p>
                            <p>No masjids found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <div className="flex items-center justify-between mt-6 px-2">
                        <div className="text-xs text-[#78716c]">
                            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 rounded transition-colors text-[#78716c]"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && arr[i - 1] !== p - 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((page, idx) => (
                                        page === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="text-xs text-neutral-500 px-1">...</span>
                                        ) : (
                                            <button 
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-7 h-7 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all ${
                                                    currentPage === page 
                                                    ? "bg-[#10b981] text-black shadow-[0_2px_10px_rgba(16,185,129,0.3)]" 
                                                    : "text-[#78716c] hover:bg-white/5"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    ))}
                            </div>
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 rounded transition-colors text-[#78716c]"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
