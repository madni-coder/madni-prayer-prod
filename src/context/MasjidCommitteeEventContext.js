"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const MasjidCommitteeEventContext = createContext();

export function MasjidCommitteeEventProvider({ children }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/masjid-committee-event");
            const data = res.data?.images || [];
            setImages(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch committee events");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const create = useCallback(async (formData) => {
        const res = await apiClient.post("/api/masjid-committee-event", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        const created = res.data;
        // Refresh list after upload
        await fetchAll();
        return created;
    }, [fetchAll]);

    return (
        <MasjidCommitteeEventContext.Provider
            value={{ images, loading, error, fetchAll, create }}
        >
            {children}
        </MasjidCommitteeEventContext.Provider>
    );
}

export function useMasjidCommitteeEventContext() {
    const ctx = useContext(MasjidCommitteeEventContext);
    if (!ctx) throw new Error("useMasjidCommitteeEventContext must be used within MasjidCommitteeEventProvider");
    return ctx;
}
