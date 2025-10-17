"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QuranLoader from "../../components/QuranLoader";

export default function ClientPdfViewer({ file: fileProp }) {
    const searchParams = useSearchParams?.();
    const paramFile = searchParams ? searchParams.get("file") : null;
    const file = fileProp || paramFile || "";

    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [err, setErr] = useState(null);
    const [url, setUrl] = useState("");
    const [pages, setPages] = useState([]);

    useEffect(() => {
        setErr(null);
        setLoading(true);
        setLoadingProgress(0);
        setCurrentPage(0);
        setTotalPages(0);
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
            setLoadingProgress(0);
            setPages([]);
            try {
                const pdfjsPath = "/pdfjs/pdf.min.mjs";
                const workerPath = "/pdfjs/pdf.worker.min.mjs";

                // Loading PDF library - 10%
                setLoadingProgress(10);
                const pdfjsModule = await import(
                    /* webpackIgnore: true */ pdfjsPath
                );
                const pdfjsLib = pdfjsModule.default || pdfjsModule;
                if (pdfjsLib.GlobalWorkerOptions)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

                // Fetching PDF - 20%
                setLoadingProgress(20);
                const resp = await fetch(url, {
                    method: "GET",
                    credentials: "same-origin",
                });
                if (!resp.ok)
                    throw new Error("Failed to fetch PDF: " + resp.status);
                const arrayBuffer = await resp.arrayBuffer();

                // Loading PDF document - 30%
                setLoadingProgress(30);
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                const created = [];
                const totalPagesCount = pdf.numPages;
                setTotalPages(totalPagesCount);

                // Rendering pages - 40% to 100%
                for (let i = 1; i <= totalPagesCount; i++) {
                    setCurrentPage(i);
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement("canvas");
                    canvas.width = Math.floor(viewport.width);
                    canvas.height = Math.floor(viewport.height);
                    const ctx = canvas.getContext("2d");
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    if (cancelled) return;
                    created.push(canvas.toDataURL("image/png"));

                    // Update progress based on pages rendered (40% + 60% based on progress)
                    const pageProgress = (i / totalPagesCount) * 60;
                    setLoadingProgress(40 + pageProgress);
                }

                setPages(created);
            } catch (e) {
                console.error("PDF render error:", e);
                setErr(e.message || String(e));
            } finally {
                setLoading(false);
                setLoadingProgress(100);
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
            <QuranLoader
                isVisible={loading}
                progress={loadingProgress}
                title={
                    loadingProgress < 30
                        ? "Loading Quran PDF..."
                        : loadingProgress < 40
                        ? "Preparing Document..."
                        : "Rendering Pages..."
                }
                subtitle={
                    loadingProgress < 30
                        ? "Please wait while we fetch the PDF file"
                        : loadingProgress < 40
                        ? "Processing the document for viewing"
                        : totalPages > 0
                        ? `Rendering page ${currentPage} of ${totalPages}`
                        : "Preparing pages for rendering..."
                }
            />

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
