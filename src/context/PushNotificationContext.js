"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../lib/apiClient";
import { firebaseWebConfig, firebaseVapidKey, isFirebaseWebConfigured, serviceWorkerUrl } from "../lib/firebaseClient";

// Broadcast topics every device subscribes to on launch — no DB needed,
// FCM/Firebase owns the subscription fan-out.
const BROADCAST_TOPICS = ["events_programs", "weekly_rewards", "notices", "job_portal"];
const MASJID_TOPIC_KEY = "pushMasjidTopic"; // { masjidId, topic }

// Re-run registration at most this often on foreground/resume — cheap
// enough to be safe, but avoids hammering the server on rapid tab/app
// switches.
const REREGISTER_MIN_INTERVAL_MS = 5 * 60 * 1000;

const PushNotificationContext = createContext();

async function detectPlatform() {
    try {
        const { platform } = await import("@tauri-apps/plugin-os");
        const p = platform();
        return p === "ios" || p === "android" ? p : null;
    } catch {
        return null;
    }
}

async function postTopics(token, platform, { subscribe = [], unsubscribe = [] }) {
    if (!token || !platform || (subscribe.length === 0 && unsubscribe.length === 0)) return;
    try {
        const res = await apiClient.post("/api/push/topics", { token, platform, subscribe, unsubscribe });
        console.info("[push] topics updated:", res?.data ?? res);
    } catch (err) {
        // Loud on purpose — a failure here means the device receives nothing,
        // and the server now returns a 500 with the real Firebase error.
        console.error(
            "[push] topic update failed:",
            err?.response?.status,
            err?.response?.data ?? err?.message ?? err
        );
    }
}

function readStoredMasjidTopic() {
    try {
        return JSON.parse(localStorage.getItem(MASJID_TOPIC_KEY) || "null");
    } catch {
        return null;
    }
}

export function PushNotificationProvider({ children }) {
    const tokenRef = useRef(null);
    const platformRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window === "undefined" || !window.__TAURI_INTERNALS__) return;
        let cancelled = false;
        let unlistenClicked = null;
        let lastRegisteredAt = 0;

        const registerPush = async ({ force = false } = {}) => {
            if (!force && Date.now() - lastRegisteredAt < REREGISTER_MIN_INTERVAL_MS) return;

            const platform = await detectPlatform();
            if (!platform || cancelled) return;

            try {
                const { isPermissionGranted, requestPermission, registerForPushNotifications } = await import(
                    "@choochmeque/tauri-plugin-notifications-api"
                );

                let granted = await isPermissionGranted();
                if (!granted) granted = (await requestPermission()) === "granted";
                if (!granted || cancelled) return;

                // Re-requests a token every time this runs (mount + each
                // foreground/resume). iOS/FCM tokens can rotate or go stale
                // while the app sits killed/idle with no way to refresh
                // themselves in the background, silently breaking topic
                // delivery until the app is reopened — so we re-subscribe
                // proactively instead of only once per process lifetime.
                const token = await registerForPushNotifications();
                if (!token || cancelled) return;

                tokenRef.current = token;
                platformRef.current = platform;
                lastRegisteredAt = Date.now();

                const stored = readStoredMasjidTopic();
                await postTopics(token, platform, {
                    subscribe: stored?.topic ? [...BROADCAST_TOPICS, stored.topic] : BROADCAST_TOPICS,
                });
            } catch (err) {
                console.error("[push] registration failed:", err?.message || err);
            }
        };

        (async () => {
            const platform = await detectPlatform();
            if (!platform || cancelled) return;

            try {
                const { onNotificationClicked } = await import("@choochmeque/tauri-plugin-notifications-api");

                // Handles cold-start too: if the app was launched by tapping a
                // notification, the click data is delivered as soon as this
                // listener is registered.
                unlistenClicked = await onNotificationClicked((clicked) => {
                    const path = clicked?.data?.path;
                    if (path) router.push(path);
                });
                if (cancelled) return;

                await registerPush({ force: true });
            } catch (err) {
                console.error("[push] registration failed:", err?.message || err);
            }
        })();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") registerPush();
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleVisibilityChange);

        return () => {
            cancelled = true;
            unlistenClicked?.unregister();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleVisibilityChange);
        };
    }, [router]);

    // Plain-browser path (not the Tauri app): Web Push via Firebase Cloud
    // Messaging. Mutually exclusive with the effect above — Tauri's webview
    // would otherwise also satisfy `"serviceWorker" in navigator`.
    useEffect(() => {
        if (typeof window === "undefined" || window.__TAURI_INTERNALS__) return;
        if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
        if (!isFirebaseWebConfigured()) {
            console.warn("[push] web push not configured — skipping (missing NEXT_PUBLIC_FIREBASE_* env vars)");
            return;
        }
        let cancelled = false;

        (async () => {
            try {
                const { initializeApp, getApps, getApp } = await import("firebase/app");
                const { getMessaging, getToken, onMessage } = await import("firebase/messaging");

                let granted = Notification.permission === "granted";
                if (Notification.permission === "default") {
                    granted = (await Notification.requestPermission()) === "granted";
                }
                if (!granted || cancelled) return;

                const registration = await navigator.serviceWorker.register(serviceWorkerUrl());
                if (cancelled) return;

                const app = getApps().length ? getApp() : initializeApp(firebaseWebConfig);
                const messaging = getMessaging(app);

                const token = await getToken(messaging, {
                    vapidKey: firebaseVapidKey,
                    serviceWorkerRegistration: registration,
                });
                if (!token || cancelled) return;

                tokenRef.current = token;
                platformRef.current = "web";

                const stored = readStoredMasjidTopic();
                await postTopics(token, "web", {
                    subscribe: stored?.topic ? [...BROADCAST_TOPICS, stored.topic] : BROADCAST_TOPICS,
                });

                // FCM only auto-displays a notification when the tab isn't
                // focused (handled by the service worker); a focused tab
                // must show it manually.
                onMessage(messaging, (payload) => {
                    const { title, body } = payload.notification || {};
                    const path = payload.data?.path;
                    if (!title) return;
                    const n = new Notification(title, { body, icon: "/mosqueLogo.png" });
                    n.onclick = () => {
                        window.focus();
                        if (path) router.push(path);
                        n.close();
                    };
                });
            } catch (err) {
                console.error("[push] web registration failed:", err?.message || err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    // Called whenever the user saves/changes their masjid in jamat-times.
    // Pass null to clear (no masjid saved).
    const setMasjidTopic = async (masjidId) => {
        const topic = masjidId != null ? `masjid_${masjidId}` : null;
        const stored = readStoredMasjidTopic();
        if (stored?.topic === topic) return;

        await postTopics(tokenRef.current, platformRef.current, {
            subscribe: topic ? [topic] : [],
            unsubscribe: stored?.topic ? [stored.topic] : [],
        });

        if (topic) localStorage.setItem(MASJID_TOPIC_KEY, JSON.stringify({ masjidId, topic }));
        else localStorage.removeItem(MASJID_TOPIC_KEY);
    };

    return (
        <PushNotificationContext.Provider value={{ setMasjidTopic }}>
            {children}
        </PushNotificationContext.Provider>
    );
}

export function usePushNotificationContext() {
    const ctx = useContext(PushNotificationContext);
    if (!ctx) throw new Error("usePushNotificationContext must be used within PushNotificationProvider");
    return ctx;
}
