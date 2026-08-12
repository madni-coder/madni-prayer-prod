import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const isTauri = process.env.NEXT_PUBLIC_TAURI_BUILD === "1";
// Only enable static export when explicitly requested via NEXT_PUBLIC_TAURI_STATIC_EXPORT=1
const isStaticExport = process.env.NEXT_PUBLIC_TAURI_STATIC_EXPORT === "1" && process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(isStaticExport
        ? { output: "export", trailingSlash: true, distDir: "out" }
        : { trailingSlash: false }),

    images: { unoptimized: isTauri },

    skipTrailingSlashRedirect: true,

    // Keep all @tauri-apps/* packages out of the SSR/RSC bundle —
    // they reference native APIs that don't exist in Node.js.
    // The dev script uses NEXT_DISABLE_TURBOPACK=1 (webpack mode), so we
    // need the webpack() externals.  turbopack.resolveAlias covers tauri builds.
    serverExternalPackages: [],

    // ── Webpack mode (npm run dev uses NEXT_DISABLE_TURBOPACK=1) ──────────────
    webpack(config, { isServer }) {
        if (isServer) {
            const tauriStub = require.resolve("./src/lib/tauri-stubs.js");
            const original = config.externals || [];
            const asArray = Array.isArray(original) ? original : [original].filter(Boolean);
            config.externals = [
                ...asArray,
                ({ request }, callback) => {
                    if (
                        request &&
                        (request.startsWith("@tauri-apps/") ||
                            request.startsWith("@choochmeque/tauri-plugin-notifications-api"))
                    ) {
                        // Redirect to our stub instead of the real (browser-only) package
                        return callback(null, `commonjs ${tauriStub}`);
                    }
                    callback();
                },
            ];
        }
        return config;
    },

    // ── Turbopack mode (tauri builds / future default) ────────────────────────
    // The stub MUST be scoped to the `node` condition. An unconditional alias
    // also replaces the packages in the *browser* bundle, which is what ships
    // to the device — the app then gets platform() === null and a
    // registerForPushNotifications() that throws, so push silently never
    // registers. Browser/device builds must resolve the real packages.
    turbopack: {
        resolveAlias: {
            "@tauri-apps/plugin-notification": { node: "./src/lib/tauri-stubs.js" },
            "@tauri-apps/plugin-haptics":      { node: "./src/lib/tauri-stubs.js" },
            "@tauri-apps/plugin-geolocation":  { node: "./src/lib/tauri-stubs.js" },
            "@tauri-apps/plugin-os":           { node: "./src/lib/tauri-stubs.js" },
            "@tauri-apps/plugin-opener":       { node: "./src/lib/tauri-stubs.js" },
            "@tauri-apps/api":                 { node: "./src/lib/tauri-stubs.js" },
            "@choochmeque/tauri-plugin-notifications-api": { node: "./src/lib/tauri-stubs.js" },
        },
    },

    // Add CORS headers for API routes (useful for emulator / device testing)
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,POST,PUT,PATCH,DELETE" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ],
            },
        ];
    },
    async rewrites() {
        if (isTauri) {
            return [
                {
                    source: "/api/:path*",
                    destination: "https://raahehidayat.vercel.app/api/:path*",
                },
            ];
        }
        return [];
    },
};

export default nextConfig;
