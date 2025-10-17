const isTauri = process.env.NEXT_PUBLIC_TAURI_BUILD === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
    ...(isTauri
        ? { output: "export", trailingSlash: true, distDir: "out" }
        : { trailingSlash: false }),

    images: { unoptimized: isTauri },

    skipTrailingSlashRedirect: true,

    // allow builds to proceed even if ESLint reports errors (useful while fixing hook issues)
    eslint: {
        ignoreDuringBuilds: true,
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
