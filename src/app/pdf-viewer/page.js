"use client";
import { Suspense, useEffect } from "react";
import ClientPdfViewer from "./ClientPdfViewer";

export default function PdfViewerPage() {
    // Mark HTML to hide navs via global CSS while on this page
    useEffect(() => {
        if (typeof document !== "undefined") {
            const html = document.documentElement;
            const prev = html.getAttribute("data-hide-navs");
            html.setAttribute("data-hide-navs", "1");
            return () => {
                if (prev == null) html.removeAttribute("data-hide-navs");
                else html.setAttribute("data-hide-navs", prev);
            };
        }
    }, []);
    return (
        <div className="w-full h-full min-h-screen bg-base-100 text-base-content">
            {/* ClientPdfViewer will read search params on the client if needed */}
            <Suspense
                fallback={
                    <div className="p-6 text-center">Loading viewer...</div>
                }
            >
                <ClientPdfViewer />
            </Suspense>
        </div>
    );
}
