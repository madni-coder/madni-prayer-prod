"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ClientPdfViewer({ file: fileProp }) {
    const searchParams = useSearchParams?.();
    const paramFile = searchParams ? searchParams.get("file") : null;
    const file = fileProp || paramFile || "";

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);
    const [url, setUrl] = useState("");
    const [pages, setPages] = useState([]);

    useEffect(() => {
        setErr(null);
        setLoading(true);
        if (!file) {
            setUrl("");
            setLoading(false);
            return;
        }
        try {
            const decoded = decodeURIComponent(file);
            setUrl(decoded);
        } catch (e) {
            setUrl(file);
        }
    }, [file]);

    useEffect(() => {
        if (!url) return;
        let cancelled = false;

        async function renderAllPages() {
            setErr(null);
            setLoading(true);
            setPages([]);
            try {
                const pdfjsPath = "/pdfjs/pdf.min.mjs";
                const workerPath = "/pdfjs/pdf.worker.min.mjs";

                const pdfjsModule = await import(
                    /* webpackIgnore: true */ pdfjsPath
                );
                const pdfjsLib = pdfjsModule.default || pdfjsModule;
                if (pdfjsLib.GlobalWorkerOptions)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

                const resp = await fetch(url, {
                    method: "GET",
                    credentials: "same-origin",
                });
                if (!resp.ok)
                    throw new Error("Failed to fetch PDF: " + resp.status);
                const arrayBuffer = await resp.arrayBuffer();

                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                const created = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.floor(viewport.width);
                    canvas.height = Math.floor(viewport.height);
                    const ctx = canvas.getContext("2d");
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    if (cancelled) return;
                    created.push(canvas.toDataURL("image/png"));
                }

                setPages(created);
            } catch (e) {
                console.error("PDF render error:", e);
                setErr(e.message || String(e));
            } finally {
                setLoading(false);
            }
        }

        renderAllPages();

        return () => {
            cancelled = true;
        };
    }, [url]);

    if (!file) {
        return (
            <div className="p-6 text-center text-base-content/60">
                No file specified.
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-base-100 text-base-content p-4">
            {loading && (
                <div className="flex items-center justify-center h-48">
                    <div className="loader border-4 border-t-primary rounded-full w-12 h-12 animate-spin" />
                </div>
            )}

            {err ? (
                <div className="p-6 text-center">
                    <a
                        className="btn"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open PDF
                    </a>
                </div>
            ) : (
                <div className="flex flex-col items-stretch">
                    {pages.map((dataUrl, idx) => (
                        <img
                            key={idx}
                            src={dataUrl}
                            alt={`page-${idx + 1}`}
                            className="w-full h-auto mb-4"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
