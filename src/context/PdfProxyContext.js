"use client";
import { createContext, useContext, useCallback } from "react";
import apiClient from "../lib/apiClient";

const PdfProxyContext = createContext();

export function PdfProxyProvider({ children }) {
    const getProxyUrl = useCallback((url) => {
        const base = apiClient.defaults.baseURL || "";
        return `${base}/api/pdf-proxy?url=${encodeURIComponent(url)}`;
    }, []);

    const fetchPdf = useCallback(async (url) => {
        const res = await apiClient.get(`/api/pdf-proxy?url=${encodeURIComponent(url)}`, {
            responseType: "blob",
        });
        return res.data;
    }, []);

    return (
        <PdfProxyContext.Provider value={{ getProxyUrl, fetchPdf }}>
            {children}
        </PdfProxyContext.Provider>
    );
}

export function usePdfProxyContext() {
    const ctx = useContext(PdfProxyContext);
    if (!ctx) throw new Error("usePdfProxyContext must be used within PdfProxyProvider");
    return ctx;
}
