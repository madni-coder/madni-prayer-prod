"use client";
import React, { useEffect, useState } from "react";

// ✅ IMPORTANT: This must always point to your Vercel-hosted app-config.json
// On Android (Tauri), window.location.origin is NOT Vercel — it's a local asset
// server like "https://tauri.localhost". So we MUST use an absolute URL here.
const HARDCODED_CONFIG_URL = "https://raahehidayat.vercel.app/app-config.json";

export default function ForceUpdateChecker() {
    const [blocked, setBlocked] = useState(false);
    const [message, setMessage] = useState("");
    const [isIosState, setIsIosState] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);

    useEffect(() => {
        let mounted = true;
        const debugLog = [];

        const addDebug = (msg) => {
            console.log(msg);
            debugLog.push(msg);
        };

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
                    addDebug(
                        "[ForceUpdate] Not running in Tauri — skipping check.",
                    );
                    return;
                }

                // ✅ Detect platform: iOS or Android
                let isIosLocal = false;
                try {
                    const { platform } = await import("@tauri-apps/plugin-os");
                    const os = await platform();
                    isIosLocal = os === "ios";
                    addDebug("[ForceUpdate] Platform: " + os);
                } catch {
                    // Fallback: use userAgent if Tauri OS plugin unavailable
                    isIosLocal =
                        typeof navigator !== "undefined" &&
                        /iPad|iPhone|iPod/.test(navigator.userAgent);
                    addDebug(
                        "[ForceUpdate] OS plugin unavailable, userAgent iOS: " +
                            isIosLocal,
                    );
                }
                // persist platform for the Update button (outside effect scope)
                try {
                    setIsIosState(isIosLocal);
                } catch (e) {
                    /* ignore */
                }

                // Get current version via multiple fallback methods
                let currentVersion = null;
                let versionSource = "none";

                // Try Tauri API first (works in production APK)
                try {
                    const tauriApp = await import("@tauri-apps/api/app");
                    currentVersion = await tauriApp.getVersion();
                    versionSource = "tauri-api";
                    addDebug(
                        "[ForceUpdate] Got version from Tauri API: " +
                            currentVersion,
                    );
                } catch (e1) {
                    addDebug(
                        "[ForceUpdate] Tauri getVersion failed: " +
                            e1?.message,
                    );
                }

                // Fallback 1: env variable (set in .env as NEXT_PUBLIC_APP_VERSION)
                if (!currentVersion) {
                    currentVersion =
                        process?.env?.NEXT_PUBLIC_APP_VERSION || null;
                    if (currentVersion) {
                        versionSource = "env-var";
                        addDebug(
                            "[ForceUpdate] Version from env: " +
                                currentVersion,
                        );
                    }
                }

                // Fallback 2: window variable (can be set manually for testing)
                if (!currentVersion && typeof window !== "undefined") {
                    currentVersion = window?.__APP_VERSION || null;
                    if (currentVersion) {
                        versionSource = "window-var";
                        addDebug(
                            "[ForceUpdate] Version from window: " +
                                currentVersion,
                        );
                    }
                }

                // ⚠️ If still no version found — skip force update check entirely
                // This prevents false positives when the app can't determine its own version
                if (!currentVersion) {
                    addDebug(
                        "[ForceUpdate] ⚠️ No version found from any source! Skipping force update check to avoid false positive.",
                    );
                    // Show debug info temporarily so dev can see what's happening
                    if (mounted) {
                        setDebugInfo(debugLog.join("\n"));
                        setTimeout(() => {
                            if (mounted) setDebugInfo(null);
                        }, 15000);
                    }
                    return;
                }

                const currentCode = versionToCode(currentVersion);
                addDebug(
                    "[ForceUpdate] Current version: " +
                        currentVersion +
                        " (code: " +
                        currentCode +
                        ", source: " +
                        versionSource +
                        ")",
                );

                // ✅ Always use the absolute Vercel URL — env var is an override.
                // Never use window.location.origin here: on Android Tauri it
                // resolves to the local asset server, NOT your Vercel deployment.
                const configUrl =
                    process?.env?.NEXT_PUBLIC_UPDATE_CONFIG_URL ||
                    HARDCODED_CONFIG_URL;

                addDebug("[ForceUpdate] Fetching config from: " + configUrl);

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
                    addDebug(
                        "[ForceUpdate] Config fetch failed: " + res.status,
                    );
                    return;
                }
                const cfg = await res.json();
                addDebug(
                    "[ForceUpdate] Config loaded: " + JSON.stringify(cfg),
                );

                // Support OS-specific semantic min versions and numeric codes first
                let minCode = 0;
                let minVersionUsed = "";
                if (isIosLocal) {
                    if (cfg?.min_version_ios) {
                        minCode = versionToCode(cfg.min_version_ios);
                        minVersionUsed = cfg.min_version_ios + " (ios-specific)";
                        addDebug(
                            "[ForceUpdate] Min iOS version: " +
                                cfg.min_version_ios +
                                " -> code: " +
                                minCode,
                        );
                    } else if (cfg?.min_version_code_ios) {
                        minCode = parseInt(cfg.min_version_code_ios, 10) || 0;
                        minVersionUsed = "code:" + minCode + " (ios-specific)";
                        addDebug(
                            "[ForceUpdate] Min iOS version code: " + minCode,
                        );
                    }
                } else {
                    if (cfg?.min_version_android) {
                        minCode = versionToCode(cfg.min_version_android);
                        minVersionUsed = cfg.min_version_android + " (android-specific)";
                        addDebug(
                            "[ForceUpdate] Min Android version: " +
                                cfg.min_version_android +
                                " -> code: " +
                                minCode,
                        );
                    } else if (cfg?.min_version_code_android) {
                        minCode = parseInt(cfg.min_version_code_android, 10) || 0;
                        minVersionUsed = "code:" + minCode + " (android-specific)";
                        addDebug(
                            "[ForceUpdate] Min Android version code: " +
                                minCode,
                        );
                    }
                }

                // Fallback to generic keys if OS-specific keys not provided
                if (!minCode) {
                    if (cfg?.min_version) {
                        minCode = versionToCode(cfg.min_version);
                        minVersionUsed = cfg.min_version + " (generic)";
                        addDebug(
                            "[ForceUpdate] Min version (generic): " +
                                cfg.min_version +
                                " -> code: " +
                                minCode,
                        );
                    } else if (cfg?.min_version_code) {
                        minCode = parseInt(cfg.min_version_code, 10) || 0;
                        minVersionUsed = "code:" + minCode + " (generic)";
                        addDebug(
                            "[ForceUpdate] Min version code: " + minCode,
                        );
                    }
                }

                // ✅ Pick correct store URL based on platform
                const storeUrl = isIosLocal
                    ? cfg?.ios_store_url ||
                        cfg?.app_store_url ||
                        cfg?.storeUrl ||
                        null
                    : cfg?.store_url ||
                        cfg?.play_store_url ||
                        cfg?.storeUrl ||
                        null;

                addDebug(
                    "[ForceUpdate] Platform: " +
                        (isIosLocal ? "iOS" : "Android") +
                        " | Store URL: " +
                        storeUrl,
                );

                const shouldBlock = currentCode < minCode;
                addDebug(
                    "[ForceUpdate] Comparison: app=" +
                        currentVersion +
                        "(" +
                        currentCode +
                        ") vs min=" +
                        minVersionUsed +
                        "(" +
                        minCode +
                        ") => block=" +
                        shouldBlock,
                );

                if (shouldBlock && mounted) {
                    addDebug("[ForceUpdate] BLOCKING: Version too old!");
                    setMessage(
                        cfg?.message ||
                            "A new mandatory update is required to continue using the app.",
                    );
                    setBlocked(true);
                    // Show debug info on the force update screen
                    setDebugInfo(debugLog.join("\n"));
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
                    addDebug(
                        "[ForceUpdate] Version check passed. App is up to date.",
                    );
                }
            } catch (err) {
                console.error("[ForceUpdate] Error during version check:", err);
                addDebug("[ForceUpdate] ERROR: " + err?.message);
                // Show debug info temporarily on error too
                if (mounted) {
                    setDebugInfo(debugLog.join("\n"));
                    setTimeout(() => {
                        if (mounted) setDebugInfo(null);
                    }, 15000);
                }
            }
        }

        runCheck();

        return () => {
            mounted = false;
        };
    }, []);

    // Show debug info overlay when not blocked but debug info is available
    // (e.g., when version detection failed and we skipped the check)
    if (!blocked && debugInfo) {
        return (
            <div style={{
                position: "fixed",
                bottom: 10,
                left: 10,
                right: 10,
                background: "rgba(0,0,0,0.85)",
                color: "#0f0",
                padding: 10,
                borderRadius: 8,
                fontSize: 10,
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                zIndex: 99998,
                maxHeight: "30vh",
                overflow: "auto",
            }}>
                <strong>🔍 ForceUpdate Debug (auto-hides):</strong>
                {"\n" + debugInfo}
            </div>
        );
    }

    if (!blocked) return null;

    return (
        <div style={overlayStyle}>
            <div style={boxStyle}>
                <h2 style={{ marginTop: 0 }}>Update Required</h2>
                <p>{message}</p>
                {debugInfo && (
                    <details style={{ marginBottom: 10 }}>
                        <summary style={{ cursor: "pointer", fontSize: 12, color: "#888" }}>
                            Debug Info (tap to expand)
                        </summary>
                        <pre style={{
                            fontSize: 9,
                            color: "#0f0",
                            background: "#000",
                            padding: 8,
                            borderRadius: 4,
                            whiteSpace: "pre-wrap",
                            maxHeight: "30vh",
                            overflow: "auto",
                            marginTop: 6,
                        }}>
                            {debugInfo}
                        </pre>
                    </details>
                )}
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
                                                                // determine platform for button click: use cached state if available
                                                                const isIosForClick =
                                                                        typeof isIosState === "boolean"
                                                                                ? isIosState
                                                                                : typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

                                                                const storeUrl = isIosForClick
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
