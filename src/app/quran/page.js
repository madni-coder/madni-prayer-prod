"use client";
import React, { useState } from "react";

// Sample Surah data (in real app, fetch from API or static JSON)
const surahs = [
    { number: 1, name: "Al-Fatiha", arabic: "الفاتحة", ayahs: 7 },
    { number: 2, name: "Al-Baqarah", arabic: "البقرة", ayahs: 286 },
    { number: 3, name: "Al-Imran", arabic: "آل عمران", ayahs: 200 },
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

export default function Quran() {
    const [search, setSearch] = useState("");
    const [view, setView] = useState("para"); // "para" is now default

    // Filter logic for Surah and Para
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
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in bg-base-100">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Quran
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
                                  className="neumorph-card p-4 flex flex-col items-center transition hover:scale-105 cursor-pointer bg-base-100 border border-base-300"
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
                        : filteredParas.map((p) => (
                              <div
                                  key={p.number}
                                  className="neumorph-card flex flex-col items-center justify-between transition hover:scale-105 cursor-pointer bg-base-100 border border-primary"
                                  style={{
                                      minHeight: 140,
                                      height: 140,
                                      maxHeight: 140,
                                      minWidth: 0,
                                      width: "100%",
                                      // Removed hardcoded background and color
                                      borderRadius: 12,
                                      // Use theme border color
                                      // border: "2px solid #d32f2f", // removed
                                      position: "relative",
                                      padding: 12,
                                  }}
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
                                      <span className="text-xs text-primary">
                                          {p.ruku}
                                      </span>
                                      <span className="bg-primary text-primary-content text-xs px-2 py-1 rounded-full ml-1">
                                          Total Ruku
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
                          ))}
                    {(view === "surah" && filteredSurahs.length === 0) ||
                    (view === "para" && filteredParas.length === 0) ? (
                        <div className="col-span-2 sm:col-span-4 text-center text-base-content/60">
                            No {view === "surah" ? "Surah" : "Para"} found.
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
