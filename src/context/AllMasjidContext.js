"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const AllMasjidContext = createContext();

export function AllMasjidProvider({ children }) {
    const [masjids, setMasjids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (params.colony) queryParams.set("colony", params.colony);
            if (params.masjid) queryParams.set("masjid", params.masjid);
            const qs = queryParams.toString();
            const url = `/api/all-masjids${qs ? `?${qs}` : ""}`;
            const res = await apiClient.get(url);
            const data = res.data?.data || [];
            setMasjids(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch masjids");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getById = useCallback(
        (id) => {
            return masjids.find((item) => item.id === parseInt(id)) || null;
        },
        [masjids]
    );

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/all-masjids", data);
        const created = res.data?.data;
        if (created) setMasjids((prev) => [created, ...prev]);
        return res.data;
    }, []);

    const patch = useCallback(async (data) => {
        const res = await apiClient.patch("/api/all-masjids", data);
        const updated = res.data?.data;
        if (updated) {
            setMasjids((prev) => prev.map((m) => (m.id === parseInt(data.id) ? updated : m)));
        }
        return res.data;
    }, []);

    return (
        <AllMasjidContext.Provider
            value={{ masjids, loading, error, fetchAll, getById, create, patch }}
        >
            {children}
        </AllMasjidContext.Provider>
    );
}

export function useAllMasjidContext() {
    const ctx = useContext(AllMasjidContext);
    if (!ctx) throw new Error("useAllMasjidContext must be used within AllMasjidProvider");
    return ctx;
}
