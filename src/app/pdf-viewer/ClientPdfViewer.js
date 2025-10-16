"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ClientPdfViewer({ file: fileProp }) {
    const searchParams = useSearchParams?.();
    const paramFile = searchParams ? searchParams.get("file") : null;
    const file = fileProp || paramFile || "";

    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    useEffect(() => {
        setErr(null);
        setLoading(true);
        if (!file) {
            setUrl("");
            setLoading(false);
            return;
        }
        try {
            // file is expected to be an encoded URL (possibly proxied). Decode once.
            const decoded = decodeURIComponent(file);
            setUrl(decoded);
        } catch (e) {
            // Fallback: use as-is
            setUrl(file);
        } finally {
            // allow iframe to load
            setTimeout(() => setLoading(false), 150);
        }
    }, [file]);

    if (!file) {
        return (
            <div className="p-6 text-center text-base-content/60">
                No file specified.
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-base-100">
            <header className="flex items-center justify-between p-3 bg-base-200 border-b">
                <div className="font-semibold">PDF Viewer</div>
                
            </header>
            <main className="flex-1 relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="loader border-4 border-t-primary rounded-full w-12 h-12 animate-spin" />
                    </div>
                )}
                {err ? (
                    <div className="p-6 text-center text-error">
                        {String(err)}
                    </div>
                ) : (
                    <iframe
                        src={url}
                        className="w-full h-full"
                        title="PDF Viewer"
                        onError={() => setErr("Failed to load PDF preview")}
                    />
                )}
            </main>
        </div>
    );
}
