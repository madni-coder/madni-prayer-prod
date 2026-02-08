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

    // Add CORS headers for API routes (useful for emulator / device testing)
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,POST,PUT,DELETE" },
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
                    destination: "https://madni-prayer.vercel.app/api/:path*",
                },
            ];
        }
        return [];
    },
};

export default nextConfig;
