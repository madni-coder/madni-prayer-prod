"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJobSeekerContext } from "../../../../context/JobSeekerContext";
import { ArrowLeft, Trash2, Mail, Phone, Copy, MapPin, Briefcase, DollarSign, Clock, Award, Home, Calendar, Users } from "lucide-react";

// Calculate age from dd/mm/yyyy string
function calculateAge(dob) {
    if (!dob || dob.length < 10) return null;
    const parts = dob.split("/");
    if (parts.length !== 3) return null;
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year || year < 1900 || year > new Date().getFullYear()) return null;
    const birthDate = new Date(year, month - 1, day);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    if (age < 0 || age > 120) return null;
    return age;
}

export default function JobSeekerDetailClient({ id }) {
    const router = useRouter();
    const seekerId = id;
    const { remove } = useJobSeekerContext();

    const [loading, setLoading] = useState(true);
    const [seeker, setSeeker] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Use relative URL — always hits the current server (localhost in dev, Vercel in prod)
        // Do NOT use apiClient here — it always points to NEXT_PUBLIC_API_BASE_URL (Vercel)
        if (seekerId) {
            setLoading(true);
            fetch(`/api/api-job-seekers?id=${seekerId}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Not found");
                    return res.json();
                })
                .then((data) => {
                    setSeeker(data);
                })
                .catch((err) => {
                    console.error("Failed to load job seeker:", err);
                    setSeeker(null);
                })
                .finally(() => setLoading(false));
        }
    }, [seekerId, router]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job seeker application?")) return;

        try {
            await remove(seekerId);
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

    const age = calculateAge(seeker.dateOfBirth);

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
                {/* Name + contact */}
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

                    {/* Gender — always shown */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <Users className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Gender</p>
                                {seeker.gender ? (
                                    <span className={`inline-block mt-0.5 px-2 py-0.5 text-sm font-semibold rounded ${
                                        seeker.gender === "Male" ? "bg-blue-100 text-blue-800" :
                                        seeker.gender === "Female" ? "bg-pink-100 text-pink-800" :
                                        "bg-gray-200 text-gray-700"
                                    }`}>{seeker.gender}</span>
                                ) : (
                                    <p className="font-semibold text-gray-400 italic">Not provided</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Date of Birth & Age — always shown */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <Calendar className="w-5 h-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Date of Birth</p>
                                {seeker.dateOfBirth ? (
                                    <>
                                        <p className="font-semibold text-gray-900">{seeker.dateOfBirth}</p>
                                        {age !== null && (
                                            <p className="text-xs text-cyan-600 font-medium mt-0.5">Age: {age} years</p>
                                        )}
                                    </>
                                ) : (
                                    <p className="font-semibold text-gray-400 italic">Not provided</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Job Category */}
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

                    {/* Expected Salary */}
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

                    {/* Experience */}
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

                    {/* City */}
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

                {/* Skills */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Award className="w-5 h-5 text-cyan-600" />
                        <h3 className="text-xl font-bold text-gray-900">Skills</h3>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{seeker.skills}</p>
                    </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Home className="w-5 h-5 text-cyan-600" />
                        <h3 className="text-xl font-bold text-gray-900">Address</h3>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-wrap">{seeker.address}</p>
                    </div>
                </div>

                {/* Footer */}
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
