"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import apiClient from "../lib/apiClient";

const NoticeContext = createContext();

export function NoticeProvider({ children }) {
    const fetchedRef = useRef(false);
    const fetchPromiseRef = useRef(null);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async (params = {}) => {
        const force = params?.force === true;
        if (!force && (fetchedRef.current || fetchPromiseRef.current)) {
            if (fetchPromiseRef.current) return fetchPromiseRef.current;
            return []; // Already fetched
        }

        const promise = (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiClient.get("/api/api-notice");
                const data = res.data?.images || [];
                setImages(data);
                return data;
            } catch (err) {
                setError(err.message || "Failed to fetch notices");
                return [];
            } finally {
                setLoading(false);
                fetchPromiseRef.current = null;
            }
        })();

        fetchPromiseRef.current = promise;
        promise.then(() => { fetchedRef.current = true; }).catch(() => { });

        return promise;
    }, []);

    const getById = useCallback(
        (id) => {
            return images.find((item) => item.id === id) || null;
        },
        [images]
    );

    const create = useCallback(async (formData) => {
        const res = await apiClient.post("/api/api-notice", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const created = res.data;
        // Refresh the list after upload
        await fetchAll();
        return created;
    }, [fetchAll]);

    const remove = useCallback(async (imageId) => {
        await apiClient.delete("/api/api-notice", { data: { imageId } });
        setImages((prev) => prev.filter((img) => img.id !== imageId));
    }, []);

    return (
        <NoticeContext.Provider
            value={{ images, loading, error, fetchAll, getById, create, remove }}
        >
            {children}
        </NoticeContext.Provider>
    );
}

export function useNoticeContext() {
    const ctx = useContext(NoticeContext);
    if (!ctx) throw new Error("useNoticeContext must be used within NoticeProvider");
    return ctx;
}
