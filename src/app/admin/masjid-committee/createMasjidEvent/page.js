"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Plus, Trash2, FileText, Image as ImageIcon,
    X, CheckCircle2, Eye, Send, Paperclip
} from "lucide-react";

// ─── Colour presets for dynamic buttons ──────────────────────────────────────
const BTN_COLORS = [
    { label: "Green", value: "green", cls: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" },
    { label: "Blue", value: "blue", cls: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" },
    { label: "Red", value: "red", cls: "bg-red-600 hover:bg-red-700 text-white border-red-600" },
    { label: "Orange", value: "orange", cls: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" },
    { label: "Purple", value: "purple", cls: "bg-purple-600 hover:bg-purple-700 text-white border-purple-600" },
];

const colorClass = (val) => BTN_COLORS.find((c) => c.value === val)?.cls || BTN_COLORS[0].cls;

// ─── File preview helper ───────────────────────────────────────────────────
function FilePreview({ file, onRemove }) {
    const isPdf = file.type === "application/pdf";
    const [previewUrl] = useState(() => (isPdf ? null : URL.createObjectURL(file)));
    return (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {isPdf ? (
                <div className="flex items-center gap-2 px-3 py-3">
                    <FileText size={24} className="text-red-500 shrink-0" />
                    <span className="text-xs text-gray-700 font-medium truncate flex-1">{file.name}</span>
                </div>
            ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={previewUrl} alt={file.name} className="w-full h-28 object-cover" />
            )}
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X size={12} />
            </button>
        </div>
    );
}

export default function CreateMasjidEventPage() {
    const router = useRouter();

    // ── Form state ──────────────────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [buttons, setButtons] = useState([
        { id: 1, label: "Agree", color: "green" },
        { id: 2, label: "Disagree", color: "red" },
    ]);
    const [newBtnLabel, setNewBtnLabel] = useState("");
    const [newBtnColor, setNewBtnColor] = useState("blue");
    const [files, setFiles] = useState([]); // { file: File, type: 'image' | 'pdf' }
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const imageInputRef = useRef(null);
    const pdfInputRef = useRef(null);

    // ── Button helpers ──────────────────────────────────────────────────────
    const addButton = () => {
        const label = newBtnLabel.trim();
        if (!label) return;
        setButtons((prev) => [...prev, { id: Date.now(), label, color: newBtnColor }]);
        setNewBtnLabel("");
    };

    const removeButton = (id) => setButtons((prev) => prev.filter((b) => b.id !== id));

    const updateButton = (id, field, value) =>
        setButtons((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));

    // ── File helpers ────────────────────────────────────────────────────────
    const addFiles = (fileList, type) => {
        const newFiles = Array.from(fileList).map((file) => ({ file, type }));
        setFiles((prev) => [...prev, ...newFiles]);
    };

    const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("title", title.trim());
            fd.append("description", description.trim());
            fd.append("buttons", JSON.stringify(buttons.map(({ label, color }) => ({ label, color }))));

            // Attach images
            files.filter((f) => f.type === "image").forEach((f) => fd.append("images", f.file));
            // Attach PDFs
            files.filter((f) => f.type === "pdf").forEach((f) => fd.append("pdfs", f.file));

            const res = await fetch("/api/committee-events", { method: "POST", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to publish event");
            setSubmitted(true);
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success screen ──────────────────────────────────────────────────────
    if (submitted) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event Created!</h2>
                <p className="text-gray-500 text-sm mb-6">The masjid event has been successfully published to all committee members.</p>
                <div className="flex gap-3">
                    <button onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setButtons([{ id: 1, label: "Agree", color: "green" }, { id: 2, label: "Disagree", color: "red" }]); setFiles([]); }}
                        className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Create Another
                    </button>
                    <button onClick={() => router.push("/admin/masjid-committee")}
                        className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            {/* ── Header ── */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => router.back()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">Create Masjid Event</h1>
                    <p className="text-sm text-gray-500">Create a new committee program with custom vote options</p>
                </div>
                <button
                    onClick={() => setPreviewMode((p) => !p)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${previewMode ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                >
                    <Eye size={15} /> {previewMode ? "Edit" : "Preview"}
                </button>
            </div>

            {previewMode ? (
                /* ═══════════════ PREVIEW MODE ═══════════════ */
                <div className="max-w-lg mx-auto">
                    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
                        {/* Preview Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-4 flex items-center gap-3">
                            <div className="bg-white/20 rounded-full p-2">
                                <Send size={16} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-white font-bold">{title || "Event Title"}</h2>
                                <p className="text-white/80 text-xs">From Raahe Hidayat Committee</p>
                            </div>
                        </div>

                        {/* Preview Images */}
                        {files.filter((f) => f.type === "image").length > 0 && (
                            <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100">
                                {files.filter((f) => f.type === "image").map((f, i) => {
                                    const url = URL.createObjectURL(f.file);
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    return <img key={i} src={url} alt="" className="w-full h-28 object-cover rounded-lg" />;
                                })}
                            </div>
                        )}

                        {/* Description */}
                        <div className="px-5 py-4 border-b border-gray-100">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{description || "Description will appear here…"}</p>
                        </div>

                        {/* PDF Attachments */}
                        {files.filter((f) => f.type === "pdf").length > 0 && (
                            <div className="px-5 py-3 border-b border-gray-100 space-y-2">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Attachments</p>
                                {files.filter((f) => f.type === "pdf").map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        <FileText size={16} className="text-red-400" />
                                        <span className="text-xs text-gray-700 truncate">{f.file.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Vote Buttons Preview */}
                        <div className="px-5 py-4 flex flex-wrap gap-2">
                            {buttons.map((btn) => (
                                <button key={btn.id} type="button" className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all ${colorClass(btn.color)}`}>
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Comment preview */}
                        <div className="px-5 pb-5">
                            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                                <p className="text-xs text-gray-400 mb-1 font-medium">Your comment (up to 500 chars)</p>
                                <div className="h-16 text-gray-300 text-sm italic">Comment area…</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button onClick={() => setPreviewMode(false)} className="text-sm text-blue-600 hover:underline">← Back to editing</button>
                    </div>
                </div>
            ) : (
                /* ═══════════════ EDIT MODE ═══════════════ */
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">

                    {/* ── LEFT COLUMN: Event Details ── */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* Event Title */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Ramadan Program 2026"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                rows={6}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the event details, purpose, schedule, etc. This will be shown to all committee members."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{description.length} chars</p>
                        </div>

                        {/* Media & Attachments */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Media & Attachments</h3>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {/* Image Upload */}
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                                >
                                    <ImageIcon size={24} className="text-emerald-500" />
                                    <span className="text-xs font-semibold text-gray-600">Add Images</span>
                                    <span className="text-xs text-gray-400">PNG, JPG, WEBP</span>
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => addFiles(e.target.files, "image")}
                                />

                                {/* PDF Upload */}
                                <button
                                    type="button"
                                    onClick={() => pdfInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-red-400 hover:bg-red-50/50 transition-colors"
                                >
                                    <Paperclip size={24} className="text-red-500" />
                                    <span className="text-xs font-semibold text-gray-600">Attach PDF</span>
                                    <span className="text-xs text-gray-400">PDF documents</span>
                                </button>
                                <input
                                    ref={pdfInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => addFiles(e.target.files, "pdf")}
                                />
                            </div>

                            {/* File previews */}
                            {files.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                    {files.map((f, i) => (
                                        <FilePreview key={i} file={f.file} onRemove={() => removeFile(i)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN: Vote Buttons ── */}
                    <div className="lg:col-span-2 space-y-5">

                        {/* Current Buttons */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-700 mb-1">Vote Buttons</h3>
                            <p className="text-xs text-gray-400 mb-4">These buttons will appear on the event card for committee members to vote.</p>

                            <div className="space-y-2">
                                {buttons.map((btn) => (
                                    <div key={btn.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                        {/* Label Input */}
                                        <input
                                            type="text"
                                            value={btn.label}
                                            onChange={(e) => updateButton(btn.id, "label", e.target.value)}
                                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                                        />
                                        {/* Color Select */}
                                        <select
                                            value={btn.color}
                                            onChange={(e) => updateButton(btn.id, "color", e.target.value)}
                                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                        >
                                            {BTN_COLORS.map((c) => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                        {/* Preview */}
                                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colorClass(btn.color)}`}>{btn.label}</span>
                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() => removeButton(btn.id)}
                                            disabled={false}
                                            className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add new button */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 mb-2">Add New Button</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newBtnLabel}
                                        onChange={(e) => setNewBtnLabel(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") addButton(); }}
                                        placeholder="Button label…"
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    />
                                    <select
                                        value={newBtnColor}
                                        onChange={(e) => setNewBtnColor(e.target.value)}
                                        className="border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-700 bg-white focus:outline-none"
                                    >
                                        {BTN_COLORS.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={addButton}
                                        className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                        title="Add button"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Publish Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Publish Event</h3>
                            <ul className="space-y-1.5 text-xs text-gray-500 mb-5">
                                <li className={`flex items-center gap-2 ${title.trim() ? "text-emerald-600" : ""}`}>
                                    <CheckCircle2 size={13} className={title.trim() ? "text-emerald-500" : "text-gray-300"} /> Title added
                                </li>
                                <li className={`flex items-center gap-2 ${description.trim() ? "text-emerald-600" : ""}`}>
                                    <CheckCircle2 size={13} className={description.trim() ? "text-emerald-500" : "text-gray-300"} /> Description added
                                </li>
                                <li className={`flex items-center gap-2 ${buttons.length > 0 ? "text-emerald-600" : ""}`}>
                                    <CheckCircle2 size={13} className={buttons.length > 0 ? "text-emerald-500" : "text-gray-300"} /> {buttons.length} vote button{buttons.length !== 1 ? "s" : ""} configured
                                </li>
                                <li className={`flex items-center gap-2 ${files.length > 0 ? "text-emerald-600" : "text-gray-400"}`}>
                                    <CheckCircle2 size={13} className={files.length > 0 ? "text-emerald-500" : "text-gray-200"} /> {files.length} file{files.length !== 1 ? "s" : ""} attached {files.length === 0 ? "(optional)" : ""}
                                </li>
                            </ul>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                            >
                                {submitting ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing…</>
                                ) : (
                                    <><Send size={15} /> Publish Event</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
