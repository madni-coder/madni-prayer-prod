"use client";
import { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../lib/apiClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.post("/api/auth/login", { email, password });
            const data = res.data;
            if (data?.user) setUser(data.user);
            if (data?.session) setSession(data.session);
            return data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Login failed";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAccount = useCallback(async (email) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.delete("/api/auth/delete", { data: { email } });
            setUser(null);
            setSession(null);
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.error || err.message || "Delete failed";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setSession(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, session, loading, error, login, deleteAccount, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
    return ctx;
}
