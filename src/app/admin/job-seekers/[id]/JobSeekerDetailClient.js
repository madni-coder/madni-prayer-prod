"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../../lib/apiClient";
import { ArrowLeft, Trash2, Mail, Phone, Copy, MapPin, Briefcase, DollarSign, Clock, Award, Home } from "lucide-react";

export default function JobSeekerDetailClient({ id }) {
    const router = useRouter();
    const seekerId = id;

    const [loading, setLoading] = useState(true);
    const [seeker, setSeeker] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }
        if (seekerId) {
            fetchSeeker();
        }
    }, [seekerId, router]);

    const fetchSeeker = async () => {
        try {
            const { data } = await apiClient.get(`/api/api-job-seekers?id=${seekerId}`);
            setSeeker(data);
        } catch (error) {
            console.error("Error fetching job seeker:", error);
            alert("Failed to fetch job seeker details");
            router.push("/admin/job-seekers");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job seeker application?")) return;

        try {
            await apiClient.delete(`/api/api-job-seekers?id=${seekerId}`);
            alert("Job seeker deleted successfully");
            router.push("/admin/job-seekers");
        } catch (error) {
            console.error("Error deleting job seeker:", error);
            alert("Failed to delete job seeker. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!seeker) {
        return <div>Job seeker not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <button
                    onClick={() => router.push("/admin/job-seekers")}
                    className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Job Seekers
                </button>

                <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Application
                </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-black mb-2">{seeker.fullName}</h1>
                    <div className="flex flex-col text-gray-600">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${seeker.email}`} className="hover:text-cyan-600">
                                {seeker.email}
                            </a>
                        </div>
                        {seeker.mobile && (
                            <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${seeker.mobile}`} className="hover:text-cyan-600">
                                    {seeker.mobile}
                                </a>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            await navigator.clipboard.writeText(seeker.mobile);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        } catch (err) {
                                            console.error("Copy failed", err);
                                            alert("Failed to copy number");
                                        }
                                    }}
                                    title="Copy number"
                                    className="ml-2 text-gray-500 hover:text-cyan-600 p-1 rounded"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                {copied && <span className="text-sm text-green-600 ml-1">Copied</span>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <Briefcase className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Job Category</p>
                                <p className="font-semibold text-gray-900">{seeker.jobCategory}</p>
                                {seeker.otherCategory && (
                                    <p className="text-sm text-gray-600">({seeker.otherCategory})</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <DollarSign className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Expected Salary</p>
                                <p className="font-semibold text-gray-900">{seeker.expectedSalary}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <Clock className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Years of Experience</p>
                                <p className="font-semibold text-gray-900">{seeker.experience} years</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <MapPin className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">City</p>
                                <p className="font-semibold text-gray-900">{seeker.city}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-cyan-600" />
                        <h3 className="text-xl font-bold text-gray-900">Skills</h3>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{seeker.skills}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Home className="w-5 h-5 text-cyan-600" />
                        <h3 className="text-xl font-bold text-gray-900">Address</h3>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{seeker.address}</p>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="text-sm text-gray-500">
                        <p>Applied: {new Date(seeker.createdAt).toLocaleString()}</p>
                        <p>Last Updated: {new Date(seeker.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
