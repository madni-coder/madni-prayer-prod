"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const LocalStoreContext = createContext();

export function LocalStoreProvider({ children }) {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/local-stores");
            const data = res.data?.data || [];
            setStores(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch stores");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getById = useCallback(
        (id) => {
            return stores.find((item) => item.id === parseInt(id)) || null;
        },
        [stores]
    );

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/local-stores", data);
        const created = res.data?.data;
        if (created) setStores((prev) => [created, ...prev]);
        return res.data;
    }, []);

    const patch = useCallback(async (data) => {
        const res = await apiClient.patch("/api/local-stores", data);
        const updated = res.data?.data;
        if (updated) {
            setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
        return res.data;
    }, []);

    const remove = useCallback(async (id) => {
        await apiClient.delete("/api/local-stores", { data: { id } });
        setStores((prev) => prev.filter((s) => s.id !== parseInt(id)));
    }, []);

    return (
        <LocalStoreContext.Provider
            value={{ stores, loading, error, fetchAll, getById, create, patch, remove }}
        >
            {children}
        </LocalStoreContext.Provider>
    );
}

export function useLocalStoreContext() {
    const ctx = useContext(LocalStoreContext);
    if (!ctx) throw new Error("useLocalStoreContext must be used within LocalStoreProvider");
    return ctx;
}
