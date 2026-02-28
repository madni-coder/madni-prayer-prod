"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const ZikrContext = createContext();

export function ZikrProvider({ children }) {
    const [zikrList, setZikrList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/api-zikr");
            const data = res.data || [];
            const normalizedData = Array.isArray(data) ? data : (data ? [data] : []);
            setZikrList(normalizedData);
            return normalizedData;
        } catch (err) {
            setError(err.message || "Failed to fetch zikr records");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getById = useCallback(
        (id) => {
            return zikrList.find((item) => item.id === parseInt(id)) || null;
        },
        [zikrList]
    );

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/api-zikr", data);
        const created = res.data;
        setZikrList((prev) => [created, ...prev]);
        return created;
    }, []);

    const removeAll = useCallback(async () => {
        await apiClient.delete("/api/api-zikr");
        setZikrList([]);
    }, []);

    return (
        <ZikrContext.Provider
            value={{ zikrList, loading, error, fetchAll, getById, create, removeAll }}
        >
            {children}
        </ZikrContext.Provider>
    );
}

export function useZikrContext() {
    const ctx = useContext(ZikrContext);
    if (!ctx) throw new Error("useZikrContext must be used within ZikrProvider");
    return ctx;
}
