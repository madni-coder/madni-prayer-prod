"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const QuranContext = createContext();

export function QuranProvider({ children }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/api-quran");
            const data = res.data?.files || [];
            setFiles(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch quran files");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getSurahUrl = useCallback(async (surahName) => {
        const res = await apiClient.get(`/api/api-quran?surah=${encodeURIComponent(surahName)}`);
        return res.data;
    }, []);

    return (
        <QuranContext.Provider
            value={{ files, loading, error, fetchAll, getSurahUrl }}
        >
            {children}
        </QuranContext.Provider>
    );
}

export function useQuranContext() {
    const ctx = useContext(QuranContext);
    if (!ctx) throw new Error("useQuranContext must be used within QuranProvider");
    return ctx;
}
