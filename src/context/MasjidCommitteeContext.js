"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const MasjidCommitteeContext = createContext();

export function MasjidCommitteeProvider({ children }) {
    const [committeeData, setCommitteeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchByMasjidId = useCallback(async (masjidId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/api/masjid-committee?masjidId=${masjidId}`);
            const data = res.data?.data || null;
            setCommitteeData(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch committee data");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (masjidId, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post("/api/masjid-committee/login", { masjidId, password });
            const data = res.data;
            if (data?.data) setCommitteeData(data.data);
            return data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Login failed";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <MasjidCommitteeContext.Provider
            value={{ committeeData, loading, error, fetchByMasjidId, login }}
        >
            {children}
        </MasjidCommitteeContext.Provider>
    );
}

export function useMasjidCommitteeContext() {
    const ctx = useContext(MasjidCommitteeContext);
    if (!ctx) throw new Error("useMasjidCommitteeContext must be used within MasjidCommitteeProvider");
    return ctx;
}
