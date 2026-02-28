"use client";
import {  createContext, useContext, useState, useCallback , useRef } from "react";
import apiClient from "../lib/apiClient";

const JobListContext = createContext();

export function JobListProvider({ children }) {
    const fetchedRef = useRef(false);
    const fetchPromiseRef = useRef(null);
    const [jobs, setJobs] = useState([]);
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
            const res = await apiClient.get("/api/api-job-lists");
            const data = res.data || [];
            setJobs(data);
            return data;
        } catch (err) {
            setError(err.message || "Failed to fetch jobs");
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
            return jobs.find((item) => item.id === parseInt(id)) || null;
        },
        [jobs]
    );

    const create = useCallback(async (data) => {
        const res = await apiClient.post("/api/api-job-lists", data);
        const created = res.data;
        setJobs((prev) => [created, ...prev]);
        return created;
    }, []);

    const update = useCallback(async (id, data) => {
        const res = await apiClient.put(`/api/api-job-lists?id=${id}`, data);
        const updated = res.data;
        setJobs((prev) => prev.map((j) => (j.id === parseInt(id) ? updated : j)));
        return updated;
    }, []);

    const remove = useCallback(async (id) => {
        await apiClient.delete(`/api/api-job-lists?id=${id}`);
        setJobs((prev) => prev.filter((j) => j.id !== parseInt(id)));
    }, []);

    return (
        <JobListContext.Provider
            value={{ jobs, loading, error, fetchAll, getById, create, update, remove }}
        >
            {children}
        </JobListContext.Provider>
    );
}

export function useJobListContext() {
    const ctx = useContext(JobListContext);
    if (!ctx) throw new Error("useJobListContext must be used within JobListProvider");
    return ctx;
}
