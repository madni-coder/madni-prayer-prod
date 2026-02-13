"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import apiClient from "../../../../lib/apiClient";
import { ArrowLeft, Edit2, Trash2, Plus } from "lucide-react";

export default function JobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params?.id;

    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [job, setJob] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        type: "",
        salary: "",
        description: "",
        requirements: [],
        responsibilities: [],
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (jobId) {
            fetchJob();
        }
    }, [jobId, router]);

    const fetchJob = async () => {
        try {
            const { data } = await apiClient.get(`/api/api-job-lists?id=${jobId}`);
            setJob(data);
            setFormData({
                title: data.title || "",
                company: data.company || "",
                location: data.location || "",
                type: data.type || "",
                salary: data.salary || "",
                description: data.description || "",
                requirements: data.requirements && data.requirements.length > 0 ? data.requirements : [""],
                responsibilities: data.responsibilities && data.responsibilities.length > 0 ? data.responsibilities : [""],
            });
        } catch (error) {
            console.error("Error fetching job:", error);
            alert("Failed to fetch job details");
            router.push("/admin/job-lists");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleArrayChange = (type, index, value) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].map((item, i) => (i === index ? value : item)),
        }));
    };

    const addArrayItem = (type) => {
        setFormData((prev) => ({
            ...prev,
            [type]: [...prev[type], ""],
        }));
    };

    const removeArrayItem = (type, index) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Job title is required";
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.location.trim()) newErrors.location = "Location is required";
        if (!formData.salary.trim()) newErrors.salary = "Salary is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                requirements: formData.requirements.filter(r => r.trim()),
                responsibilities: formData.responsibilities.filter(r => r.trim()),
            };

            await apiClient.put(`/api/api-job-lists?id=${jobId}`, dataToSubmit);
            alert("Job updated successfully");
            setIsEditing(false);
            fetchJob();
        } catch (error) {
            console.error("Error updating job:", error);
            alert("Failed to update job. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job?")) return;

        try {
            await apiClient.delete(`/api/api-job-lists?id=${jobId}`);
            alert("Job deleted successfully");
            router.push("/admin/job-lists");
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete job. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!job) {
        return <div>Job not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.push("/admin/job-lists")}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Job Lists
                </button>

                {!isEditing && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1.5 bg-cyan-500 text-white rounded hover:bg-cyan-600 flex items-center gap-2"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                {!isEditing ? (
                    <>
                        <h1 className="text-3xl font-bold text-black mb-2">{job.title}</h1>
                        <p className="text-lg text-cyan-600 font-semibold mb-4">{job.company}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-semibold">{job.location}</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Job Type</p>
                                <p className="font-semibold">{job.type}</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="text-xs text-gray-500">Salary</p>
                                <p className="font-semibold">{job.salary}</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3">Job Description</h3>
                            <p className="text-gray-800 whitespace-pre-wrap">{job.description}</p>
                        </div>

                        {job.requirements && job.requirements.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3">Requirements</h3>
                                <ul className="space-y-2">
                                    {job.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-cyan-600 mt-1">•</span>
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3">Responsibilities</h3>
                                <ul className="space-y-2">
                                    {job.responsibilities.map((resp, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-cyan-600 mt-1">•</span>
                                            <span>{resp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="text-sm text-gray-500">
                            <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
                            <p>Last Updated: {new Date(job.updatedAt).toLocaleString()}</p>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <h1 className="text-2xl font-bold text-black mb-6">Edit Job</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded text-gray-900 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name *
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded text-gray-900 ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.company && <span className="text-red-500 text-xs mt-1">{errors.company}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded text-gray-900 ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.location && <span className="text-red-500 text-xs mt-1">{errors.location}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Job Type *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Temporary">Temporary</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Salary Range *
                                </label>
                                <input
                                    type="text"
                                    name="salary"
                                    value={formData.salary}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded text-gray-900 ${errors.salary ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.salary && <span className="text-red-500 text-xs mt-1">{errors.salary}</span>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded h-32 text-gray-900 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.description && <span className="text-red-500 text-xs mt-1">{errors.description}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Requirements
                            </label>
                            {formData.requirements.map((req, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={req}
                                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded flex-1 text-gray-900"
                                    />
                                    {formData.requirements.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('requirements', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('requirements')}
                                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2 mt-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Requirement
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Responsibilities
                            </label>
                            {formData.responsibilities.map((resp, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={resp}
                                        onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded flex-1 text-gray-900"
                                    />
                                    {formData.responsibilities.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('responsibilities', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('responsibilities')}
                                className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2 mt-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Responsibility
                            </button>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        title: job.title || "",
                                        company: job.company || "",
                                        location: job.location || "",
                                        type: job.type || "",
                                        salary: job.salary || "",
                                        description: job.description || "",
                                        requirements: job.requirements || [""],
                                        responsibilities: job.responsibilities || [""],
                                    });
                                }}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                            >
                                {submitting ? "Updating..." : "Update Job"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
