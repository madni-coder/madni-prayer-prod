"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaAngleLeft } from "react-icons/fa";

// Detect Tauri environment
const isTauri = process.env.NEXT_PUBLIC_TAURI_BUILD === "1";

// Base URL of deployed site for API calls when running inside Tauri (static build has no Next API)
const REMOTE_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Sample Surah data (in real app, fetch from API or static JSON)
const surahs = [
    { number: 1, name: "Surah Yaseen", arabic: "يسٓ", ayahs: 83 },
    { number: 2, name: "Surah Baqrah", arabic: "البقرة", ayahs: 286 },
    { number: 3, name: "Surah Muzammil", arabic: "المزمل", ayahs: 200 },
    { number: 4, name: "Surah Waqi'a", arabic: "الواقعة", ayahs: 96 },
    { number: 5, name: "Surah Maryam", arabic: "مريم", ayahs: 98 },
    { number: 6, name: "Surah Mulk", arabic: "الملك", ayahs: 30 },
    // ...add more or fetch dynamically
];

// Static Para (Juz) data: 1-30 with custom names and Arabic only (ruku removed)
const paraNames = [
    { name: "Alif Laam Meem", arabic: "ٱلۤمّ" },
    { name: "Sayaqool", arabic: "سَيَقُولُ" },
    { name: "Tilka’r Rusul", arabic: "تِلْكَ ٱلرُّسُلُ" },
    { name: "Lan Tanaaloo", arabic: "لَن تَنَالُواْ" },
    { name: "Wa’l Mohsanat", arabic: "وَٱلْمُحْصَنَاتُ" },
    { name: "Ya Ayyuha’lladhina Aamanu", arabic: "لَا يُحِبُّ ٱللهُ" },
    { name: "Wa Iza Sami‘u", arabic: "وَإِذَا سَمِعُواْ" },
    { name: "Wa Lau Annana", arabic: "وَلَوْ أَنَّنَا" },
    { name: "Qad Aflaha", arabic: "قَالَ ٱلْمَلَأُ" },
    { name: "Wa A‘lamu", arabic: "وَٱعْلَمُواْ" },
    { name: "Ya Ayyuha’lladhina Aamanu La Tattakhizu", arabic: "يتعذرون" },
    { name: "Wa Mamin Daabbah", arabic: "وَمَا مِن دَآبَّةٍ" },
    { name: "Wa Ma Ubrioo", arabic: "وَمَآ أُبَرِّئُ" },
    { name: "Rubama", arabic: "رُّبَمَا" },
    { name: "Subhanalladhi", arabic: "سُبْحَٰنَ ٱلَّذِى" },
    { name: "Qala Alam", arabic: "قَالَ أَلَمْ" },
    { name: "Iqtarabat", arabic: "ٱقْتَرَبَتْ" },
    { name: "Qadd Aflaha", arabic: "قَدْ أَفْلَحَ" },
    { name: "Wa Qala’lladhina La Yarjuna", arabic: "وَقَالَ ٱلَّذِينَ " },
    { name: "A‘mman Khalaq", arabic: "أَمَّنْ خَلَقَ" },
    { name: "Utlu Ma Oohiya", arabic: "ٱتْلُ مَآ أُوحِىَ" },
    { name: "Wa Manyaqnut", arabic: "وَمَن يَقْنُتْ" },
    { name: "Wa Mali", arabic: "وَمَا لِىَ" },
    { name: "Faman Azlam", arabic: "فَمَنْ أَظْلَمُ" },
    { name: "Elahe Yuruddu", arabic: "إِلَيْهِ يُرَدُّ" },
    { name: "Ha’a Meem", arabic: "حم" },
    { name: "Qala Fama Khatbukum", arabic: "قَالَ فَمَا خَطْبُكُم" },
    { name: "Qadd Sami‘a’llahu", arabic: "قَدْ سَمِعَ ٱللَّهُ" },
    { name: "Tabarakalladhi", arabic: "تَبَارَكَ ٱلَّذِى" },
    { name: "‘Amma Yatasa’aloon", arabic: "عَمَّ " },
];

const paras = paraNames.map((p, i) => ({
    number: i + 1,
    name: p.name,
    arabic: p.arabic,
}));

