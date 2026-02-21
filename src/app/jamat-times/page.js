"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { MapPin, Save, Check } from "lucide-react";
import { FaAngleLeft, FaMosque, FaTimes, FaWhatsapp, FaCopy, FaCheck } from "react-icons/fa";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";

function DigitalClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    const pad = (n) => n.toString().padStart(2, "0");
    let hours = time.getHours();
    const minutes = pad(time.getMinutes());
    const seconds = pad(time.getSeconds());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = pad(hours);

    return (
        <div className="flex flex-col items-center mb-4">
            <span className="mt-1 text-xl text-white font-bold  tracking-widest">
                Current Time
            </span>
            <br />
            <div className="flex items-end gap-2">
                <span
                    className="text-4xl md:text-5xl font-mono font-extrabold text-warning bg-black/80 px-6 py-3 rounded-xl shadow-lg border-4 border-warning"
                    style={{
                        fontFamily: "'Orbitron', 'Fira Mono', monospace",
                        letterSpacing: "0.08em",
                        boxShadow: "0 4px 24px #0004, 0 1px 0 #fff2",
                    }}
                >
                    {hours}:{minutes}:{seconds}
                </span>
                <span className="text-xl md:text-xl font-bold text-warning ml-1 mb-2 select-none">
                    {ampm}
                </span>
            </div>

        </div>
    );
}

