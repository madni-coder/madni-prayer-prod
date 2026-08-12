"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import apiClient from "../lib/apiClient";

// Broadcast topics every device subscribes to on launch — no DB needed,
// FCM/Firebase owns the subscription fan-out.
const BROADCAST_TOPICS = ["events_programs", "weekly_rewards", "notices"];
const MASJID_TOPIC_KEY = "pushMasjidTopic"; // { masjidId, topic }

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

    useEffect(() => {
        if (typeof window === "undefined" || !window.__TAURI_INTERNALS__) return;
        let cancelled = false;

        (async () => {
            const platform = await detectPlatform();
            if (!platform || cancelled) return;

            try {
                const { isPermissionGranted, requestPermission, registerForPushNotifications } =
                    await import("@choochmeque/tauri-plugin-notifications-api");

                let granted = await isPermissionGranted();
                if (!granted) granted = (await requestPermission()) === "granted";
                if (!granted || cancelled) return;

                const token = await registerForPushNotifications();
                if (!token || cancelled) return;

                tokenRef.current = token;
                platformRef.current = platform;

                const stored = readStoredMasjidTopic();
                await postTopics(token, platform, {
                    subscribe: stored?.topic ? [...BROADCAST_TOPICS, stored.topic] : BROADCAST_TOPICS,
                });
            } catch (err) {
                console.error("[push] registration failed:", err?.message || err);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

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
