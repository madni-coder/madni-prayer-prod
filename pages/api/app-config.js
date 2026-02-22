// Dynamic app-config endpoint that returns platform-specific min_version
// based on request headers. This lets us force-update Android users while
// keeping iOS on a lower min version (useful while App Store review is pending).

import base from "../../data/app-config-base.json";

function detectPlatform(req) {
    const ua = String(req.headers["user-agent"] || "").toLowerCase();
    // Common markers for Android and iOS user-agents
    if (ua.includes("android") || ua.includes("okhttp") || ua.includes("dalvik")) return "android";
    if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod") || ua.includes("ios")) return "ios";
    // Allow an explicit override header from clients if needed
    const h = req.headers["x-client-platform"];
    if (h) return String(h).toLowerCase();
    return "unknown";
}

export default function handler(req, res) {
    try {
        const platform = detectPlatform(req);

        // Start with full base and override `min_version` per platform so
        // legacy clients that only read `min_version` get the right value.
        const out = { ...base };

        if (platform === "android") {
            out.min_version = base.min_version_android || base.min_version;
        } else if (platform === "ios") {
            out.min_version = base.min_version_ios || base.min_version;
        } else {
            // Unknown clients: keep the generic `min_version` (safe default)
            out.min_version = base.min_version;
        }

        // No caching — clients should always get current policy
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.status(200).json(out);
    } catch (e) {
        console.error("/api/app-config error:", e);
        res.status(500).json({ error: "internal_error" });
    }
}
