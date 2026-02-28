"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJobListContext } from "../../../../context/JobListContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function CreateJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { create } = useJobListContext();
    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        mobile: "",
        type: "Full-time",
        salary: "",
        description: "",
        requirements: [""],
        responsibilities: [""],
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        setLoading(false);
    }, [router]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const dataToSubmit = {
                ...formData,
                requirements: formData.requirements.filter(r => r.trim()),
                responsibilities: formData.responsibilities.filter(r => r.trim()),
                postedDate: new Date().toISOString(),
            };

            await create(dataToSubmit);
            router.push("/admin/job-lists");
        } catch (error) {
            console.error("Error creating job:", error);
            alert("Failed to create job. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6">
                <button
                    onClick={() => router.push("/admin/job-lists")}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Job Lists
                </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h1 className="text-2xl font-bold text-black mb-6">Create New Job</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                placeholder=""
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
                                placeholder=""
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
                                placeholder=""
                            />
                            {errors.location && <span className="text-red-500 text-xs mt-1">{errors.location}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Mobile
                            </label>
                            <input
                                type="text"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded text-gray-900 border-gray-300"
                                placeholder=""
                            />
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
                                placeholder=""
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
                            placeholder=""
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
                                    placeholder=""
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
                                    placeholder=""
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
                            onClick={() => router.push("/admin/job-lists")}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                        >
                            {submitting ? "Creating..." : "Create Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
