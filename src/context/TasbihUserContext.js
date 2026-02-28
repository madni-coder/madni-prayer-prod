"use client";
import {  createContext, useContext, useState, useCallback , useRef } from "react";
import apiClient from "../lib/apiClient";

const TasbihUserContext = createContext();

export function TasbihUserProvider({ children }) {
    const fetchedRef = useRef(false);
    const fetchPromiseRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        const force = false;
        if (!force && (fetchedRef.current || fetchPromiseRef.current)) {
            if (fetchPromiseRef.current) return fetchPromiseRef.current;
            return []; // Already fetched
        }

        const promise = (async () => {
            setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/api-tasbihUsers");
            const data = res.data?.data || [];
            setUsers(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch tasbih users");
            return [];
        } finally {
            setLoading(false);
            if (!false) fetchPromiseRef.current = null;
        }
    })();
    
    if (!false) {
        fetchPromiseRef.current = promise;
        promise.then(() => { fetchedRef.current = true; }).catch(() => {});
    }
    
    return promise;
}, []);

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/api-tasbihUsers", data);
        const result = res.data;
        // Refresh list after create/increment
        await fetchAll();
        return result;
    }, [fetchAll]);

    const remove = useCallback(async (data) => {
        const res = await apiClient.delete("/api/api-tasbihUsers", { data });
        const result = res.data;
        // Refresh list after reset
        await fetchAll();
        return result;
    }, [fetchAll]);

    return (
        <TasbihUserContext.Provider
            value={{ users, loading, error, fetchAll, create, remove }}
        >
            {children}
        </TasbihUserContext.Provider>
    );
}

export function useTasbihUserContext() {
    const ctx = useContext(TasbihUserContext);
    if (!ctx) throw new Error("useTasbihUserContext must be used within TasbihUserProvider");
    return ctx;
}
