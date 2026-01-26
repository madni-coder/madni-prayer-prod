"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
        const num = Number(count);
        if (!selected) {
            showToast({ type: "error", text: "Please select a Zikr option." });
            return;
        }
        if (!count || Number.isNaN(num) || num <= 0 || !Number.isInteger(num)) {
            showToast({ type: "error", text: "Please enter a valid positive whole number for how many times." });
            return;
        }

        showToast({ type: "success", text: `Registered ${selected} — ${num} time(s).` });
        setSelected("");
        setCount("");
    }

    function showToast(t) {
        setToast(t);
        if (!t) return;
        setTimeout(() => setToast(null), 2000);
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
                            className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                            onClick={() => router.push("/")}
                            aria-label="Back to Home"
                            style={{ alignSelf: "flex-start" }}
                        >
                            <FaAngleLeft /> Back
                        </button>
                        <h1 className="text-2xl sm:text-3xl  font-semibold bg-gradient-to-r from-green-400 via-green-200 to-white bg-clip-text text-transparent">
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
                                <span className="label-text">Dropdown</span>
                            </label>
                            <select value={selected} onChange={(e) => setSelected(e.target.value)} className="select select-bordered w-full" aria-label="Select Zikr">
                                <option value="">Select Zikr</option>
                                {ZIKR_OPTIONS.map((o) => (
                                    <option key={o} value={o}>
                                        {o}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="label">
                                <span className="label-text">How many times</span>
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
                            <button className="btn btn-primary w-full sm:w-auto" type="submit">
                                Register
                            </button>
                        </div>
                    </div>
                </form>
                <Toast toast={toast} isDark={typeof window !== "undefined" ? effectiveTheme() === "dark" : false} />
            </div>
        </div>
    );
}

function Toast({ toast, isDark }) {
    if (!toast) return null;
    if (typeof document === "undefined") return null;

    const content = (
        <div
            className="fixed left-1/2 transform -translate-x-1/2 bottom-6 z-50 pointer-events-none"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div
                role="status"
                aria-live="polite"
                className={`max-w-md mx-auto px-4 py-2 rounded shadow pointer-events-auto transition-opacity duration-200 ease-out ${toast.type === "error"
                        ? isDark
                            ? "bg-red-800 text-white"
                            : "bg-red-100 text-red-800"
                        : isDark
                            ? "bg-green-800 text-white"
                            : "bg-green-100 text-green-800"
                    }`}
            >
                {toast.text}
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
