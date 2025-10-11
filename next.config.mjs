const isTauri = process.env.TAURI_BUILD === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(isTauri
        ? { output: "export", trailingSlash: true, distDir: "out" }
        : {}),

    images: { unoptimized: isTauri },

    // Temporary: add permissive CORS headers for API routes so APK/WebView calls succeed.
    // TODO: tighten before production (restrict origins, remove wildcard, and avoid credentials).
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,HEAD,POST,PUT,DELETE,OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "Content-Type, Authorization, x-is-admin",
                    },
                    { key: "Access-Control-Max-Age", value: "86400" },
                ],
            },
        ];
    },
};

export default nextConfig;
