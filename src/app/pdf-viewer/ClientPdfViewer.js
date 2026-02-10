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
            console.log("Setting PDF URL:", decoded);
            setUrl(decoded);
        } catch (e) {
            console.log("Using file as-is (decode failed):", file);
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
                console.log("Starting PDF load for URL:", url);
                const pdfjsPath = "/pdfjs/pdf.min.mjs";
                const workerPath = "/pdfjs/pdf.worker.min.mjs";

                setLoadingProgress(10);

                // Try to import PDF.js with better error handling
                let pdfjsLib;
                try {
                    const pdfjsModule = await import(
                        /* webpackIgnore: true */ pdfjsPath
                    );
                    pdfjsLib = pdfjsModule.default || pdfjsModule;
                    console.log("PDF.js loaded successfully");
                } catch (importError) {
                    console.error("Failed to import PDF.js:", importError);
                    throw new Error("Failed to load PDF library. Please try again.");
                }

                if (pdfjsLib.GlobalWorkerOptions) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
                }

                setLoadingProgress(30);

                // Fetch PDF with better error handling
                let arrayBuffer;
                try {
                    console.log("Fetching PDF from:", url);
                    const resp = await fetch(url, {
                        method: "GET",
                        credentials: "same-origin",
                        mode: "cors",
                    });
                    console.log("Fetch response status:", resp.status, resp.statusText);
                    if (!resp.ok) {
                        throw new Error(`Failed to fetch PDF: ${resp.status} ${resp.statusText}`);
                    }
                    arrayBuffer = await resp.arrayBuffer();
                    console.log("PDF data loaded, size:", arrayBuffer.byteLength, "bytes");
                } catch (fetchError) {
                    console.error("Failed to fetch PDF:", fetchError);
                    throw new Error(`Failed to load PDF file: ${fetchError.message}`);
                }

                setLoadingProgress(60);

                // Load and render PDF
                try {
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    if (cancelled) return;

                    const totalPagesCount = pdf.numPages;
                    console.log("PDF loaded successfully, total pages:", totalPagesCount);
                    setTotalPages(totalPagesCount);
                    setPdfDoc(pdf);

                    // Initialize placeholder pages for all PDFs
                    const pageArray = new Array(totalPagesCount).fill(null);
                    setPages(pageArray);

                    setLoadingProgress(100);

                    // Eagerly render the first few pages directly here
                    const initialPagesToRender = Math.min(totalPagesCount, 3);
                    console.log(`Rendering initial ${initialPagesToRender} pages...`);

                    const newRenderedPages = new Set();
                    for (let i = 1; i <= initialPagesToRender; i++) {
                        try {
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({ scale: 1.5 });
                            const canvas = document.createElement("canvas");
                            canvas.width = Math.floor(viewport.width);
                            canvas.height = Math.floor(viewport.height);
                            const ctx = canvas.getContext("2d");
                            await page.render({ canvasContext: ctx, viewport }).promise;
                            const dataUrl = canvas.toDataURL("image/png");
                            pageArray[i - 1] = dataUrl;
                            newRenderedPages.add(i);
                            console.log(`Initial page ${i} rendered`);
                        } catch (pageErr) {
                            console.error(`Error rendering initial page ${i}:`, pageErr);
                        }
                    }

                    setPages([...pageArray]);
                    setRenderedPages(newRenderedPages);

                } catch (renderError) {
                    console.error("Failed to render PDF:", renderError);
                    throw new Error(`Failed to render PDF: ${renderError.message}`);
                }

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
        if (!pdfDoc) {
            console.log(`Cannot render page ${pageNum}: pdfDoc not loaded`);
            return;
        }
        if (renderedPages.has(pageNum)) {
            console.log(`Page ${pageNum} already rendered, skipping`);
            return;
        }

        console.log(`Rendering page ${pageNum}...`);
        try {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.floor(viewport.width);
            canvas.height = Math.floor(viewport.height);
            const ctx = canvas.getContext("2d");
            await page.render({ canvasContext: ctx, viewport }).promise;

            const dataUrl = canvas.toDataURL("image/png");
            console.log(`Page ${pageNum} rendered successfully`);
            setPages(prev => {
                const newPages = [...prev];
                newPages[pageNum - 1] = dataUrl;
                return newPages;
            });
            setRenderedPages(prev => new Set([...prev, pageNum]));
        } catch (e) {
            console.error(`Error rendering page ${pageNum}:`, e);
        }
    }, [pdfDoc]);

    // Intersection observer for lazy loading
    useEffect(() => {
        if (!pdfDoc) return;

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
        if (!observerRef.current) return;

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
                    <div className="mb-4 text-red-500">
                        <p className="font-semibold mb-2">Unable to display PDF</p>
                        <p className="text-sm text-base-content/70">{err}</p>
                    </div>
                    <a
                        className="btn btn-primary"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open PDF in External Viewer
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
