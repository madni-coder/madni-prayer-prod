"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const PrayerTimeContext = createContext();

export function PrayerTimeProvider({ children }) {
    const [timings, setTimings] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTimes = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            if (params.date) queryParams.set("date", params.date);
            if (params.lat) queryParams.set("lat", params.lat);
            if (params.lon) queryParams.set("lon", params.lon);
            if (params.city) queryParams.set("city", params.city);
            const qs = queryParams.toString();
            const url = `/api/api-prayerTimes${qs ? `?${qs}` : ""}`;
            const res = await apiClient.get(url);
            const data = res.data;
            if (data?.timings) setTimings(data.timings);
            if (data?.location) setLocation(data.location);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch prayer times");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <PrayerTimeContext.Provider
            value={{ timings, location, loading, error, fetchTimes }}
        >
            {children}
        </PrayerTimeContext.Provider>
    );
}

export function usePrayerTimeContext() {
    const ctx = useContext(PrayerTimeContext);
    if (!ctx) throw new Error("usePrayerTimeContext must be used within PrayerTimeProvider");
    return ctx;
}
