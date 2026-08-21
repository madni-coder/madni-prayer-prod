"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FaGooglePlay, FaApple } from "react-icons/fa";
import Image from "next/image";

const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.prayer.madni";
const IOS_URL = "https://apps.apple.com/in/app/raahe-hidayat/id6758713059";
const DISMISS_KEY = "downloadAppBanner:dismissedThisSession";

export default function DownloadAppBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const isTauri =
            typeof window !== "undefined" &&
            (window.__TAURI__ !== undefined ||
                window.__TAURI_INTERNALS__ !== undefined ||
                window.__TAURI_IPC__ !== undefined);
        const isAppFlag =
            typeof window !== "undefined" && localStorage.getItem("isApp") === "true";

        if (isTauri || isAppFlag) return;

        const isMobile =
            typeof navigator !== "undefined" &&
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (!isMobile) return;

        let dismissedThisSession = null;
        try {
            dismissedThisSession = sessionStorage.getItem(DISMISS_KEY);
        } catch {
            /* ignore */
        }

        if (dismissedThisSession === "true") return;

        setVisible(true);
    }, []);

    const handleClose = () => {
        setVisible(false);
        try {
            sessionStorage.setItem(DISMISS_KEY, "true");
        } catch {
            /* ignore */
        }
    };

    if (!visible) return null;

    return (
        <div className="relative z-20 mb-5 w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-[#101d2c]/90 via-[#0c1720]/90 to-[#0a1218]/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] px-4 py-3.5">
            <button
                onClick={handleClose}
                aria-label="Dismiss"
                className="absolute right-3 top-3 flex items-center justify-center h-6 w-6 rounded-full text-gray-400 hover:text-gray-100 hover:bg-white/10 transition-colors"
            >
                <X size={14} />
            </button>

            <div className="flex items-center gap-3 pr-6">
                <div className="shrink-0 h-11 w-11 rounded-[14px] overflow-hidden bg-white/5 ring-1 ring-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                    <Image
                        src="/mosqueLogo.png"
                        alt="Raahe Hidayat"
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="min-w-0 text-left">
                    <p className="text-[13.5px] font-semibold text-gray-100 leading-tight truncate">
                        Raahe Hidayat App
                    </p>
                    <p className="text-[11.5px] text-gray-400 leading-tight truncate">
                        Faster access, offline &amp; notifications
                    </p>
                </div>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2">
                <a
                    href={ANDROID_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-black border border-white/10 px-2.5 py-2 hover:border-white/20 hover:bg-black/80 transition-colors"
                >
                    <FaGooglePlay size={15} className="text-white shrink-0" />
                    <span className="flex flex-col items-start leading-[1.05]">
                        <span className="text-[8px] text-gray-400 tracking-wide">GET IT ON</span>
                        <span className="text-[11.5px] font-semibold text-white">Google Play</span>
                    </span>
                </a>

                <a
                    href={IOS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-black border border-white/10 px-2.5 py-2 hover:border-white/20 hover:bg-black/80 transition-colors"
                >
                    <FaApple size={16} className="text-white shrink-0" />
                    <span className="flex flex-col items-start leading-[1.05]">
                        <span className="text-[8px] text-gray-400 tracking-wide">Download on the</span>
                        <span className="text-[11.5px] font-semibold text-white">App Store</span>
                    </span>
                </a>
            </div>
        </div>
    );
}
