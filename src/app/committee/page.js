"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";
import Link from "next/link";

export default function MasjidCommitteeLogin() {
    const [masjidId, setMasjidId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const router = useRouter();
    const [initializing, setInitializing] = useState(true);

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
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-[#09152a] p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">Masjid Committee Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Masjid Id</label>
                        <input
                            type="number"
                            value={masjidId}
                            onChange={(e) => setMasjidId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            disabled={loading}
                        >
                            {loading ? "Checking..." : "Login"}
                        </button>
                        <div className="text-sm">
                            <span>If you forgot your password </span>
                            <Link href="/contactUs" className="text-blue-600 underline">contact us</Link>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-2 rounded ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                            {message.text}
                        </div>
                    )}
                </form>
            </div>
        </main>
    );
}
