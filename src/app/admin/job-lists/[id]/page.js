'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function JobAdminDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = parseInt(params.id, 10);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (Number.isNaN(id)) {
            setError("Invalid job id");
            setLoading(false);
            return;
        }

        const fetchJob = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/api-job-lists?id=${id}`);

                if (!response.ok) {
                    throw new Error("Job not found");
                }

                const data = await response.json();
                setJob(data);
            } catch (err) {
                setError(err.message || "Failed to fetch job");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job?")) {
            return;
        }

        try {
            setDeleting(true);
            const response = await fetch(`/api/api-job-lists?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error("Failed to delete job");
            }

            alert("Job deleted successfully");
            router.push("/admin/job-lists");
        } catch (err) {
            alert(err.message || "Failed to delete job");
            setDeleting(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">{error}</div>;
    }

    if (!job) {
        return <div className="p-6 text-center">Job not found</div>;
    }

    return (

        <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow mt-8 text-black">

            <div className="flex items-start justify-between mb-6 gap-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/job-lists" className="inline-flex items-center px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600">← Back</Link>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {deleting ? "Deleting..." : "Delete"}
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold leading-tight">{job.title}</h1>
                        <p className="text-sm text-gray-500 mt-1">Job ID: <span className="text-gray-700 font-medium">{job.id}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Company</h3>
                        <div className="text-lg font-semibold">{job.company || '-'}</div>
                    </div>

                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Location</h3>
                        <div className="text-lg">{job.location || '-'}</div>
                    </div>

                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Type</h3>
                        <div className="text-lg">{job.type || '-'}</div>
                    </div>

                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Salary</h3>
                        <div className="text-lg font-semibold">{job.salary || '-'}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Contact Mobile</h3>
                        <div className="text-lg font-medium">{job.mobile || '-'}</div>
                    </div>

                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Created At</h3>
                        <div className="text-sm text-gray-700">{job.createdAt ? new Date(job.createdAt).toLocaleString() : '-'}</div>
                    </div>

                    <div>
                        <h3 className="text-xs text-gray-500 uppercase">Updated At</h3>
                        <div className="text-sm text-gray-700">{job.updatedAt ? new Date(job.updatedAt).toLocaleString() : '-'}</div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-sm text-gray-500 uppercase mb-2">Description</h3>
                <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">{job.description || '-'}</div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <h4 className="text-sm text-gray-600 font-semibold mb-3">Requirements</h4>
                    {job.requirements && job.requirements.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-800">
                            {job.requirements.map((r, i) => (
                                <li key={i} className="mb-1">{r}</li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-600">None</div>
                    )}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border">
                    <h4 className="text-sm text-gray-600 font-semibold mb-3">Responsibilities</h4>
                    {job.responsibilities && job.responsibilities.length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-800">
                            {job.responsibilities.map((r, i) => (
                                <li key={i} className="mb-1">{r}</li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-600">None</div>
                    )}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
                <Link href={`/admin/job-lists/editJob?id=${job.id}`} className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600">Edit</Link>
                <Link href="/admin/job-lists" className="px-4 py-2 border rounded text-gray-700">Close</Link>
            </div>
        </div>
    );
}
