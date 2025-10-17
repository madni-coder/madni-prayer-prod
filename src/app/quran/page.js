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
    // ...add more or fetch dynamically
];

// Static Para (Juz) data: 1-30 with custom names, Arabic, and Total Ruku (from screenshot)
const paraNames = [
    { name: "Alif Laam Meem", arabic: "ٱلۤمّ", ruku: 17 },
    { name: "Sayaqool", arabic: "سَيَقُولُ", ruku: 16 },
    { name: "Tilka’r Rusul", arabic: "تِلْكَ ٱلرُّسُلُ", ruku: 17 },
    { name: "Lan Tanaaloo", arabic: "لَن تَنَالُواْ", ruku: 14 },
    { name: "Wa’l Mohsanat", arabic: "وَٱلْمُحْصَنَاتُ", ruku: 17 },
    {
        name: "Ya Ayyuha’lladhina Aamanu",
        arabic: "لَا يُحِبُّ ٱللهُ",
        ruku: 16,
    },
    { name: "Wa Iza Sami‘u", arabic: "وَإِذَا سَمِعُواْ", ruku: 19 },
    { name: "Wa Lau Annana", arabic: "وَلَوْ أَنَّنَا", ruku: 17 },
    { name: "Qad Aflaha", arabic: "قَالَ ٱلْمَلَأُ", ruku: 18 },
    { name: "Wa A‘lamu", arabic: "وَٱعْلَمُواْ", ruku: 17 },
    {
        name: "Ya Ayyuha’lladhina Aamanu La Tattakhizu",
        arabic: "يتعذرون",
        ruku: 16,
    },
    { name: "Wa Mamin Daabbah", arabic: "وَمَا مِن دَآبَّةٍ", ruku: 17 },
    { name: "Wa Ma Ubrioo", arabic: "وَمَآ أُبَرِّئُ", ruku: 19 },
    { name: "Rubama", arabic: "رُّبَمَا", ruku: 16 },
    { name: "Subhanalladhi", arabic: "سُبْحَٰنَ ٱلَّذِى", ruku: 15 },
    { name: "Qala Alam", arabic: "قَالَ أَلَمْ", ruku: 16 },
    { name: "Iqtarabat", arabic: "ٱقْتَرَبَتْ", ruku: 16 },
    { name: "Qadd Aflaha", arabic: "قَدْ أَفْلَحَ", ruku: 17 },
    {
        name: "Wa Qala’lladhina La Yarjuna",
        arabic: "وَقَالَ ٱلَّذِينَ ",
        ruku: 19,
    },
    { name: "A‘mman Khalaq", arabic: "أَمَّنْ خَلَقَ", ruku: 19 },
    { name: "Utlu Ma Oohiya", arabic: "ٱتْلُ مَآ أُوحِىَ", ruku: 18 },
    { name: "Wa Manyaqnut", arabic: "وَمَن يَقْنُتْ", ruku: 17 },
    { name: "Wa Mali", arabic: "وَمَا لِىَ", ruku: 16 },
    { name: "Faman Azlam", arabic: "فَمَنْ أَظْلَمُ", ruku: 19 },
    { name: "Elahe Yuruddu", arabic: "إِلَيْهِ يُرَدُّ", ruku: 17 },
    { name: "Ha’a Meem", arabic: "حم", ruku: 19 },
    { name: "Qala Fama Khatbukum", arabic: "قَالَ فَمَا خَطْبُكُم", ruku: 20 },
    { name: "Qadd Sami‘a’llahu", arabic: "قَدْ سَمِعَ ٱللَّهُ", ruku: 20 },
    { name: "Tabarakalladhi", arabic: "تَبَارَكَ ٱلَّذِى", ruku: 24 },
    { name: "‘Amma Yatasa’aloon", arabic: "عَمَّ ", ruku: 39 },
];

