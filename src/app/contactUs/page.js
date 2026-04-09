"use client";
import React, { useState, useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaAngleLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTag } from "react-icons/fa";

export default function ContactUs() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [appVersion, setAppVersion] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    useEffect(() => {
        let mounted = true;

        async function getAppVersion() {
            try {
                // ✅ Step 1: Try Tauri native API — gives actual installed APK/IPA version
                const isTauri =
                    typeof window !== "undefined" &&
                    (window.__TAURI__ !== undefined ||
                        window.__TAURI_INTERNALS__ !== undefined);

                if (isTauri) {
                    try {
                        const tauriApp = await import("@tauri-apps/api/app");
                        const version = await tauriApp.getVersion();
                        if (mounted && version) {
                            setAppVersion(version);
                            console.log("[ContactUs] ✅ Got version from Tauri native API:", version);
                            return;
                        }
                    } catch (e) {
                        console.log("[ContactUs] Tauri getVersion failed, trying fallback:", e?.message);
                    }
                }

                // ✅ Step 2: Fallback — fetch app-config.json from Vercel
                // This always has the correct current_version matching the Play Store build
                try {
                    const CONFIG_URL = "https://raahehidayat.vercel.app/app-config.json";
                    const res = await fetch(CONFIG_URL, { cache: "no-store" });
                    if (res.ok) {
                        const cfg = await res.json();
                        if (mounted && cfg?.current_version) {
                            setAppVersion(cfg.current_version);
                            console.log("[ContactUs] ✅ Got version from app-config.json:", cfg.current_version);
                            return;
                        }
                    }
                } catch (e) {
                    console.log("[ContactUs] app-config fetch failed:", e?.message);
                }

                // ✅ Step 3: Last resort — /api/version (web browser fallback only)
                fetch("/api/version")
                    .then((res) => res.json())
                    .then((data) => {
                        if (mounted && data?.version) {
                            setAppVersion(data.version);
                            console.log("[ContactUs] Got version from API:", data.version);
                        }
                    })
                    .catch(() => { /* ignore */ });

            } catch (error) {
                console.error("[ContactUs] Error getting version:", error);
            }
        }

        getAppVersion();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="mb-8">
                    <div className="grid grid-cols-[auto_1fr_auto] items-center mb-4 gap-4">
                        <div className="flex justify-start">
                            <button
                                className="flex items-center gap-2 text-lg text-primary hover:text-primary/80 font-semibold mt-[-40]"
                                onClick={() => router.push("/")}
                                aria-label="Back to Home"
                            >
                                <FaAngleLeft /> Back
                            </button>
                        </div>

                        <div className="text-center">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-0 mr-4 mt-[-40]">
                                Contact Us
                            </h1>
                        </div>

                        <div />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="p-6">
                            <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">Motive Of Our App</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Our platform is designed to help you stay connected with Jamat Times, manage daily prayer times, and access essential Islamic resources. Experience a seamless and modern interface tailored for your spiritual journey.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="p-6">
                            <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">About Us</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Raahe Hidayat is an initiative dedicated to spreading the authentic beliefs and teachings of Ahl-e-Sunnat wa Jama‘at, based on the Qur’an and the Sunnah of the Beloved Prophet Muhammad ﷺ. Our foundation is built upon deep love and respect for all the Sahaba-e-Kiram and reverence for the Awliya-e-Kiram. Through this platform, we aim to strengthen correct Islamic beliefs, promote love for the Prophet ﷺ, and guide people towards religious knowledge, spirituality, and ethical growth.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="p-6">
                            <h3 className="text-center text-xl md:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">Get in touch</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-lg">
                                        <FaEnvelope className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground font-medium">Email</div>
                                        <div className="text-base text-card-foreground">raahehidayatindia@gmail.com</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-lg">
                                        <FaPhone className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground font-medium">Phone</div>
                                        <div className="text-base text-card-foreground">88171 88825, 96913 02711</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-lg">
                                        <FaMapMarkerAlt className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground font-medium">Address</div>
                                        <div className="text-base text-card-foreground">Bilaspur, Chhattisgarh</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center text-lg">
                                        <FaTag className="text-xl" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground font-medium">App version</div>
                                        <div className="text-base">
                                            <span className="inline-block bg-primary/10 text-primary  font-semibold">{appVersion || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link href="/privacy" className="text-primary hover:underline font-semibold">See Privacy Policy →</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="my-8" />

                <div className="rounded-lg bg-muted/30 text-card-foreground shadow-sm">
                    <div className="p-6 text-center">
                        <p className="text-muted-foreground">Developed by</p>
                        <p className="text-muted-foreground mt-1">
                            <Link href="https://www.geeksinvention.com/" target="_blank" className="text-primary hover:underline font-semibold block">
                                Geeks Invention Pvt Ltd.
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
