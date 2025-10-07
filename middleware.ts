import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
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

    return res;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
    ],
};
