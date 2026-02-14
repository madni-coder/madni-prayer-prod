"use client";
import React, { useEffect, useState, Suspense } from "react";

// Simple in-memory cache to avoid duplicate fetches (useful in dev StrictMode)
const jobCache = new Map();
import { useRouter, useSearchParams } from "next/navigation";

function EditJobContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "",
        company: "",
        location: "",
        mobile: "",
        type: "",
        salary: "",
        postedDate: "",
        description: "",
        requirements: "",
        responsibilities: "",
    });

    useEffect(() => {
        if (!id) return;

        // If we already have the job cached, reuse it to avoid duplicate network calls
        if (jobCache.has(id)) {
            const data = jobCache.get(id);
            setForm({
                title: data.title || "",
                company: data.company || "",
                location: data.location || "",
                mobile: data.mobile || "",
                type: data.type || "",
                salary: data.salary || "",
                postedDate: data.postedDate ? new Date(data.postedDate).toISOString().slice(0, 10) : "",
                description: data.description || "",
                requirements: Array.isArray(data.requirements) ? data.requirements.join(", ") : (data.requirements || ""),
                responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join(", ") : (data.responsibilities || ""),
            });
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(`/api/api-job-lists?id=${id}`);
                if (!res.ok) throw new Error("Failed to fetch job");
                const data = await res.json();

                // store in cache
                jobCache.set(id, data);

                if (cancelled) return;

                setForm({
                    title: data.title || "",
                    company: data.company || "",
                    location: data.location || "",
                    mobile: data.mobile || "",
                    type: data.type || "",
                    salary: data.salary || "",
                    postedDate: data.postedDate ? new Date(data.postedDate).toISOString().slice(0, 10) : "",
                    description: data.description || "",
                    requirements: Array.isArray(data.requirements) ? data.requirements.join(", ") : (data.requirements || ""),
                    responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.join(", ") : (data.responsibilities || ""),
                });
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => { cancelled = true; };
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id) return;
        setSaving(true);
        try {
            const payload = {
                title: form.title,
                company: form.company,
                location: form.location,
                mobile: form.mobile || null,
                type: form.type,
                salary: form.salary,
                postedDate: form.postedDate || undefined,
                description: form.description,
                requirements: form.requirements ? form.requirements.split(",").map(s => s.trim()).filter(Boolean) : [],
                responsibilities: form.responsibilities ? form.responsibilities.split(",").map(s => s.trim()).filter(Boolean) : [],
            };

            const res = await fetch(`/api/api-job-lists?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Unknown' }));
                throw new Error(err.error || 'Failed to update');
            }

            // mark job list to refresh (so list ignores cache once)
            try { sessionStorage.setItem('jobs_needs_refresh', '1'); } catch (e) { }
            // navigate back to list after update
            router.push("/admin/job-lists");
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update job. Check console for details.");
        } finally {
            setSaving(false);
        }
    };

    if (!id) {
        return (
            <div className="p-6">
                <div className="text-black">No job id provided.</div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow mt-8">
            <div className="flex items-center mb-4">
                <button type="button" onClick={() => router.push('/admin/job-lists')} className="text-sm text-black mr-4 px-2 py-1 rounded hover:bg-gray-100">← Back</button>
                <h2 className="text-xl font-bold text-black mb-0">Edit Job</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-black mb-1">Title</label>
                        <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Company</label>
                        <input name="company" value={form.company} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Location</label>
                        <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Mobile</label>
                        <input name="mobile" value={form.mobile} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Type</label>
                        <input name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Salary</label>
                        <input name="salary" value={form.salary} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Posted Date</label>
                        <input type="date" name="postedDate" value={form.postedDate} onChange={handleChange} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-black mb-1">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows={6} className="w-full border rounded px-3 py-2 text-black" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-black mb-1">Requirements (comma separated)</label>
                        <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                    <div>
                        <label className="block text-sm text-black mb-1">Responsibilities (comma separated)</label>
                        <textarea name="responsibilities" value={form.responsibilities} onChange={handleChange} rows={3} className="w-full border rounded px-3 py-2 text-black" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button type="submit" disabled={saving} className="px-4 py-2 bg-cyan-600 text-white rounded">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => router.push('/admin/job-lists')} className="px-4 py-2 border rounded text-black">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function EditJobPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        }>
            <EditJobContent />
        </Suspense>
    );
}
