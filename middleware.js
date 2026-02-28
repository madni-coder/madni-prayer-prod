import { NextResponse } from "next/server";

export function middleware(req) {
    // Determine origin and allowed origins
    const requestOrigin = req.headers.get("origin") || "";
    const allowedOrigins = [
        "https://madni-prayer.vercel.app",
        "http://localhost:3000",
        "http://tauri.localhost",
        "tauri://localhost",
        "null",
    ];

    // If origin is allowed use it, otherwise fall back to '*' (very permissive)
    const isAllowed = allowedOrigins.includes(requestOrigin);
    const allowOrigin = isAllowed && requestOrigin ? requestOrigin : "*";

    // Handle CORS preflight requests early
    if (req.method === "OPTIONS") {
        const headers = new Headers();
        headers.set("Access-Control-Allow-Origin", allowOrigin);
        if (allowOrigin !== "*") headers.set("Vary", "Origin");
        headers.set(
            "Access-Control-Allow-Methods",
            "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS"
        );
        headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, x-is-admin"
        );
        headers.set("Access-Control-Max-Age", "86400");
        // If echoing a specific origin, allow credentials; otherwise don't set it
        if (allowOrigin !== "*")
            headers.set("Access-Control-Allow-Credentials", "true");
        return new NextResponse(null, { status: 204, headers });
    }

    const isAdmin = req.nextUrl.pathname.startsWith("/admin");
    const isLoginPage = req.nextUrl.pathname === "/login";

    // Check if user is authenticated for admin routes
    if (isAdmin && !isLoginPage) {
        const isAuthenticated =
            req.cookies.get("isAuthenticated")?.value === "true";

        if (!isAuthenticated) {
            // Redirect to login page if not authenticated
            const redirectRes = NextResponse.redirect(
                new URL("/login", req.url)
            );
            // Attach CORS headers to redirect response
            redirectRes.headers.set("Access-Control-Allow-Origin", allowOrigin);
            if (allowOrigin !== "*") redirectRes.headers.set("Vary", "Origin");
            redirectRes.headers.set(
                "Access-Control-Allow-Methods",
                "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS"
            );
            redirectRes.headers.set(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization, x-is-admin"
            );
            if (allowOrigin !== "*")
                redirectRes.headers.set(
                    "Access-Control-Allow-Credentials",
                    "true"
                );
            return redirectRes;
        }
    }

    // If user is authenticated and tries to access login page, redirect to admin
    if (isLoginPage) {
        const isAuthenticated =
            req.cookies.get("isAuthenticated")?.value === "true";
        if (isAuthenticated) {
            const redirectRes = NextResponse.redirect(
                new URL("/admin", req.url)
            );
            // Attach CORS headers to redirect response
            redirectRes.headers.set("Access-Control-Allow-Origin", allowOrigin);
            if (allowOrigin !== "*") redirectRes.headers.set("Vary", "Origin");
            redirectRes.headers.set(
                "Access-Control-Allow-Methods",
                "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS"
            );
            redirectRes.headers.set(
                "Access-Control-Allow-Headers",
                "Content-Type, Authorization, x-is-admin"
            );
            if (allowOrigin !== "*")
                redirectRes.headers.set(
                    "Access-Control-Allow-Credentials",
                    "true"
                );
            return redirectRes;
        }
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-is-admin", isAdmin ? "1" : "0");

    const res = NextResponse.next({ request: { headers: requestHeaders } });

    // Keep a cookie for client-side checks (optional)
    if (isAdmin) {
        res.cookies.set("is-admin", "1", { path: "/" });
    } else {
        res.cookies.delete("is-admin");
    }

    // Set permissive CORS headers on all responses
    res.headers.set("Access-Control-Allow-Origin", allowOrigin);
    if (allowOrigin !== "*") res.headers.set("Vary", "Origin");
    res.headers.set(
        "Access-Control-Allow-Methods",
        "GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-is-admin"
    );
    if (allowOrigin !== "*")
        res.headers.set("Access-Control-Allow-Credentials", "true");

    return res;
}

export const config = {
    matcher: [
        "/api/:path*",
        "/admin/:path*",
        "/login",
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
    ],
};
