"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const RewardContext = createContext();

export function RewardProvider({ children }) {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/api-rewards");
            const data = res.data || [];
            setRewards(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch rewards");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/api-rewards", data);
        const created = res.data;
        // Refresh after bulk insert
        await fetchAll();
        return created;
    }, [fetchAll]);

    const removeAll = useCallback(async () => {
        await apiClient.delete("/api/api-rewards");
        setRewards([]);
    }, []);

    return (
        <RewardContext.Provider
            value={{ rewards, loading, error, fetchAll, create, removeAll }}
        >
            {children}
        </RewardContext.Provider>
    );
}

export function useRewardContext() {
    const ctx = useContext(RewardContext);
    if (!ctx) throw new Error("useRewardContext must be used within RewardProvider");
    return ctx;
}
