"use client";
import React, { useEffect, useState } from "react";

export default function ForceUpdateChecker() {
    const [blocked, setBlocked] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let mounted = true;

        async function runCheck() {
            try {
                // Get current version via Tauri if available, otherwise fallback to env/window value
                let currentVersion = null;
                try {
                    const { app } = await import(
                        "@" + "tauri-apps" + "/api/app"
                    );
                    currentVersion = await app.getVersion();
                } catch (e) {
                    currentVersion =
                        process?.env?.NEXT_PUBLIC_APP_VERSION ||
                        window?.__APP_VERSION ||
                        null;
                }

                if (!currentVersion) return;

                const currentCode =
                    parseInt(String(currentVersion).split(".")[0], 10) || 0;

                const configUrl =
                    process?.env?.NEXT_PUBLIC_UPDATE_CONFIG_URL ||
                    (typeof window !== "undefined"
                        ? `${window.location.origin}/app-config.json`
                        : "/app-config.json");

                const res = await fetch(configUrl, { cache: "no-store" });
                if (!res.ok) return;
                const cfg = await res.json();
                const minCode =
                    parseInt(
                        cfg?.min_version_code ?? cfg?.minVersion ?? 0,
                        10,
                    ) || 0;
                const storeUrl =
                    cfg?.store_url ||
                    cfg?.storeUrl ||
                    cfg?.play_store_url ||
                    null;

                if (currentCode < minCode && mounted) {
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
                }
            } catch (err) {
                // fail silently
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
                                    (typeof window !== "undefined"
                                        ? `${window.location.origin}/app-config.json`
                                        : "/app-config.json");
                                const res = await fetch(configUrl, {
                                    cache: "no-store",
                                });
                                const cfg = await res.json();
                                const storeUrl =
                                    cfg?.store_url ||
                                    cfg?.play_store_url ||
                                    cfg?.storeUrl;
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
