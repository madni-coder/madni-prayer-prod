"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const FreeServiceContext = createContext();

export function FreeServiceProvider({ children }) {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/free-service");
            const data = res.data?.data || [];
            setServices(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch free services");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getById = useCallback(
        (id) => {
            return services.find((item) => item.id === parseInt(id)) || null;
        },
        [services]
    );

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/free-service", data);
        const created = res.data?.data;
        if (created) setServices((prev) => [created, ...prev]);
        return res.data;
    }, []);

    const patch = useCallback(async (data) => {
        const res = await apiClient.patch("/api/free-service", data);
        const updated = res.data?.data;
        if (updated) {
            setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
        return res.data;
    }, []);

    const remove = useCallback(async (id) => {
        await apiClient.delete("/api/free-service", { data: { id } });
        setServices((prev) => prev.filter((s) => s.id !== parseInt(id)));
    }, []);

    return (
        <FreeServiceContext.Provider
            value={{ services, loading, error, fetchAll, getById, create, patch, remove }}
        >
            {children}
        </FreeServiceContext.Provider>
    );
}

export function useFreeServiceContext() {
    const ctx = useContext(FreeServiceContext);
    if (!ctx) throw new Error("useFreeServiceContext must be used within FreeServiceProvider");
    return ctx;
}
