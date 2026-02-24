"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa";

export default function MasjidCommitteeLogin() {
    const [masjidId, setMasjidId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const router = useRouter();
    const [initializing, setInitializing] = useState(true);
    const [theme, setTheme] = useState("dark");

    // If user already logged in (saved in localStorage), redirect to event updates
    useEffect(() => {
        if (typeof window === "undefined") {
            setInitializing(false);
            return;
        }
        try {
            const storedId = window.localStorage.getItem("masjidCommittee_masjidId");
            const storedAuth = window.localStorage.getItem("masjidCommittee_auth");
            if (storedId && storedAuth) {
                router.replace(`/committee/eventUpdates?masjidId=${encodeURIComponent(storedId)}`);
                // keep initializing true while redirecting
            } else {
                setInitializing(false);
            }
        } catch (e) {
            setInitializing(false);
        }
    }, [router]);

    // initialize theme from localStorage or prefers-color-scheme
    useEffect(() => {
        try {
            if (typeof window === "undefined") return;
            const stored = window.localStorage.getItem("site-theme");
            if (stored) setTheme(stored);
            else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
            else setTheme("light");
        } catch (e) {
            setTheme("dark");
        }
    }, []);

    useEffect(() => {
        try {
            if (typeof document !== "undefined") {
                // Use DaisyUI theme via data-theme attribute on <html>
                document.documentElement.setAttribute("data-theme", theme);
                window.localStorage.setItem("site-theme", theme);
            }
        } catch (e) { }
    }, [theme]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const res = await apiClient.post(`/api/masjid-committee/login`, { masjidId, password });
            if (res.status === 200) {
                setMessage({ type: "success", text: "Login successful" });
                try {
                    if (typeof window !== "undefined") {
                        // store the returned payload (authenticated + data)
                        window.localStorage.setItem(
                            "masjidCommittee_auth",
                            JSON.stringify(res.data)
                        );
                        window.localStorage.setItem(
                            "masjidCommittee_masjidId",
                            String(masjidId)
                        );
                    }
                } catch (e) {
                    // ignore storage errors
                }
                router.push(`/committee/eventUpdates?masjidId=${masjidId}`);
                return;
            } else {
                setMessage({ type: "error", text: res.data?.error || "Login failed" });
            }
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) setMessage({ type: "error", text: "Masjid not found" });
            else if (status === 401) setMessage({ type: "error", text: "Invalid credentials" });
            else setMessage({ type: "error", text: err?.message || "Login failed" });
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-[#09152a] p-6">
                <div className="text-center">
                    <div className="mb-4">
                        <span className="loading loading-spinner loading-lg text-white"></span>
                    </div>
                    <div className="text-white">Checking session…</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#021029] to-[#061628] text-white">

            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
                <button
                    className="flex items-center gap-2 mb-2 text-xl text-primary hover:text-green-600 font-semibold p-0 h-6 leading-none"
                    onClick={() => router.push("/")}
                    aria-label="Back to Home"
                >
                    <FaAngleLeft size={26} /> Back
                </button>
                <div className="card bg-[rgba(255,255,255,0.04)] shadow-xl rounded-xl p-6 sm:p-8 text-white mb-100 mt-5">
                    <div className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-semibold">Only For Masjid Committee Login</h1>
                    </div>



                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-white mb-2">Login Id</span>
                            </label>
                            <input
                                type="number"
                                value={masjidId}
                                onChange={(e) => setMasjidId(e.target.value)}
                                className="input input-bordered input-primary w-full bg-transparent text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-white mb-2">Password</span>
                            </label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input input-bordered input-primary w-full bg-transparent text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
                            <button
                                type="submit"
                                className="btn btn-primary w-full sm:w-auto"
                                disabled={loading}
                            >
                                {loading ? "Checking..." : "Login"}
                            </button>

                            <div className="text-sm text-white/80">
                                <span>If you forgot your password </span>
                                <Link href="/contactUs" className="link link-primary">contact us</Link>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-2 rounded ${message.type === "error" ? "bg-red-600/20 text-red-100" : "bg-green-600/20 text-green-100"}`}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </main>
    );
}
