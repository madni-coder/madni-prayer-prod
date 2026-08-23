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

// Convert semantic version to comparable integer (e.g., "9.3.1" -> 9003001)
function versionToCode(version) {
    try {
        const parts = String(version)
            .split(".")
            .map((n) => parseInt(n, 10) || 0);
        const major = parts[0] || 0;
        const minor = parts[1] || 0;
        const patch = parts[2] || 0;
        return major * 1000000 + minor * 1000 + patch;
    } catch {
        return 0;
    }
}

async function getInstalledVersion() {
    // Tauri API first (accurate in production builds)
    try {
        const tauriApp = await import("@tauri-apps/api/app");
        const v = await tauriApp.getVersion();
        if (v) return v;
    } catch {
        /* fall through */
    }
    // env var override
    if (process.env.NEXT_PUBLIC_APP_VERSION) {
        return process.env.NEXT_PUBLIC_APP_VERSION;
    }
    // window var override (useful for manual testing)
    if (typeof window !== "undefined" && window.__APP_VERSION) {
        return window.__APP_VERSION;
    }
    return null;
}

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

                // ⚠️ TEMP DEBUG — remove when testing is done ⚠️
                // Desktop browser tabs have neither a Tauri OS plugin nor a
                // mobile user agent, so platform detection would otherwise
                // return null and the banner would never render. In dev,
                // default to "android" (or pass ?platform=ios in the URL)
                // so you can test straight from a normal desktop tab.
                if (process.env.NEXT_PUBLIC_TAURI_BUILD !== "1") {
                    const forced = new URLSearchParams(
                        window.location.search,
                    ).get("platform");
                    if (forced === "ios" || forced === "android") return forced;
                    return "android";
                }

                return null;
            }
        }

        async function run() {
            const os = await detectPlatform();
            if (!mounted || !os) return;
            setPlatform(os);

            try {
                // ⚠️ TEMP DEBUG — remove when testing is done ⚠️
                // In a dev run (npm run dev / android:dev / ios:dev — none of
                // these set NEXT_PUBLIC_TAURI_BUILD), fetch app-config.json
                // relative to whatever host is currently serving the app
                // (localhost:3000 or the LAN IP set-dev-url.js wrote into
                // tauri.conf.json's devUrl). That way editing
                // public/app-config.json locally shows up on next reload —
                // no deploy needed. Production builds still use the
                // hardcoded Vercel URL.
                const isDev = process.env.NEXT_PUBLIC_TAURI_BUILD !== "1";
                const configUrl =
                    process.env.NEXT_PUBLIC_UPDATE_CONFIG_URL ||
                    (isDev && typeof window !== "undefined"
                        ? `${window.location.origin}/app-config.json`
                        : HARDCODED_CONFIG_URL);

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

                // ⚠️ TEMP DEBUG OVERRIDE — remove when testing is done ⚠️
                // Lets you fake the "installed version" from app-config.json
                // (debug_installed_version_android / _ios) so you can test
                // the banner without rebuilding the native app each time.
                const debugInstalledVersion =
                    os === "ios"
                        ? cfg?.debug_installed_version_ios
                        : cfg?.debug_installed_version_android;

                // Only show if the installed app is actually behind the
                // latest version. If we can't determine the installed
                // version (e.g. running outside the native app), skip the
                // banner rather than risk showing it to an up-to-date user.
                const installedVersion =
                    debugInstalledVersion || (await getInstalledVersion());
                if (!mounted || !installedVersion || !version) return;
                if (versionToCode(installedVersion) >= versionToCode(version)) {
                    return;
                }

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

// In-flow (not fixed) so it pushes page content down instead of floating
// on top of it — sits neatly under the nav bar rather than overlapping it.
const bannerWrapStyle = {
    position: "relative",
    zIndex: 40,
    width: "100%",
    padding: "clamp(6px, 1.5vw, 12px) clamp(10px, 2.5vw, 16px)",
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
    padding: "clamp(8px, 2vw, 12px) clamp(12px, 2.5vw, 18px)",
    borderRadius: "10px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
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
