"use client";
import {  createContext, useContext, useState, useCallback , useRef } from "react";
import apiClient from "../lib/apiClient";

const JobSeekerContext = createContext();

export function JobSeekerProvider({ children }) {
    const fetchedRef = useRef(false);
    const fetchPromiseRef = useRef(null);
    const [seekers, setSeekers] = useState([]);
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
            const res = await apiClient.get("/api/api-job-seekers");
            const data = res.data || [];
            setSeekers(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch job seekers");
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

    const getById = useCallback(
        (id) => {
            return seekers.find((item) => item.id === parseInt(id)) || null;
        },
        [seekers]
    );

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/api-job-seekers", data);
        const created = res.data;
        setSeekers((prev) => [created, ...prev]);
        return created;
    }, []);

    const update = useCallback(async (id, data) => {
        const res = await apiClient.put(`/api/api-job-seekers?id=${id}`, data);
        const updated = res.data;
        setSeekers((prev) => prev.map((s) => (s.id === parseInt(id) ? updated : s)));
        return updated;
    }, []);

    const patch = useCallback(async (id, data) => {
        const res = await apiClient.patch(`/api/api-job-seekers?id=${id}`, data);
        const updated = res.data;
        setSeekers((prev) => prev.map((s) => (s.id === parseInt(id) ? updated : s)));
        return updated;
    }, []);

    const remove = useCallback(async (id) => {
        await apiClient.delete(`/api/api-job-seekers?id=${id}`);
        setSeekers((prev) => prev.filter((s) => s.id !== parseInt(id)));
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await apiClient.post("/api/api-job-seekers/auth", { email, password });
        return res.data;
    }, []);

    return (
        <JobSeekerContext.Provider
            value={{ seekers, loading, error, fetchAll, getById, create, update, patch, remove, login }}
        >
            {children}
        </JobSeekerContext.Provider>
    );
}

export function useJobSeekerContext() {
    const ctx = useContext(JobSeekerContext);
    if (!ctx) throw new Error("useJobSeekerContext must be used within JobSeekerProvider");
    return ctx;
}
