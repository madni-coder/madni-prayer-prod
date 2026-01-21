"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
    const [pdfDoc, setPdfDoc] = useState(null);
    const [renderedPages, setRenderedPages] = useState(new Set());
    const observerRef = useRef(null);
    const pageRefsRef = useRef({});

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

        async function loadPdf() {
            setErr(null);
            setLoading(true);
            setLoadingProgress(0);
            setPages([]);
            setRenderedPages(new Set());
            try {
                const pdfjsPath = "/pdfjs/pdf.min.mjs";
                const workerPath = "/pdfjs/pdf.worker.min.mjs";

                setLoadingProgress(10);
                const pdfjsModule = await import(
                    /* webpackIgnore: true */ pdfjsPath
                );
                const pdfjsLib = pdfjsModule.default || pdfjsModule;
                if (pdfjsLib.GlobalWorkerOptions)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

                setLoadingProgress(30);
                const resp = await fetch(url, {
                    method: "GET",
                    credentials: "same-origin",
                });
                if (!resp.ok)
                    throw new Error("Failed to fetch PDF: " + resp.status);
                const arrayBuffer = await resp.arrayBuffer();

                setLoadingProgress(60);
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                if (cancelled) return;

                const totalPagesCount = pdf.numPages;
                setTotalPages(totalPagesCount);
                setPdfDoc(pdf);

                // For large PDFs, initialize placeholder pages
                if (totalPagesCount > 100) {
                    setPages(new Array(totalPagesCount).fill(null));
                } else {
                    // For small PDFs, render all pages immediately
                    const created = [];
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

                        const pageProgress = (i / totalPagesCount) * 30;
                        setLoadingProgress(60 + pageProgress);
                    }
                    setPages(created);
                }

                setLoadingProgress(100);
            } catch (e) {
                console.error("PDF render error:", e);
                setErr(e.message || String(e));
            } finally {
                setLoading(false);
            }
        }

        loadPdf();

        return () => {
            cancelled = true;
        };
    }, [url]);

    // Lazy render pages for large PDFs
    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDoc || renderedPages.has(pageNum)) return;

        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext("2d");
            await page.render({ canvasContext: ctx, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/png");
            setPages(prev => {
                const newPages = [...prev];
                newPages[pageNum - 1] = dataUrl;
                return newPages;
            });
            setRenderedPages(prev => new Set([...prev, pageNum]));
        } catch (e) {
            console.error(`Error rendering page ${pageNum}:`, e);
        }
    }, [pdfDoc, renderedPages]);

    // Intersection observer for lazy loading
    useEffect(() => {
        if (!pdfDoc || totalPages <= 100) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const pageNum = parseInt(entry.target.dataset.page);
                        renderPage(pageNum);
                    }
                });
            },
            { rootMargin: '500px' }
        );

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [pdfDoc, totalPages, renderPage]);

    useEffect(() => {
        if (!observerRef.current || totalPages <= 100) return;

        Object.values(pageRefsRef.current).forEach(el => {
            if (el) observerRef.current.observe(el);
        });
    }, [pages, totalPages]);

    if (!file) {
        return (
            <div className="p-6 text-center text-base-content/60">
                No file specified.
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-black text-base-content">
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
                        <div
                            key={idx}
                            ref={el => pageRefsRef.current[idx] = el}
                            data-page={idx + 1}
                            className="w-full flex items-center justify-center bg-black"
                            style={{ minHeight: dataUrl ? 'auto' : '100vh' }}
                        >
                            {dataUrl ? (
                                <img
                                    src={dataUrl}
                                    alt={`page-${idx + 1}`}
                                    className="w-full h-auto block"
                                />
                            ) : (
                                <div className="text-base-content/40">
                                    Page {idx + 1}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