async function getPara() {
    const endpoint = isTauri
        ? `${REMOTE_API_BASE}/api/api-quran`
        : "/api/api-quran";
    try {
        const res = await fetch(endpoint, { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch para files");
        const data = await res.json();
        return data.files;
    } catch (err) {
        throw new Error(err.message);
    }
}

async function getSurahPdf(surahName) {
    const endpoint = isTauri
        ? `${REMOTE_API_BASE}/api/api-quran`
        : "/api/api-quran";
    try {
        const res = await fetch(`${endpoint}?surah=${surahName}`, {
            method: "GET",
        });
        if (!res.ok) throw new Error("Failed to fetch surah PDF");
        const data = await res.json();
        return data.fileUrl;
    } catch (err) {
        throw new Error(err.message);
    }
}

// Kanzul helper removed — use server API to resolve file and debug access

export default function Page() {
    const [search, setSearch] = useState("");
    const [view, setView] = useState("para"); // "para" is now default
    const [files, setFiles] = useState([]); // store API files
    const [showReader, setShowReader] = useState(false);
    const [currentPara, setCurrentPara] = useState(null);
    const [currentTitle, setCurrentTitle] = useState("");
    const [readerUrl, setReaderUrl] = useState("");
    const [currentObjectUrl, setCurrentObjectUrl] = useState(null);
    const router = useRouter();

    // keyboard handlers for reader modal + lock body scroll while open
    useEffect(() => {
        if (!showReader) return;
        const onKey = (e) => {
            if (e.key === "Escape") setShowReader(false);
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        // mark body so global CSS can hide fixed bottom nav
        document.body.classList.add("bottom-nav-hidden");
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
            document.body.classList.remove("bottom-nav-hidden");
        };
    }, [showReader]);

    // revoke any created object URL when reader closes
    useEffect(() => {
        if (showReader) return;
        if (currentObjectUrl) {
            try {
                URL.revokeObjectURL(currentObjectUrl);
            } catch (e) {
                // ignore
            }
            setCurrentObjectUrl(null);
        }
    }, [showReader, currentObjectUrl]);

    // Open reader modal for a surah
    const openSurahReader = async (surah) => {
        try {
            const surahFileName = surah.name;
            const fileUrl = await getSurahPdf(surahFileName);

            const proxied = isTauri
                ? `${REMOTE_API_BASE}/api/pdf-proxy?url=${encodeURIComponent(
                    fileUrl
                )}`
                : `/api/pdf-proxy?url=${encodeURIComponent(fileUrl)}`;
            const viewer = isTauri
                ? `${REMOTE_API_BASE}/pdf-viewer?file=${encodeURIComponent(
                    proxied
                )}`
                : `/pdf-viewer?file=${encodeURIComponent(proxied)}`;

            console.log("PDF viewer URLs", { proxied, viewer });
            const finalUrl = viewer;
            setCurrentPara(surah.number);
            setCurrentTitle(`${surah.number}. ${surah.name}`);
            setReaderUrl(finalUrl);
            setShowReader(true);
        } catch (error) {

        }
    };

    const openReader = async (p) => {
        const file = files.find((f) => f.id === p.number);
        if (!file) return;
        const urlBase = file.fileUrl;

        const proxied = `/api/pdf-proxy?url=${encodeURIComponent(urlBase)}`;
        const proxiedFinal = isTauri
            ? `${REMOTE_API_BASE}/api/pdf-proxy?url=${encodeURIComponent(
                urlBase
            )}`
            : proxied;

        try {
            const storageKey = `para_pdf_${p.number}`;
            const saved = localStorage.getItem(storageKey);

            // If we have a saved base64 PDF, use it to create an object URL
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.type === "base64" && parsed.data) {
                        const byteCharacters = atob(parsed.data.split(",")[1] || parsed.data);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: "application/pdf" });
                        const objUrl = URL.createObjectURL(blob);
                        setCurrentObjectUrl(objUrl);
                        const viewer = isTauri
                            ? `${REMOTE_API_BASE}/pdf-viewer?file=${encodeURIComponent(objUrl)}`
                            : `/pdf-viewer?file=${encodeURIComponent(objUrl)}`;
                        setCurrentPara(p.number);
                        setCurrentTitle(`Para ${p.number}`);
                        setReaderUrl(viewer);
                        setShowReader(true);
                        return;
                    }
                } catch (e) {
                    console.warn("Failed to parse saved para PDF", e);
                }
            }

            // Otherwise fetch the proxied PDF and try to save it (if small enough)
            const resp = await fetch(proxiedFinal);
            if (!resp.ok) throw new Error("Failed to fetch para PDF");
            const blob = await resp.blob();

            // Revoke previous object URL (if any) and create a new one so we can display immediately
            if (currentObjectUrl) {
                try {
                    URL.revokeObjectURL(currentObjectUrl);
                } catch (e) {
                    // ignore
                }
                setCurrentObjectUrl(null);
            }
            const objUrl = URL.createObjectURL(blob);
            setCurrentObjectUrl(objUrl);

            // If blob is small enough (approx < 4.5MB), store as base64 in localStorage (async)
            const maxSaveBytes = 4.5 * 1024 * 1024; // 4.5 MB
            if (blob.size <= maxSaveBytes) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    try {
                        const result = e.target.result; // data:application/pdf;base64,....
                        const payload = JSON.stringify({ type: "base64", data: result, size: blob.size, savedAt: Date.now() });
                        try {
                            localStorage.setItem(storageKey, payload);
                        } catch (err) {
                            console.warn("Failed to save para PDF to localStorage", err);
                        }
                    } catch (err) {
                        console.warn("Error converting blob to base64", err);
                    }
                };
                reader.readAsDataURL(blob);
            } else {
                // Save metadata with URL for fallback
                try {
                    localStorage.setItem(storageKey, JSON.stringify({ type: "url", url: proxiedFinal, size: blob.size, savedAt: Date.now() }));
                } catch (err) {
                    // ignore
                }
            }

            const viewer = isTauri
                ? `${REMOTE_API_BASE}/pdf-viewer?file=${encodeURIComponent(objUrl)}`
                : `/pdf-viewer?file=${encodeURIComponent(objUrl)}`;

            console.log("PDF viewer URLs", { proxied: proxiedFinal, viewer });
            setCurrentPara(p.number);
            setCurrentTitle(`Para ${p.number}`);
            setReaderUrl(viewer);
            setShowReader(true);
        } catch (error) {
            console.error("Error opening para:", error);
            alert("Error loading para PDF");
        }
    };

    useEffect(() => {
        getPara()
            .then((files) => {
                setFiles(files || []);
            })
            .catch((err) => {
                console.error("Error fetching para files:", err);
            });
    }, []);

    const filteredSurahs = surahs.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.arabic.includes(search) ||
            String(s.number) === search
    );
    const filteredParas = paras.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.arabic.includes(search) ||
            String(p.number) === search
    );

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 pb-20 animate-fade-in bg-base-100">
            <div style={{ alignSelf: "flex-start" }}>
                <button
                    className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                    onClick={() => router.push("/")}
                    aria-label="Back to Home"
                >
                    <FaAngleLeft /> Back
                </button>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Quran Sharif
            </h2>
            <div className="glass-card p-8 max-w-4xl w-full bg-base-200 text-base-content pl-4 mx-auto">
                {/* Toggle buttons for Surah/Para/Kanzul Imaan */}
                <div className="flex gap-2 mb-4">
                    <button
                        className={`btn btn-xxl ${view === "para" ? "btn-primary" : "btn-ghost"
                            }`}
                        onClick={() => setView("para")}
                    >
                        Para (Juz)
                    </button>
                    <button
                        className={`btn btn-xxl ${view === "surah" ? "btn-primary" : "btn-ghost"
                            }`}
                        onClick={() => setView("surah")}
                    >
                        Surah
                    </button>
                    <button
                        className={`btn btn-xxl ${view === "kanzul" ? "btn-primary" : "btn-ghost"}`}
                        onClick={() => setView("kanzul")}
                    >
                        Kanzul Imaan
                    </button>
                </div>

                <div
                    className={
                        view === "para"
                            ? "grid grid-cols-2 sm:grid-cols-4 gap-3"
                            : "grid grid-cols-1 sm:grid-cols-2 gap-3"
                    }
                >
                    {view === "surah" ? (
                        filteredSurahs.map((s) => (
                            <div
                                key={s.number}
                                className="neumorph-card p-4 flex flex-col items-center transition hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md cursor-pointer bg-base-100 border border-base-300"
                                onClick={() => openSurahReader(s)}
                            >
                                <span className="text-lg font-bold text-primary">
                                    {s.number}. {s.name}
                                </span>
                                <span className="text-2xl mb-1">{s.arabic}</span>
                                <span className="text-xs text-base-content/60">Ayahs: {s.ayahs}</span>
                            </div>
                        ))
                    ) : view === "para" ? (
                        filteredParas.map((p) => {
                            return (
                                <div
                                    key={p.number}
                                    className="neumorph-card flex flex-col items-center justify-between transition hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md cursor-pointer bg-base-100 border border-primary"
                                    style={{
                                        minHeight: 140,
                                        height: 140,
                                        maxHeight: 140,
                                        minWidth: 0,
                                        width: "100%",
                                        borderRadius: 12,
                                        position: "relative",
                                        padding: 12,
                                    }}
                                    onClick={() => openReader(p)}
                                >
                                    <div className="w-full flex justify-between items-start">
                                        <span className="text-base font-bold text-primary">{p.number}</span>
                                        <span className="text-xs text-primary" style={{ fontFamily: "serif" }}>
                                            ◤
                                        </span>
                                    </div>
                                    <span className="text-2xl mb-1 mt-2 text-center text-white" style={{ fontWeight: 600 }}>
                                        {p.arabic}
                                    </span>
                                    <div className="w-full flex justify-end items-end mt-auto">
                                        <span className="text-xs text-primary" style={{ fontFamily: "serif" }}>
                                            ◢
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-2 sm:col-span-4 flex justify-center">
                            <button
                                className="btn btn-error"
                                onClick={async () => {
                                    try {
                                        const storageKey = `kanzul_imaan_pdf`;
                                        const saved = localStorage.getItem(storageKey);

                                        // If we have a saved base64 PDF, use it to create an object URL
                                        if (saved) {
                                            try {
                                                const parsed = JSON.parse(saved);
                                                if (parsed && parsed.type === "base64" && parsed.data) {
                                                    const byteCharacters = atob(parsed.data.split(",")[1] || parsed.data);
                                                    const byteNumbers = new Array(byteCharacters.length);
                                                    for (let i = 0; i < byteCharacters.length; i++) {
                                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                    }
                                                    const byteArray = new Uint8Array(byteNumbers);
                                                    const blob = new Blob([byteArray], { type: "application/pdf" });
                                                    const objUrl = URL.createObjectURL(blob);
                                                    setCurrentObjectUrl(objUrl);
                                                    const viewer = isTauri
                                                        ? `${REMOTE_API_BASE}/pdf-viewer?file=${encodeURIComponent(objUrl)}`
                                                        : `/pdf-viewer?file=${encodeURIComponent(objUrl)}`;
                                                    setCurrentTitle('Kanzul Imaan');
                                                    setReaderUrl(viewer);
                                                    setShowReader(true);
                                                    return;
                                                }
                                            } catch (e) {
                                                console.warn("Failed to parse saved Kanzul Imaan PDF", e);
                                            }
                                        }

                                        // Fetch Kanzul Imaan file URL from API
                                        const resp = await fetch('/api/kanzul');
                                        const data = await resp.json();
                                        console.log('Kanzul API response:', data);

                                        const rawFileUrl = data.fileUrl || data.publicUrl || data.signedUrl || data.fallback;
                                        if (!resp.ok) {
                                            throw new Error(data.error || 'Failed to resolve Kanzul file');
                                        }

                                        if (!rawFileUrl) throw new Error('No file URL returned from server');

                                        // Proxy the PDF and use it directly (don't fetch as blob - Kanzul Imaan is too large)
                                        const proxied = isTauri
                                            ? `${REMOTE_API_BASE}/api/pdf-proxy?url=${encodeURIComponent(rawFileUrl)}`
                                            : `/api/pdf-proxy?url=${encodeURIComponent(rawFileUrl)}`;

                                        const viewer = isTauri
                                            ? `${REMOTE_API_BASE}/pdf-viewer?file=${encodeURIComponent(proxied)}`
                                            : `/pdf-viewer?file=${encodeURIComponent(proxied)}`;

                                        console.log("Kanzul Imaan PDF viewer URLs", { proxied, viewer });
                                        setCurrentTitle('Kanzul Imaan');
                                        setReaderUrl(viewer);
                                        setShowReader(true);
                                    } catch (err) {
                                        console.error('Failed to open Kanzul Imaan', err);
                                        alert(err.message || 'Failed to open Kanzul Imaan PDF');
                                    }
                                }}
                            >
                                Open Kanzul Imaan
                            </button>
                        </div>
                    )}
                    {(view === "surah" && filteredSurahs.length === 0) ||
                        (view === "para" && filteredParas.length === 0) ? (
                        <div className="col-span-2 sm:col-span-4 text-center text-base-content/60">
                            No {view === "surah" ? "Surah" : "Para"} found.
                        </div>
                    ) : null}
                </div>
                {/* In-app full-window reader modal (mobile/tablet/web responsive) */}
                {showReader && (
                    <div className="fixed inset-0 z-[120] bg-black bg-opacity-80">
                        <div className="flex flex-col h-screen w-screen">
                            <header className="flex items-center justify-between px-10 py-10 bg-base-200 border-b border-base-300 ">
                                <div>
                                    <span className="font-semibold text-lg">
                                        {currentTitle ||
                                            `Para ${currentPara ?? 2}`}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        className="btn btn-sm btn-error"
                                        onClick={() => setShowReader(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </header>
                            <main className="relative flex-1 overflow-hidden bg-base-100">
                                <iframe
                                    src={readerUrl}
                                    className="w-full h-full min-h-0"
                                    title={`${currentTitle || `Para ${currentPara}`
                                        } preview`}
                                />
                            </main>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
