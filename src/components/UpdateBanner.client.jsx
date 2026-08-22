"use client";
import React, { useEffect, useState } from "react";

// ✅ IMPORTANT: This must always point to your Vercel-hosted app-config.json
// On Android (Tauri), window.location.origin is NOT Vercel — it's a local asset
// server like "https://tauri.localhost". So we MUST use an absolute URL here.
const HARDCODED_CONFIG_URL = "https://raahehidayat.vercel.app/app-config.json";

// Fallback store links (used if app-config.json doesn't provide one)
const ANDROID_STORE_URL =
    "https://play.google.com/store/apps/details?id=com.prayer.madni";
const IOS_STORE_URL =
    "https://apps.apple.com/in/app/raahe-hidayat/id6758713059";

const DISMISS_KEY_PREFIX = "update_banner_dismissed_";

export default function UpdateBanner() {
    const [visible, setVisible] = useState(false);
    const [platform, setPlatform] = useState(null); // "android" | "ios"
    const [latestVersion, setLatestVersion] = useState("");
    const [storeUrl, setStoreUrl] = useState("");

    useEffect(() => {
        let mounted = true;

        async function detectPlatform() {
            // Prefer Tauri's OS plugin when running inside the native app
            try {
                const { platform: getPlatform } = await import(
                    "@tauri-apps/plugin-os"
                );
                const os = await getPlatform();
                if (os === "ios") return "ios";
                if (os === "android") return "android";
                return null;
            } catch {
                // Fallback for mobile web / dev preview
                if (typeof navigator === "undefined") return null;
                if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return "ios";
                if (/Android/.test(navigator.userAgent)) return "android";
                return null;
            }
        }

        async function run() {
            const os = await detectPlatform();
            if (!mounted || !os) return;
            setPlatform(os);

            try {
                const configUrl =
                    process?.env?.NEXT_PUBLIC_UPDATE_CONFIG_URL ||
                    HARDCODED_CONFIG_URL;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                let res;
                try {
                    res = await fetch(configUrl, {
                        cache: "no-store",
                        signal: controller.signal,
                    });
                } finally {
                    clearTimeout(timeoutId);
                }
                if (!res.ok || !mounted) return;
                const cfg = await res.json();

                const showFlag =
                    os === "ios"
                        ? cfg?.ios_update_banner
                        : cfg?.android_update_banner;

                if (!showFlag) return;

                const version =
                    (os === "ios"
                        ? cfg?.latest_version_ios
                        : cfg?.latest_version_android) ||
                    cfg?.current_version ||
                    "";

                const link =
                    (os === "ios"
                        ? cfg?.ios_store_url || cfg?.app_store_url
                        : cfg?.android_store_url ||
                          cfg?.play_store_url ||
                          cfg?.store_url) ||
                    (os === "ios" ? IOS_STORE_URL : ANDROID_STORE_URL);

                // Don't re-show a banner the user already dismissed THIS app
                // session (sessionStorage survives backgrounding/foregrounding
                // since the webview stays alive, but is cleared when the app
                // process is fully killed and relaunched — i.e. a fresh open).
                const dismissKey = `${DISMISS_KEY_PREFIX}${os}_${version}`;
                let alreadyDismissed = false;
                try {
                    alreadyDismissed =
                        typeof window !== "undefined" &&
                        window.sessionStorage.getItem(dismissKey) === "1";
                } catch {
                    /* ignore storage errors */
                }

                if (alreadyDismissed) return;

                setLatestVersion(version);
                setStoreUrl(link);
                setVisible(true);
            } catch {
                /* silently ignore — banner is non-critical */
            }
        }

        run();

        return () => {
            mounted = false;
        };
    }, []);

    const handleDismiss = () => {
        try {
            if (platform) {
                window.sessionStorage.setItem(
                    `${DISMISS_KEY_PREFIX}${platform}_${latestVersion}`,
                    "1",
                );
            }
        } catch {
            /* ignore storage errors */
        }
        setVisible(false);
    };

    const handleUpdate = async () => {
        if (!storeUrl) return;
        try {
            const { openUrl } = await import("@tauri-apps" + "/plugin-opener");
            await openUrl(storeUrl);
        } catch {
            window.open(storeUrl, "_blank");
        }
    };

    if (!visible) return null;

    return (
        <div style={bannerWrapStyle} role="alert">
            <div style={bannerInnerStyle}>
                <div style={textWrapStyle}>
                    <span style={titleStyle}>Update available</span>
                    <span style={subtitleStyle}>
                        {latestVersion
                            ? `Version ${latestVersion} is ready — update now for the latest features.`
                            : "A new version is ready — update now for the latest features."}
                    </span>
                </div>

                <div style={actionsWrapStyle}>
                    <button
                        type="button"
                        style={updateBtnStyle}
                        onClick={handleUpdate}
                    >
                        Update
                    </button>
                    <button
                        type="button"
                        aria-label="Dismiss update banner"
                        style={closeBtnStyle}
                        onClick={handleDismiss}
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

const bannerWrapStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    padding: "clamp(8px, 2vw, 16px)",
    boxSizing: "border-box",
};

const bannerInnerStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "clamp(8px, 2vw, 16px)",
    width: "min(720px, 100%)",
    margin: "0 auto",
    background: "linear-gradient(135deg, #16a34a, #0f766e)",
    color: "#fff",
    padding: "clamp(10px, 2.5vw, 16px) clamp(14px, 3vw, 20px)",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
};

const textWrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: "1 1 220px",
    minWidth: 0,
};

const titleStyle = {
    fontWeight: 700,
    fontSize: "clamp(13px, 3.5vw, 15px)",
    lineHeight: 1.3,
};

const subtitleStyle = {
    fontSize: "clamp(11px, 3vw, 13px)",
    opacity: 0.92,
    lineHeight: 1.35,
    wordBreak: "break-word",
};

const actionsWrapStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
    marginLeft: "auto",
};

const updateBtnStyle = {
    background: "#fff",
    color: "#0f766e",
    border: "none",
    padding: "clamp(6px, 1.8vw, 9px) clamp(12px, 3vw, 16px)",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: "clamp(12px, 3vw, 14px)",
    cursor: "pointer",
    whiteSpace: "nowrap",
};

const closeBtnStyle = {
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    border: "none",
    width: 28,
    height: 28,
    minWidth: 28,
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};
