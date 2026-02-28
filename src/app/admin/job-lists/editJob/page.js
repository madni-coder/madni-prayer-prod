"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobListContext } from "../../../../context/JobListContext";

function EditJobContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const { jobs, loading: contextLoading, fetchAll, getById, update } = useJobListContext();

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

        async function loadJob() {
            try {
                // If jobs not loaded yet, fetch them
                if (jobs.length === 0) {
                    await fetchAll();
                }
            } catch (e) {
                console.error(e);
            }
        }

        loadJob();
    }, [id, fetchAll]);

    // Update form when jobs array changes (data loaded from context)
    useEffect(() => {
        if (!id || jobs.length === 0) return;
        const data = getById(id);
        if (data) {
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
        } else if (!contextLoading) {
            setLoading(false);
        }
    }, [id, jobs, getById, contextLoading]);

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

            await update(id, payload);
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
