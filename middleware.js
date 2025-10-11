import { NextResponse } from "next/server";

export function middleware(req) {
    // Determine origin and allowed origins
    const requestOrigin = req.headers.get("origin") || "";
    const allowedOrigins = [
        "https://madni-prayer.vercel.app",
        "http://tauri.localhost/",
    ];
    // If origin is allowed use it, otherwise fall back to Vercel (safe default)
    const allowOrigin = allowedOrigins.includes(requestOrigin)
        ? requestOrigin
        : "https://madni-prayer.vercel.app";

    // Handle CORS preflight requests early
    if (req.method === "OPTIONS") {
        const headers = new Headers();
        headers.set("Access-Control-Allow-Origin", allowOrigin);
        headers.set("Vary", "Origin");
        headers.set(
            "Access-Control-Allow-Methods",
            "GET,HEAD,POST,PUT,DELETE,OPTIONS"
        );
        headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, x-is-admin"
        );
        headers.set("Access-Control-Max-Age", "86400");
        // Allow credentials when origin is explicit (not '*')
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
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // If user is authenticated and tries to access login page, redirect to admin
    if (isLoginPage) {
        const isAuthenticated =
            req.cookies.get("isAuthenticated")?.value === "true";
        if (isAuthenticated) {
            return NextResponse.redirect(new URL("/admin", req.url));
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

    // Set CORS headers on all responses
    res.headers.set("Access-Control-Allow-Origin", allowOrigin);
    res.headers.set("Vary", "Origin");
    res.headers.set(
        "Access-Control-Allow-Methods",
        "GET,HEAD,POST,PUT,DELETE,OPTIONS"
    );
    res.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-is-admin"
    );
    // Only set credentials when origin is explicit
    res.headers.set("Access-Control-Allow-Credentials", "true");

    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
    ],
};