const paras = paraNames.map((p, i) => ({
    number: i + 1,
    name: p.name,
    arabic: p.arabic,
    ruku: p.ruku,
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

export default function Quran() {
    const [search, setSearch] = useState("");
    const [view, setView] = useState("para"); // "para" is now default
    const [files, setFiles] = useState([]); // store API files
    const [showReader, setShowReader] = useState(false);
    const [currentPara, setCurrentPara] = useState(null);
    const [currentTitle, setCurrentTitle] = useState("");
    const [readerUrl, setReaderUrl] = useState("");
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
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [showReader]);

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
            console.error("Error opening surah:", error);
            alert("Error loading surah PDF");
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
        const viewer = isTauri
            ? `${REMOTE_API_BASE}/pdf-viewer?file=${encodeURIComponent(
                  proxiedFinal
              )}`
            : `/pdf-viewer?file=${encodeURIComponent(proxiedFinal)}`;
        console.log("PDF viewer URLs", { proxied: proxiedFinal, viewer });
        const finalUrl = viewer;
        setCurrentPara(p.number);
        setCurrentTitle(`Para ${p.number}`);
        setReaderUrl(finalUrl);
        setShowReader(true);
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
            <div className="glass-card p-6 max-w-2xl w-full bg-base-200 text-base-content">
                {/* Toggle buttons for Surah/Para */}
                <div className="flex gap-2 mb-4">
                    <button
                        className={`btn btn-xxl ${
                            view === "para" ? "btn-primary" : "btn-ghost"
                        }`}
                        onClick={() => setView("para")}
                    >
                        Para (Juz)
                    </button>
                    <button
                        className={`btn btn-xxl ${
                            view === "surah" ? "btn-primary" : "btn-ghost"
                        }`}
                        onClick={() => setView("surah")}
                    >
                        Surah
                    </button>
                </div>
                <input
                    className="input input-bordered w-full mb-4"
                    placeholder={`Search ${
                        view === "surah" ? "Surah" : "Para"
                    } by name, number, or Arabic...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div
                    className={
                        view === "para"
                            ? "grid grid-cols-2 sm:grid-cols-4 gap-3"
                            : "grid grid-cols-1 sm:grid-cols-2 gap-3"
                    }
                >
                    {view === "surah"
                        ? filteredSurahs.map((s) => (
                              <div
                                  key={s.number}
                                  className="neumorph-card p-4 flex flex-col items-center transition hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-md cursor-pointer bg-base-100 border border-base-300"
                                  onClick={() => openSurahReader(s)}
                              >
                                  <span className="text-lg font-bold text-primary">
                                      {s.number}. {s.name}
                                  </span>
                                  <span className="text-2xl mb-1">
                                      {s.arabic}
                                  </span>
                                  <span className="text-xs text-base-content/60">
                                      Ayahs: {s.ayahs}
                                  </span>
                              </div>
                          ))
                        : filteredParas.map((p) => {
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
                                          <span className="text-base font-bold text-primary">
                                              {p.number}
                                          </span>
                                          {/* Decorative corner, optional */}
                                          <span
                                              className="text-xs text-primary"
                                              style={{ fontFamily: "serif" }}
                                          >
                                              ◤
                                          </span>
                                      </div>
                                      <span
                                          className="text-2xl mb-1 mt-2 text-center text-white"
                                          style={{ fontWeight: 600 }}
                                      >
                                          {p.arabic}
                                      </span>
                                      <div className="w-full flex justify-between items-end mt-auto">
                                          <span className="text-xs text-primary font-semibold">
                                              Ruku: {p.ruku}
                                          </span>
                                          {/* Decorative corner, optional */}
                                          <span
                                              className="text-xs text-primary"
                                              style={{ fontFamily: "serif" }}
                                          >
                                              ◢
                                          </span>
                                      </div>
                                  </div>
                              );
                          })}
                    {(view === "surah" && filteredSurahs.length === 0) ||
                    (view === "para" && filteredParas.length === 0) ? (
                        <div className="col-span-2 sm:col-span-4 text-center text-base-content/60">
                            No {view === "surah" ? "Surah" : "Para"} found.
                        </div>
                    ) : null}
                </div>
                {/* In-app full-window reader modal (mobile/tablet/web responsive) */}
                {showReader && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-80">
                        <div className="flex flex-col h-screen w-screen">
                            <header className="flex items-center justify-between px-6 py-6 bg-base-200 border-b border-base-300 ">
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
                                    title={`${
                                        currentTitle || `Para ${currentPara}`
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
