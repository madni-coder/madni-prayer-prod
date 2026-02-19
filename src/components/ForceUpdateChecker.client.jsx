"use client";
import React, { useEffect, useState } from "react";

// ✅ IMPORTANT: This must always point to your Vercel-hosted app-config.json
// On Android (Tauri), window.location.origin is NOT Vercel — it's a local asset
// server like "https://tauri.localhost". So we MUST use an absolute URL here.
const HARDCODED_CONFIG_URL = "https://raahehidayat.vercel.app/app-config.json";

export default function ForceUpdateChecker() {
    const [blocked, setBlocked] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let mounted = true;

        // Convert semantic version to comparable integer (e.g., "5.2.0" -> 5002000)
        const versionToCode = (version) => {
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
        };

        async function runCheck() {
            try {
                // ✅ Only run inside Tauri app — skip in browser/web
                const isTauri =
                    typeof window !== "undefined" &&
                    (window.__TAURI__ !== undefined ||
                        window.__TAURI_INTERNALS__ !== undefined);
                if (!isTauri) {
                    console.log(
                        "[ForceUpdate] Not running in Tauri — skipping check.",
                    );
                    return;
                }

                // ✅ Detect platform: iOS or Android
                let isIos = false;
                try {
                    const { platform } = await import("@tauri-apps/plugin-os");
                    const os = await platform();
                    isIos = os === "ios";
                    console.log("[ForceUpdate] Platform:", os);
                } catch {
                    // Fallback: use userAgent if Tauri OS plugin unavailable
                    isIos =
                        typeof navigator !== "undefined" &&
                        /iPad|iPhone|iPod/.test(navigator.userAgent);
                    console.log(
                        "[ForceUpdate] OS plugin unavailable, userAgent iOS:",
                        isIos,
                    );
                }

                // Get current version via Tauri if available, otherwise fallback to env/window value
                let currentVersion = null;

                // Try Tauri API first (works in production APK)
                try {
                    const tauriApp = await import("@tauri-apps/api/app");
                    currentVersion = await tauriApp.getVersion();
                    console.log(
                        "[ForceUpdate] Got version from Tauri:",
                        currentVersion,
                    );
                } catch (e1) {
                    console.log(
                        "[ForceUpdate] Tauri getVersion failed:",
                        e1?.message,
                    );
                }

                // Fallback 1: env variable (set in .env as NEXT_PUBLIC_APP_VERSION)
                if (!currentVersion) {
                    currentVersion =
                        process?.env?.NEXT_PUBLIC_APP_VERSION || null;
                    if (currentVersion)
                        console.log(
                            "[ForceUpdate] Version from env:",
                            currentVersion,
                        );
                }

                // Fallback 2: window variable (can be set manually for testing)
                if (!currentVersion && typeof window !== "undefined") {
                    currentVersion = window?.__APP_VERSION || null;
                    if (currentVersion)
                        console.log(
                            "[ForceUpdate] Version from window:",
                            currentVersion,
                        );
                }

                // ⚠️ If still no version: DO NOT SKIP — assume very old version
                // so the check always runs on devices where Tauri API fails
                if (!currentVersion) {
                    console.log(
                        "[ForceUpdate] ⚠️ No version found! Assuming '0.0.0' so check always runs.",
                    );
                    currentVersion = "0.0.0";
                }

                const currentCode = versionToCode(currentVersion);
                console.log(
                    "[ForceUpdate] Current version code:",
                    currentCode,
                    "from version:",
                    currentVersion,
                );

                // ✅ Always use the absolute Vercel URL — env var is an override.
                // Never use window.location.origin here: on Android Tauri it
                // resolves to the local asset server, NOT your Vercel deployment.
                const configUrl =
                    process?.env?.NEXT_PUBLIC_UPDATE_CONFIG_URL ||
                    HARDCODED_CONFIG_URL;

                console.log("[ForceUpdate] Fetching config from:", configUrl);

                // Add a timeout so a bad network doesn't hang the app forever
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
                if (!res.ok) {
                    console.log(
                        "[ForceUpdate] Config fetch failed:",
                        res.status,
                    );
                    return;
                }
                const cfg = await res.json();
                console.log("[ForceUpdate] Config loaded:", cfg);

                // Support both min_version (semantic) and min_version_code (integer)
                let minCode = 0;
                if (cfg?.min_version) {
                    minCode = versionToCode(cfg.min_version);
                    console.log(
                        "[ForceUpdate] Min version from semantic:",
                        cfg.min_version,
                        "-> code:",
                        minCode,
                    );
                } else if (cfg?.min_version_code) {
                    minCode = parseInt(cfg.min_version_code, 10) || 0;
                    console.log(
                        "[ForceUpdate] Min version code from config:",
                        minCode,
                    );
                }

                // ✅ Pick correct store URL based on platform
                const storeUrl = isIos
                    ? cfg?.ios_store_url ||
                      cfg?.app_store_url ||
                      cfg?.storeUrl ||
                      null
                    : cfg?.store_url ||
                      cfg?.play_store_url ||
                      cfg?.storeUrl ||
                      null;

                console.log(
                    "[ForceUpdate] Platform:",
                    isIos ? "iOS" : "Android",
                    "| Store URL:",
                    storeUrl,
                );

                console.log(
                    "[ForceUpdate] Comparison:",
                    currentCode,
                    "<",
                    minCode,
                    "=",
                    currentCode < minCode,
                );

                if (currentCode < minCode && mounted) {
                    console.log("[ForceUpdate] BLOCKING: Version too old!");
                    setMessage(
                        cfg?.message ||
                            "A new mandatory update is required to continue using the app.",
                    );
                    setBlocked(true);
                    if (storeUrl) {
                        try {
                            const { openUrl } = await import(
                                "@tauri-apps" + "/plugin-opener"
                            );
                            await openUrl(storeUrl);
                        } catch (e) {
                            window.open(storeUrl, "_blank");
                        }
                    }
                } else {
                    console.log(
                        "[ForceUpdate] Version check passed. App is up to date.",
                    );
                }
            } catch (err) {
                console.error("[ForceUpdate] Error during version check:", err);
            }
        }

        runCheck();

        return () => {
            mounted = false;
        };
    }, []);

    if (!blocked) return null;

    return (
        <div style={overlayStyle}>
            <div style={boxStyle}>
                <h2 style={{ marginTop: 0 }}>Update Required</h2>
                <p>{message}</p>
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "flex-end",
                    }}
                >
                    <button
                        style={btnStyle}
                        onClick={async () => {
                            try {
                                const configUrl =
                                    process?.env
                                        ?.NEXT_PUBLIC_UPDATE_CONFIG_URL ||
                                    HARDCODED_CONFIG_URL;
                                const res = await fetch(configUrl, {
                                    cache: "no-store",
                                });
                                const cfg = await res.json();
                                const storeUrl = isIos
                                    ? cfg?.ios_store_url ||
                                      cfg?.app_store_url ||
                                      cfg?.storeUrl ||
                                      null
                                    : cfg?.store_url ||
                                      cfg?.play_store_url ||
                                      cfg?.storeUrl ||
                                      null;
                                if (storeUrl) {
                                    try {
                                        const { openUrl } = await import(
                                            "@tauri-apps" + "/plugin-opener"
                                        );
                                        await openUrl(storeUrl);
                                    } catch (e) {
                                        window.open(storeUrl, "_blank");
                                    }
                                }
                            } catch (e) {
                                // ignore
                            }
                        }}
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
};

const boxStyle = {
    background: "#0b1220",
    color: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "min(600px, 92%)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
};

const btnStyle = {
    background: "#16a34a",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
};
