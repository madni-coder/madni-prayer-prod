"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CalendarRange, Plus, Pencil, Trash2, Eye, EyeOff,
    FileText, Clock, Users, ChevronRight, Search, ToggleLeft, ToggleRight
} from "lucide-react";

// ─── Mock Data (local state — no API/Prisma) ─────────────────────────────────
const INITIAL_PAGES = [
    {
        id: "page_1",
        slug: "eid-milad-2026",
        title: "Eid Milad-un-Nabi Program 2026",
        description: "Annual celebration registration form",
        isActive: true,
        fieldsCount: 9,
        submissionsCount: 47,
        createdAt: "2026-03-01",
        updatedAt: "2026-03-10",
        color: "#7c3aed",
    },
    {
        id: "page_2",
        slug: "juma-khitab-registration",
        title: "Juma Khitab — Volunteer Registration",
        description: "Sign-up form for khitab volunteers",
        isActive: true,
        fieldsCount: 6,
        submissionsCount: 12,
        createdAt: "2026-02-20",
        updatedAt: "2026-03-05",
        color: "#0284c7",
    },
    {
        id: "page_3",
        slug: "monthly-ijtima-2026",
        title: "Monthly Ijtima — March 2026",
        description: "Participant registration for monthly gathering",
        isActive: false,
        fieldsCount: 5,
        submissionsCount: 0,
        createdAt: "2026-03-08",
        updatedAt: "2026-03-08",
        color: "#059669",
    },
];

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ active }) {
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${active
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-500"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
            {active ? "Live" : "Draft"}
        </span>
    );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
function DeleteModal({ page, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-[fadeIn_0.15s_ease]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Event Page</h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                    Are you sure you want to delete <strong>"{page.title}"</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Create New Page Modal ────────────────────────────────────────────────────
function CreateModal({ onConfirm, onCancel }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#7c3aed");

    const colors = ["#7c3aed", "#0284c7", "#059669", "#dc2626", "#d97706", "#db2777", "#0891b2"];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        const slug = title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        onConfirm({ title: title.trim(), description: description.trim(), slug, color });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Create New Event Page</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Eid Milad Program 2026"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900"
                        />
                        {title && (
                            <p className="mt-1 text-xs text-gray-400">
                                Slug: /events/{title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Short description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme Color</label>
                        <div className="flex gap-2">
                            {colors.map(c => (
                                <button key={c} type="button" onClick={() => setColor(c)}
                                    className={`w-7 h-7 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"}`}
                                    style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onCancel}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition"
                            style={{ backgroundColor: color }}>
                            Create Page
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminEventsPage() {
    const [pages, setPages] = useState(INITIAL_PAGES);
    const [search, setSearch] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filtered = pages.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase())
    );

    const toggleActive = (id) => {
        setPages(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
    };

    const deletePage = (id) => {
        setPages(prev => prev.filter(p => p.id !== id));
        setDeleteTarget(null);
    };

    const createPage = (data) => {
        const newPage = {
            id: `page_${Date.now()}`,
            slug: data.slug,
            title: data.title,
            description: data.description,
            isActive: false,
            fieldsCount: 0,
            submissionsCount: 0,
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
            color: data.color,
        };
        setPages(prev => [newPage, ...prev]);
        setShowCreateModal(false);
    };

    const liveCount = pages.filter(p => p.isActive).length;
    const totalSubmissions = pages.reduce((a, p) => a + p.submissionsCount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarRange className="w-7 h-7 text-violet-600" />
                        Events / Programs
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Create fully dynamic event pages with custom fields — no code needed.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Event Page
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Pages", value: pages.length, icon: FileText, color: "bg-violet-50 text-violet-600" },
                    { label: "Live Now", value: liveCount, icon: Eye, color: "bg-emerald-50 text-emerald-600" },
                    { label: "All Submissions", value: totalSubmissions, icon: Users, color: "bg-blue-50 text-blue-600" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-gray-900 leading-none">{stat.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search event pages..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
            </div>

            {/* Pages List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
                    <CalendarRange className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-gray-500 font-medium">No event pages found</h3>
                    <p className="text-gray-400 text-sm mt-1">Create your first event page to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(page => (
                        <div key={page.id}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="flex items-start gap-0">
                                {/* Color Bar */}
                                <div className="w-1.5 rounded-l-xl self-stretch" style={{ backgroundColor: page.color }} />

                                <div className="flex-1 p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        {/* Info */}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-base font-semibold text-gray-900 truncate">{page.title}</h2>
                                                <StatusBadge active={page.isActive} />
                                            </div>
                                            {page.description && (
                                                <p className="text-sm text-gray-500 mt-0.5 truncate">{page.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1 font-mono">/events/{page.slug}</p>

                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {page.fieldsCount} fields
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {page.submissionsCount} submissions
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Updated {page.updatedAt}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Toggle Active */}
                                            <button
                                                onClick={() => toggleActive(page.id)}
                                                title={page.isActive ? "Set to Draft" : "Set to Live"}
                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${page.isActive
                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {page.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                {page.isActive ? "Live" : "Draft"}
                                            </button>

                                            {/* View Frontend */}
                                            <Link href={`/events/${page.slug}`} target="_blank"
                                                className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition">
                                                <Eye className="w-3.5 h-3.5" />
                                                Preview
                                            </Link>

                                            {/* Edit Builder */}
                                            <Link href={`/admin/events/${page.slug}`}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-white rounded-lg text-xs font-medium hover:opacity-90 transition"
                                                style={{ backgroundColor: page.color }}>
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>

                                            {/* Delete */}
                                            <button
                                                onClick={() => setDeleteTarget(page)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {deleteTarget && (
                <DeleteModal
                    page={deleteTarget}
                    onConfirm={() => deletePage(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            {showCreateModal && (
                <CreateModal
                    onConfirm={createPage}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
}
