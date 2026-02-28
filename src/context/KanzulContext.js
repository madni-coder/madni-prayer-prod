"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const KanzulContext = createContext();

export function KanzulProvider({ children }) {
    const [pdfData, setPdfData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPdf = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/kanzul");
            const data = res.data;
            setPdfData(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch Kanzul Imaan");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <KanzulContext.Provider
            value={{ pdfData, loading, error, fetchPdf }}
        >
            {children}
        </KanzulContext.Provider>
    );
}

export function useKanzulContext() {
    const ctx = useContext(KanzulContext);
    if (!ctx) throw new Error("useKanzulContext must be used within KanzulProvider");
    return ctx;
}