export default function JamatTimesPage() {
    const router = useRouter();
    const [masjids, setMasjids] = useState([]);
    const [onlyRaipur, setOnlyRaipur] = useState(false);
    const [selectedMasjid, setSelectedMasjid] = useState(""); // acts as unified search query
    const [selectedMasjidData, setSelectedMasjidData] = useState(null);
    const [masjidSuggestionsVisible, setMasjidSuggestionsVisible] = useState(false);
    const [filteredMasjids, setFilteredMasjids] = useState([]);
    const [masjidHighlight, setMasjidHighlight] = useState(-1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isOffline, setIsOffline] = useState(
        typeof window !== "undefined" ? !window.navigator.onLine : false
    );
    const [autoLocating, setAutoLocating] = useState(false);
    const [userCoords, setUserCoords] = useState(null);
    const [mapEmbedUrl, setMapEmbedUrl] = useState(null);
    const [savedMasjid, setSavedMasjid] = useState(null);
    const [hasLoadedSavedMasjid, setHasLoadedSavedMasjid] = useState(false);
    const [changedPrayers, setChangedPrayers] = useState([]);
    const [reportVisible, setReportVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const reportPhone = "9691302711";
    // Ensure phone has country code for WhatsApp links (default to India +91)
    const formatPhoneForWhatsApp = (phone) => {
        if (!phone) return "";
        let num = phone.toString().trim();
        // remove non-digit characters
        num = num.replace(/\D/g, "");
        // If already has country code (length > 10), return as-is
        if (num.length > 10) return num;
        // If 10 digits, assume India +91
        if (num.length === 10) return `91${num}`;
        return num;
    };

    // visibleMasjids respects the Raipur-only toggle
    // Default: show Bilaspur and entries without a city (city === null/undefined/empty)
    const visibleMasjids = onlyRaipur
        ? masjids.filter((m) => (m.city || "").toLowerCase() === "raipur")
        : masjids.filter((m) => {
            const city = (m.city || "").toString().trim().toLowerCase();
            return city === "" || city === "bilaspur";
        });


    useEffect(() => {
        loadSavedMasjid();
        // load cached masjids immediately so UI can render when offline
        try {
            if (typeof window !== "undefined") {
                const cached = localStorage.getItem("masjidsCache");
                if (cached) {
                    setMasjids(JSON.parse(cached));
                }
            }
        } catch (e) {
            console.warn("Failed to load masjidsCache on mount", e);
        }
        fetchMasjids();

        // load persisted toggle state
        try {
            if (typeof window !== "undefined") {
                const saved = localStorage.getItem("onlyRaipur");
                if (saved === "true") setOnlyRaipur(true);
            }
        } catch (e) {
            console.warn("Failed to read onlyRaipur from localStorage", e);
        }
    }, []);

    // Keep track of online/offline state and refetch when back online
    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleOnline = () => {
            setIsOffline(false);
            setError("");
            fetchMasjids();
        };
        const handleOffline = () => {
            setIsOffline(true);
            setError("No internet connection");
        };
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // persist toggle to localStorage when changed
    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            if (onlyRaipur) localStorage.setItem("onlyRaipur", "true");
            else localStorage.removeItem("onlyRaipur");
        } catch (e) {
            console.warn("Failed to persist onlyRaipur to localStorage", e);
        }
    }, [onlyRaipur]);

    // Auto-populate selected masjid when saved data is loaded (only once on initial load)
    useEffect(() => {
        if (savedMasjid && !hasLoadedSavedMasjid) {
            setSelectedMasjid(savedMasjid.masjidName || "");
            setSelectedMasjidData(savedMasjid);
            setHasLoadedSavedMasjid(true);
        }
    }, [savedMasjid, hasLoadedSavedMasjid]);

    // Sync updated API data with the locally saved masjid (runs when API data arrives)
    useEffect(() => {
        if (hasLoadedSavedMasjid && savedMasjid && masjids.length > 0) {
            const freshData = masjids.find(
                (m) =>
                    m.masjidName === savedMasjid.masjidName &&
                    m.colony === savedMasjid.colony
            );

            if (freshData) {
                const dataToSave = {
                    masjidName: freshData.masjidName,
                    colony: freshData.colony,
                    locality: freshData.locality || "",
                    fazar: freshData.fazar,
                    zuhar: freshData.zuhar,
                    asar: freshData.asar,
                    maghrib: freshData.maghrib,
                    isha: freshData.isha,
                    taravih: freshData.taravih,
                    juma: freshData.juma,
                    pasteMapUrl: freshData.pasteMapUrl || "",
                    savedAt: savedMasjid.savedAt || new Date().toISOString(),
                };

                const isDataDifferent =
                    savedMasjid.fazar !== freshData.fazar ||
                    savedMasjid.zuhar !== freshData.zuhar ||
                    savedMasjid.asar !== freshData.asar ||
                    savedMasjid.maghrib !== freshData.maghrib ||
                    savedMasjid.isha !== freshData.isha ||
                    savedMasjid.juma !== freshData.juma ||
                    savedMasjid.taravih !== freshData.taravih ||
                    savedMasjid.locality !== freshData.locality;

                if (isDataDifferent) {
                    try {
                        localStorage.setItem("savedMasjidData", JSON.stringify(dataToSave));
                        setSavedMasjid(dataToSave);

                        const changed = [];
                        if (savedMasjid.fazar !== freshData.fazar) changed.push("Fajr");
                        if (savedMasjid.zuhar !== freshData.zuhar) changed.push("Zuhr");
                        if (savedMasjid.asar !== freshData.asar) changed.push("Asar");
                        if (savedMasjid.maghrib !== freshData.maghrib) changed.push("Maghrib");
                        if (savedMasjid.isha !== freshData.isha) changed.push("Isha");
                        if (savedMasjid.taravih !== freshData.taravih) changed.push("Taravih");
                        if (savedMasjid.juma !== freshData.juma) changed.push("Juma Khutba");

                        if (changed.length > 0) {
                            setChangedPrayers(changed);
                            setTimeout(() => {
                                setChangedPrayers([]);
                            }, 60000); // 1 minute
                        }
                    } catch (e) {
                        console.error("Failed to update fresh masjid data to localStorage", e);
                    }
                }

                // Ensure the selectedMasjidData uses the freshest data possible
                setSelectedMasjidData((prev) => {
                    if (prev && prev.masjidName === freshData.masjidName && prev.colony === freshData.colony) {
                        // Check if the current state data is identical to the fresh data
                        const isPrevDifferent =
                            prev.fazar !== freshData.fazar ||
                            prev.zuhar !== freshData.zuhar ||
                            prev.asar !== freshData.asar ||
                            prev.maghrib !== freshData.maghrib ||
                            prev.isha !== freshData.isha ||
                            prev.juma !== freshData.juma ||
                            prev.taravih !== freshData.taravih;
                        if (isPrevDifferent) {
                            return freshData;
                        }
                    }
                    return prev;
                });
            }
        }
    }, [masjids, savedMasjid, hasLoadedSavedMasjid]);

    // Clear or adjust selections when onlyRaipur toggle changes
    useEffect(() => {
        // reset suggestion lists
        setFilteredMasjids([]);

        // if selected masjid is outside the visible set, clear it
        if (
            selectedMasjidData &&
            onlyRaipur &&
            (selectedMasjidData.city || "").toLowerCase() !== "raipur"
        ) {
            setSelectedMasjid("");
            setSelectedMasjidData(null);
        }
    }, [onlyRaipur]);

    const handleAutoLocate = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setAutoLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserCoords({ lat, lng });
                const embed = `https://www.google.com/maps?q=masjid&ll=${lat},${lng}&z=15&output=embed`;
                setMapEmbedUrl(embed);
                setAutoLocating(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setAutoLocating(false);
                alert(
                    "Unable to retrieve your location. Please enable location services and try again."
                );
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const fetchMasjids = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get("/api/all-masjids");
            setMasjids(data?.data || []);
            setIsOffline(false);
            try {
                if (typeof window !== "undefined") {
                    localStorage.setItem("masjidsCache", JSON.stringify(data?.data || []));
                }
            } catch (e) {
                console.warn("Failed to persist masjids cache", e);
            }
        } catch (err) {
            const message =
                err?.response?.data?.error ||
                err?.message ||
                "Network error occurred";
            setError(message);
            setIsOffline(true);
            console.error("Error fetching masjids:", err);
            // fall back to cached masjids so UI can still render
            try {
                if (typeof window !== "undefined") {
                    const cached = localStorage.getItem("masjidsCache");
                    if (cached) setMasjids(JSON.parse(cached));
                }
            } catch (e) {
                console.warn("Failed to load cached masjids after fetch failure", e);
            }
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        if (type === "error") toast.error(message);
        else toast.success(message);
    };

    const loadSavedMasjid = () => {
        try {
            const saved = localStorage.getItem("savedMasjidData");
            console.log("📖 Loading saved masjid from localStorage:", saved);
            if (saved) {
                const parsedData = JSON.parse(saved);
                console.log("✅ Parsed saved masjid data:", parsedData);
                setSavedMasjid(parsedData);
            } else {
                console.log("ℹ️ No saved masjid found in localStorage");
            }
        } catch (err) {
            console.error("❌ Error loading saved masjid:", err);
        }
    };

    const saveMasjidToLocalStorage = () => {
        if (!selectedMasjidData) return;

        const dataToSave = {
            masjidName: selectedMasjidData.masjidName,
            colony: selectedMasjidData.colony,
            locality: selectedMasjidData.locality || "",
            fazar: selectedMasjidData.fazar,
            zuhar: selectedMasjidData.zuhar,
            asar: selectedMasjidData.asar,
            maghrib: selectedMasjidData.maghrib,
            isha: selectedMasjidData.isha,
            taravih: selectedMasjidData.taravih,
            juma: selectedMasjidData.juma,
            pasteMapUrl: selectedMasjidData.pasteMapUrl || "",
            savedAt: new Date().toISOString(),
        };

        try {
            localStorage.setItem("savedMasjidData", JSON.stringify(dataToSave));
            console.log("💾 Masjid saved to localStorage:", dataToSave);
            setSavedMasjid(dataToSave);
            showToast("✅ Masjid saved successfully!");
        } catch (err) {
            console.error("❌ Error saving masjid:", err);
            showToast("❌ Failed to save masjid. Please try again.", "error");
        }
    };

    // Unified search: matches masjidName, colony or locality with ranking
    const handleMasjidChange = (e) => {
        const q = e.target.value;
        setSelectedMasjid(q);
        const qi = q.trim().toLowerCase();

        if (qi.length === 0) {
            setFilteredMasjids([]);
            setMasjidSuggestionsVisible(false);
            setMasjidHighlight(-1);
            setSelectedMasjidData(null);
            return;
        }

        // scoring: exact full-match > startsWith > includes
        const score = (m) => {
            const name = (m.masjidName || "").toLowerCase();
            const colony = (m.colony || "").toLowerCase();
            const locality = (m.locality || "").toLowerCase();
            if (qi === name || qi === colony || qi === locality) return 100;
            if (name.startsWith(qi) || colony.startsWith(qi) || locality.startsWith(qi)) return 80;
            if (name.includes(qi) || colony.includes(qi) || locality.includes(qi)) return 50;
            return 0;
        };

        const filtered = visibleMasjids
            .map((m) => ({ m, s: score(m) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s || a.m.masjidName.localeCompare(b.m.masjidName))
            .map((x) => x.m);

        setFilteredMasjids(filtered);
        setMasjidSuggestionsVisible(qi.length >= 1 && (filtered.length > 0 || qi.length >= 4));
        setMasjidHighlight(-1);

        // If exact match (score 100) exists, preselect it
        const exact = visibleMasjids.find((m) => (m.masjidName || "") === q || (m.colony || "") === q || (m.locality || "") === q);
        if (exact) {
            setSelectedMasjidData(exact);
        } else {
            setSelectedMasjidData(null);
        }
    };

    const selectMasjid = (masjid) => {
        setSelectedMasjid(masjid.masjidName);
        setSelectedMasjidData(masjid);
        setMasjidSuggestionsVisible(false);
        setFilteredMasjids([]);
        setMasjidHighlight(-1);
    };

    const handleMasjidKeyDown = (e) => {
        if (!masjidSuggestionsVisible) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setMasjidHighlight((i) => Math.min(i + 1, filteredMasjids.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setMasjidHighlight((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const sel = filteredMasjids[masjidHighlight] || filteredMasjids[0];
            if (sel) selectMasjid(sel);
        } else if (e.key === "Escape") {
            setMasjidSuggestionsVisible(false);
        }
    };

    // clear helpers for the small X buttons
    const clearMasjid = (e) => {
        e.preventDefault();
        setSelectedMasjid("");
        setSelectedMasjidData(null);
        setFilteredMasjids([]);
        setMasjidSuggestionsVisible(false);
        setMasjidHighlight(-1);
    };

    const selectedMasjidExact = visibleMasjids.some((m) => m.masjidName === selectedMasjid);
    const showMasjidDropdown = masjidSuggestionsVisible || (selectedMasjid.trim().length >= 4 && !selectedMasjidExact);

    const getMapUrl = () => {
        if (!selectedMasjidData) return "";
        return (
            selectedMasjidData.mapUrl ||
            selectedMasjidData.map_url ||
            selectedMasjidData.map ||
            selectedMasjidData.pasteMapUrl ||
            encodeURI(
                `https://www.google.com/maps/search/?api=1&query=${selectedMasjidData.masjidName
                } ${selectedMasjidData.colony} ${selectedMasjidData.locality || ""
                }`
            )
        );
    };

    const handleLink = async () => {
        const mapUrl = getMapUrl();
        if (!mapUrl) {
            showToast("Location is not added for this masjid.", "error");
            return;
        }

        // Parse intent:// URLs to extract the actual browser URL
        const parseIntentUrl = (url) => {
            if (!url) return url;

            // If it's not an intent URL, return as-is
            if (!url.toLowerCase().startsWith('intent://')) {
                return url;
            }

            // Extract browser_fallback_url from intent URL if present
            const fallbackMatch = url.match(/S\.browser_fallback_url=([^;#]+)/);
            if (fallbackMatch && fallbackMatch[1]) {
                try {
                    return decodeURIComponent(fallbackMatch[1]);
                } catch (e) {
                    return fallbackMatch[1];
                }
            }

            // Otherwise extract the core URL
            // intent://maps.app.goo.gl/xxxxx;end; -> https://maps.app.goo.gl/xxxxx
            let parsedUrl = url
                .replace(/^intent:\/\//i, 'https://')  // Replace intent:// with https://
                .replace(/;end;?$/i, '')                // Remove trailing ;end; or ;end
                .split(';')[0]                          // Take everything before first semicolon
                .split('#')[0];                         // Remove any hash fragments

            return parsedUrl;
        };

        const finalUrl = parseIntentUrl(mapUrl);
        console.log('Opening URL:', finalUrl); // Debug log

        try {
            // Check if running in Tauri mobile app
            if (typeof window !== "undefined" && window.__TAURI__) {
                try {
                    // Dynamically import Tauri opener plugin
                    const { open } = await import("@tauri-apps/plugin-opener");

                    // Use Tauri's open function with the parsed URL
                    await open(finalUrl);
                    return;
                } catch (err) {
                    console.error("Tauri opener failed:", err);
                    // Fall through to window.open
                }
            }

            // For web browsers
            window.open(finalUrl, "_blank", "noopener,noreferrer");
        } catch (err) {
            console.error("Failed to open map URL:", err);
            showToast("Unable to open the map on this device.", "error");
        }
    };

    const reportUs = () => {
        setReportVisible(true);
    };

    const copyNumber = async () => {
        const text = reportPhone || "";
        if (!text) return;
        // Prefer modern clipboard API
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                throw new Error("navigator.clipboard not available");
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            // Fallback for older browsers: use a temporary textarea + execCommand
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                // Prevent scrolling to bottom
                ta.style.position = "fixed";
                ta.style.top = "0";
                ta.style.left = "0";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const successful = document.execCommand("copy");
                document.body.removeChild(ta);
                if (successful) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                } else {
                    showToast("Copy failed. Please copy manually.", "error");
                }
            } catch (err) {
                console.error("Copy failed", err);
                showToast("Copy failed. Please copy manually.", "error");
            }
        }
    };

    const [copiedMap, setCopiedMap] = useState(false);

    const copyMapUrl = async () => {
        const mapUrl = getMapUrl();
        if (!mapUrl) {
            showToast("Location is not added for this masjid.", "error");
            return;
        }
        const text = mapUrl;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                setCopiedMap(true);
                setTimeout(() => setCopiedMap(false), 2000);
                showToast("Map URL copied to clipboard.", "success");
                return;
            }
            throw new Error("navigator.clipboard not available");
        } catch (e) {
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                ta.style.position = "fixed";
                ta.style.top = "0";
                ta.style.left = "0";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                const successful = document.execCommand("copy");
                document.body.removeChild(ta);
                if (successful) {
                    setCopiedMap(true);
                    setTimeout(() => setCopiedMap(false), 2000);
                    showToast("Map URL copied to clipboard.", "success");
                } else {
                    showToast("Failed to copy map URL.", "error");
                }
            } catch (err) {
                console.error("Copy failed", err);
                showToast("Failed to copy map URL.", "error");
            }
        }
    };

    const getJamatTimes = () => {
        if (!selectedMasjidData) return [];
        return [
            {
                name: "Fajr",
                time: selectedMasjidData.fazar,
                color: "border-blue-500",
            },
            {
                name: "Zuhr",
                time: selectedMasjidData.zuhar,
                color: "border-red-500",
            },
            {
                name: "Asar",
                time: selectedMasjidData.asar,
                color: "border-yellow-500",
            },
            {
                name: "Maghrib",
                time: selectedMasjidData.maghrib,
                color: "border-pink-500",
            },
            {
                name: "Isha",
                time: selectedMasjidData.isha,
                color: "border-indigo-500",
            },
            {
                name: "Taravih",
                time: selectedMasjidData.taravih || "—",
                color: "border-purple-500",
            },
            {
                name: "Juma Khutba",
                time: selectedMasjidData.juma,
                color: "border-green-500",
            },
        ];
    };

    // Note: remove blocking early returns so the UI renders even when
    // loading or an error occurs (offline mode). We still track `loading`
    // and `error` states and show contextual UI inside the main render.

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 pb-12">
            <div className="w-full max-w-md px-4">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>

                </div>

                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex-1 text-center">
                    Jamat Times
                </h1>
            </div>

            <div className="sticky top-0 left-0 w-full z-10 flex justify-center bg-base-200/80 backdrop-blur-sm py-2">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <DigitalClock />
                </div>
            </div>

            {isOffline && (
                <div className="w-full max-w-md px-4 mt-3">
                    <div className="alert shadow-lg alert-warning text-center mt -2">
                        <span className="font-bold">No Internet</span>
                    </div>
                </div>
            )}

            <div className="bg-white backdrop-blur-sm p-3 md:p-4 rounded-lg shadow-sm max-w-2xl mx-4 sm:mx-auto">
                <h2 className="text-base md:text-lg font-extrabold text-primary text-center leading-tight">
                    Jama'at Times for Bilaspur and Raipur (C.G)
                    Only
                </h2>
            </div>

            <div className="w-full max-w-md mt-8 mb-12 p-4">
                <div className="flex justify-start mb-8 ml-6">
                    <button
                        onClick={handleAutoLocate}
                        disabled={autoLocating}
                        className=" btn btn-outline btn-primary btn-xxl transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-content"
                    >
                        {autoLocating ? (
                            <>
                                <span className="loading loading-spinner loading-sm mr-2"></span>
                                LOCATING...
                            </>
                        ) : (
                            <>
                                <MapPin className="w-5 h-5" />
                                See Nearby Masjid
                            </>
                        )}
                    </button>
                    <div className="ml-4 flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-primary">
                            <input

                                type="checkbox"
                                className="toggle toggle-2xl checked:bg-primary checked:border-primary checked:after:bg-primary"
                                checked={onlyRaipur}
                                onChange={(e) => setOnlyRaipur(e.target.checked)}
                                aria-label="Show only Raipur masjids"
                            />
                            <span className="select-none">Only Raipur</span>
                        </label>
                    </div>
                </div>

                {mapEmbedUrl && (
                    <div className="mx-4 mb-6 rounded-lg overflow-hidden border border-primary/20">
                        <iframe
                            title="Embedded Map"
                            src={mapEmbedUrl}
                            className="w-full"
                            style={{ height: 300, border: 0 }}
                            loading="lazy"
                        />
                    </div>
                )}

                <div className="flex flex-col gap-2 mb-6 ml-4 mr-4">
                    <div className="w-full">
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                            🔎 Search By Masjid or Locality
                        </h3>
                        <div className="relative">
                            <input
                                className="input input-primary input-lg w-full pr-10"
                                value={selectedMasjid}
                                onChange={handleMasjidChange}
                                onKeyDown={handleMasjidKeyDown}
                                onFocus={() => {
                                    if (selectedMasjid.trim().length > 0 && filteredMasjids.length > 0)
                                        setMasjidSuggestionsVisible(true);
                                }}
                                onBlur={() => setTimeout(() => setMasjidSuggestionsVisible(false), 150)}
                                placeholder="Search By Masjid or Colony"
                                aria-autocomplete="list"
                            />
                            {selectedMasjid.length > 0 && (
                                <button
                                    type="button"
                                    onMouseDown={(ev) => ev.preventDefault()}
                                    onClick={clearMasjid}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 transform text-primary bg-primary/10 hover:bg-primary/20 rounded-full p-1 z-50"
                                    aria-label="Clear search"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            )}

                            {showMasjidDropdown && (
                                <ul className="absolute left-0 right-0 mt-1 z-50 max-h-44 overflow-auto bg-base-100 border border-primary/20 rounded-md shadow-lg">
                                    {filteredMasjids.length > 0 ? (
                                        filteredMasjids.map((m, idx) => (
                                            <li
                                                key={m.id}
                                                className={`px-3 py-2 cursor-pointer hover:bg-primary/10 ${idx === masjidHighlight ? "bg-primary/10" : ""}`}
                                                onMouseDown={(ev) => ev.preventDefault()}
                                                onClick={() => selectMasjid(m)}
                                            >
                                                <div className="font-semibold text-primary">{m.masjidName}</div>
                                                <div className="text-sm text-gray-500">{m.colony}{m.locality ? `, ${m.locality}` : ""}</div>
                                            </li>
                                        ))
                                    ) : selectedMasjid.trim().length >= 4 ? (
                                        <li key="no-match" className="px-3 py-2 text-center text-sm text-primary opacity-80 cursor-default">{isOffline ? "No Internet" : "No Match Found"}</li>
                                    ) : null}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-center">
                    Jama'at Time In
                </h1>

                {selectedMasjidData && (
                    <div className="text-center mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="text-xl font-semibold text-primary">
                            {selectedMasjidData.masjidName}
                        </div>
                        <div className="text-xl text-white-600 mt-1">
                            {selectedMasjidData.colony}
                            {selectedMasjidData.locality && (
                                <span>, {selectedMasjidData.locality}</span>
                            )}
                        </div>
                    </div>
                )}

                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body p-6">
                        {selectedMasjidData ? (
                            getJamatTimes().map((prayer) => {
                                const isChanged = changedPrayers.includes(prayer.name);
                                return (
                                    <div
                                        key={prayer.name}
                                        title={isChanged ? `${prayer.name} time changed today` : undefined}
                                        className={`group relative flex justify-between items-center border-l-4 ${prayer.color} rounded-lg px-4 py-3 mb-3 last:mb-0 transition-all duration-500 ${isChanged
                                            ? "bg-primary/20 shadow-md scale-[1.02]"
                                            : "bg-base-200"
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-base ${isChanged ? "text-primary" : ""}`}>
                                                {prayer.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-lg font-bold">
                                                {prayer.time}
                                            </span>
                                            {isChanged && (
                                                <span className="absolute -top-2 right-2 bg-primary text-white text-xs px-2  rounded-full shadow-sm animate-pulse z-10">
                                                    Jamat Time Changed
                                                </span>
                                            )}
                                        </div>

                                        {/* Tooltip on hover if changed */}
                                        {isChanged && (
                                            <div className="pointer-events-none absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-50">
                                                {prayer.name} time changed today
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-6">
                                <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <FaMosque
                                        className="w-10 h-10 text-primary"
                                        aria-hidden="true"
                                    />
                                </div>
                                <h3 className="text-2xl font-semibold text-center mb-3 text-primary">
                                    Select A Masjid To View Jama'at Time
                                </h3>
                            </div>
                        )}
                    </div>
                </div>
                {selectedMasjidData && (
                    <div className="mt-6 mb-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                            {savedMasjid?.masjidName ===
                                selectedMasjidData.masjidName &&
                                savedMasjid?.colony === selectedMasjidData.colony
                                ? ""
                                : "Save this masjid details permanently to view Jama'at times"}
                        </p>
                        <button
                            type="button"
                            onClick={saveMasjidToLocalStorage}
                            disabled={
                                savedMasjid?.masjidName ===
                                selectedMasjidData.masjidName &&
                                savedMasjid?.colony ===
                                selectedMasjidData.colony
                            }
                            className={`group relative inline-flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform overflow-hidden ${savedMasjid?.masjidName ===
                                selectedMasjidData.masjidName &&
                                savedMasjid?.colony ===
                                selectedMasjidData.colony
                                ? "bg-green-500 text-white cursor-not-allowed opacity-80"
                                : "bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-white hover:scale-105 hover:shadow-xl active:scale-95"
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            {savedMasjid?.masjidName ===
                                selectedMasjidData.masjidName &&
                                savedMasjid?.colony ===
                                selectedMasjidData.colony ? (
                                <Check className="w-6 h-6 relative z-10" />
                            ) : (
                                <Save className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                            )}
                            <span className="relative z-10">
                                {savedMasjid?.masjidName ===
                                    selectedMasjidData.masjidName &&
                                    savedMasjid?.colony ===
                                    selectedMasjidData.colony
                                    ? "Already Saved"
                                    : "Save This Masjid"}
                            </span>
                        </button>

                    </div>
                )}
                {selectedMasjidData && (
                    <div className="mt-4 mb-8 text-center">
                        <div className="inline-flex items-center justify-center">
                            <button
                                type="button"
                                onClick={copyMapUrl}
                                aria-label="Copy map URL"
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-md bg-primary/20 hover:bg-primary/30 text-primary transition font-semibold"
                            >
                                {copiedMap ? (
                                    <FaCheck className="w-4 h-4 text-green-600" />
                                ) : (
                                    <FaCopy className="w-4 h-4" />
                                )}
                                <span>Copy Location Of This Masjid</span>
                            </button>
                        </div>
                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={reportUs}
                                className="inline-flex items-center gap-2 px-4 py-3 btn btn-error text-white transition font-semibold"
                            >
                                <FaWhatsapp className="w-5 h-5" />
                                <span>Jamat Time Changed ? Tell Us</span>
                            </button>
                            {reportVisible && (
                                <div className="relative mt-3 w-full max-w-full">
                                    <div className="p-3 rounded-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-base-200 bg-base-100 dark:bg-base-900 dark:border-base-700 text-left">
                                        <div className="flex items-start md:items-center gap-3 flex-1 min-w-0">
                                            <div className="text-sm text-base-content dark:text-base-content/80 min-w-0">
                                                <div className="mb-1 md:mb-0 break-words whitespace-normal">Mistake in Jamat times — report us by sending correct Jamat time on WhatsApp</div>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <div className="inline-flex items-center gap-2 text-green-600 break-words">
                                                        <FaWhatsapp className="w-4 h-4" />
                                                        <a
                                                            href={`https://wa.me/${formatPhoneForWhatsApp(reportPhone)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="font-mono select-none underline underline-offset-2 break-words"
                                                            aria-label={`Open WhatsApp chat with ${reportPhone}`}
                                                        >
                                                            {reportPhone}
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={copyNumber}
                                                            aria-label="Copy phone number"
                                                            className="inline-flex items-center justify-center p-1 rounded-md text-base-content hover:bg-base-200 dark:hover:bg-base-800"
                                                        >
                                                            {copied ? (
                                                                <FaCheck className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <FaCopy className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setReportVisible(false)}
                                        aria-label="Close report message"
                                        className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-base-200 dark:bg-base-800 text-base-content rounded-full shadow-sm hover:bg-primary hover:text-white transition"
                                    >
                                        <FaTimes className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                )}

            </div>

        </div>
    );
}
