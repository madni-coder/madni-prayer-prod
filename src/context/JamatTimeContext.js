"use client";
import { createContext, useContext, useCallback } from "react";
import apiClient from "../lib/apiClient";

const JamatTimeContext = createContext();

export function JamatTimeProvider({ children }) {
    const patch = useCallback(async (data) => {
        const res = await apiClient.patch("/api/api-jamatTimes", data);
        return res.data;
    }, []);

    return (
        <JamatTimeContext.Provider value={{ patch }}>
            {children}
        </JamatTimeContext.Provider>
    );
}

export function useJamatTimeContext() {
    const ctx = useContext(JamatTimeContext);
    if (!ctx) throw new Error("useJamatTimeContext must be used within JamatTimeProvider");
    return ctx;
}
