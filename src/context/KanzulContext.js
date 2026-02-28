"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import apiClient from "../lib/apiClient";

const KanzulContext = createContext();

export function KanzulProvider({ children }) {
    const fetchedRef = useRef(false);
    const fetchPromiseRef = useRef(null);
    const [pdfData, setPdfData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPdf = useCallback(async (params = {}) => {
        const force = params?.force === true;
        if (!force && (fetchedRef.current || fetchPromiseRef.current)) {
            if (fetchPromiseRef.current) return fetchPromiseRef.current;
            return []; // Already fetched
        }

        setLoading(true);
        setError(null);

        const promise = (async () => {
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
                fetchPromiseRef.current = null;
            }
        })();

        fetchPromiseRef.current = promise;
        promise.then(() => { fetchedRef.current = true; }).catch(() => { });
        return promise;
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
