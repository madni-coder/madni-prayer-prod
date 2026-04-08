"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft, Plus, Trash2, FileText, Image as ImageIcon,
    X, CheckCircle2, Send, Paperclip, Save, Loader2
} from "lucide-react";

// ─── Colour presets (same as create page) ────────────────────────────────────
const BTN_COLORS = [
    { label: "Green",  value: "green",  cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
    { label: "Blue",   value: "blue",   cls: "bg-blue-600 hover:bg-blue-700 text-white" },
    { label: "Red",    value: "red",    cls: "bg-red-600 hover:bg-red-700 text-white" },
    { label: "Orange", value: "orange", cls: "bg-orange-500 hover:bg-orange-600 text-white" },
    { label: "Purple", value: "purple", cls: "bg-purple-600 hover:bg-purple-700 text-white" },
];
const colorClass = (val) => BTN_COLORS.find((c) => c.value === val)?.cls || BTN_COLORS[0].cls;

export default function EditEventPage() {
    const router  = useRouter();
    const { id }  = useParams();

    // ── Loading / state ──────────────────────────────────────────────────────
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [saved,      setSaved]      = useState(false);
    const [error,      setError]      = useState(null);

    // ── Form fields ──────────────────────────────────────────────────────────
    const [title,       setTitle]       = useState("");
    const [description, setDescription] = useState("");

    // Buttons
    const [buttons,     setButtons]     = useState([]);
    const [newBtnLabel, setNewBtnLabel] = useState("");
    const [newBtnColor, setNewBtnColor] = useState("blue");

    // Existing files (from DB) — user can remove any
    const [existingImages, setExistingImages] = useState([]); // string URLs
    const [existingPdfs,   setExistingPdfs]   = useState([]); // { name, url }

    // New files to upload
    const [newFiles, setNewFiles] = useState([]); // { file: File, type: 'image'|'pdf' }

    const imageRef = useRef(null);
    const pdfRef   = useRef(null);

    // ── Fetch event on mount ─────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            try {
                const res  = await fetch("/api/committee-events");
                const json = await res.json();
                const ev   = (json.events || []).find((e) => e.id === id);
                if (!ev) throw new Error("Event not found");
                setTitle(ev.title || "");
                setDescription(ev.description || "");
                setButtons(
                    (Array.isArray(ev.buttons) ? ev.buttons : []).map((b, i) => ({
                        id: i + 1,
                        label: b.label,
                        color: b.color || "green",
                    }))
                );
                setExistingImages(Array.isArray(ev.image_urls)      ? ev.image_urls      : []);
                setExistingPdfs(  Array.isArray(ev.pdf_attachments) ? ev.pdf_attachments : []);
            } catch (err) {
                setError(err.message || "Failed to load event");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // ── Buttons helpers ───────────────────────────────────────────────────────
    const addButton = () => {
        const label = newBtnLabel.trim();
        if (!label) return;
        setButtons((prev) => [...prev, { id: Date.now(), label, color: newBtnColor }]);
        setNewBtnLabel("");
    };
    const removeButton = (btnId) => setButtons((prev) => prev.filter((b) => b.id !== btnId));
    const updateButton = (btnId, field, value) =>
        setButtons((prev) => prev.map((b) => (b.id === btnId ? { ...b, [field]: value } : b)));

    // ── File helpers ──────────────────────────────────────────────────────────
    const addNewFiles = (fileList, type) => {
        const arr = Array.from(fileList).map((file) => ({ file, type }));
        setNewFiles((prev) => [...prev, ...arr]);
    };
    const removeNewFile       = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    const removeExistingImage = (url) => setExistingImages((prev) => prev.filter((u) => u !== url));
    const removeExistingPdf   = (url) => setExistingPdfs((prev)   => prev.filter((p) => p.url !== url));

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append("title",              title);
            fd.append("description",        description);
            fd.append("buttons",            JSON.stringify(buttons.map(({ label, color }) => ({ label, color }))));
            fd.append("keepImageUrls",      JSON.stringify(existingImages));
            fd.append("keepPdfAttachments", JSON.stringify(existingPdfs));

            newFiles.filter((f) => f.type === "image").forEach((f) => fd.append("images", f.file));
            newFiles.filter((f) => f.type === "pdf").forEach((f)   => fd.append("pdfs",   f.file));

            const res  = await fetch(`/api/committee-events?id=${id}`, { method: "PATCH", body: fd });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update event");
            setSaved(true);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm text-gray-500">Loading event…</p>
            </div>
        </div>
    );

    // ── Success ───────────────────────────────────────────────────────────────
    if (saved) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
                <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Event Updated!</h2>
                <p className="text-gray-500 text-sm mb-6">Changes have been saved and published.</p>
                <div className="flex gap-3">
                    <button onClick={() => setSaved(false)}
                        className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit Again
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
                    <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
                    <p className="text-sm text-gray-500 truncate">ID: {id}</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <X size={14} className="shrink-0" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">

                {/* ── LEFT: Event Details ── */}
                <div className="lg:col-span-3 space-y-5">

                    {/* Title */}
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
                            placeholder="Describe the event…"
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{description.length} chars</p>
                    </div>

                    {/* Media & Attachments */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Media &amp; Attachments</h3>

                        {/* Existing images */}
                        {existingImages.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current Images</p>
                                <div className="flex flex-wrap gap-3">
                                    {existingImages.map((url, i) => (
                                        <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 shrink-0 w-24 aspect-[9/16]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(url)}
                                                className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Existing PDFs */}
                        {existingPdfs.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Current PDFs</p>
                                <div className="space-y-2">
                                    {existingPdfs.map((pdf, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                            <FileText size={14} className="text-red-400 shrink-0" />
                                            <span className="text-xs text-gray-700 truncate flex-1">{pdf.name}</span>
                                            <button onClick={() => removeExistingPdf(pdf.url)} className="text-red-400 hover:text-red-600">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload new files */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <button type="button" onClick={() => imageRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors">
                                <ImageIcon size={22} className="text-emerald-500" />
                                <span className="text-xs font-semibold text-gray-600">Add Images</span>
                            </button>
                            <input ref={imageRef} type="file" accept="image/*" multiple className="hidden"
                                onChange={(e) => addNewFiles(e.target.files, "image")} />

                            <button type="button" onClick={() => pdfRef.current?.click()}
                                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-red-400 hover:bg-red-50/50 transition-colors">
                                <Paperclip size={22} className="text-red-500" />
                                <span className="text-xs font-semibold text-gray-600">Attach PDF</span>
                            </button>
                            <input ref={pdfRef} type="file" accept="application/pdf" multiple className="hidden"
                                onChange={(e) => addNewFiles(e.target.files, "pdf")} />
                        </div>

                        {/* New file previews */}
                        {newFiles.length > 0 && (
                            <div className="flex flex-wrap gap-3 mt-1">
                                {newFiles.map((f, i) => (
                                    <div key={i} className={`relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0 ${f.type === 'image' ? 'w-24 aspect-[9/16]' : 'w-full max-w-[200px]'}`}>
                                        {f.type === "pdf" ? (
                                            <div className="flex items-center gap-1.5 px-2 py-3 h-full">
                                                <FileText size={18} className="text-red-500 shrink-0" />
                                                <span className="text-xs text-gray-700 truncate">{f.file.name}</span>
                                            </div>
                                        ) : (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={URL.createObjectURL(f.file)} alt="" className="w-full h-full object-cover" />
                                        )}
                                        <button type="button" onClick={() => removeNewFile(i)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: Vote Buttons + Save ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Vote Buttons */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-700 mb-1">Vote Buttons</h3>
                        <p className="text-xs text-gray-400 mb-4">Edit or remove existing buttons, or add new ones.</p>

                        <div className="space-y-2">
                            {buttons.map((btn) => (
                                <div key={btn.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <input type="text" value={btn.label}
                                        onChange={(e) => updateButton(btn.id, "label", e.target.value)}
                                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white" />
                                    <select value={btn.color}
                                        onChange={(e) => updateButton(btn.id, "color", e.target.value)}
                                        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400">
                                        {BTN_COLORS.map((c) => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${colorClass(btn.color)}`}>{btn.label}</span>
                                    <button type="button" onClick={() => removeButton(btn.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add new button */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Add New Button</p>
                            <div className="flex gap-2">
                                <input type="text" value={newBtnLabel}
                                    onChange={(e) => setNewBtnLabel(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") addButton(); }}
                                    placeholder="Button label…"
                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                                <select value={newBtnColor} onChange={(e) => setNewBtnColor(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-700 bg-white focus:outline-none">
                                    {BTN_COLORS.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={addButton}
                                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Save Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-sm font-bold text-gray-700 mb-4">Save Changes</h3>

                        <ul className="space-y-1.5 text-xs text-gray-500 mb-5">
                            <li className={`flex items-center gap-2 ${title.trim() ? "text-emerald-600" : ""}`}>
                                <CheckCircle2 size={13} className={title.trim() ? "text-emerald-500" : "text-gray-300"} /> Title
                            </li>
                            <li className={`flex items-center gap-2 ${description.trim() ? "text-emerald-600" : ""}`}>
                                <CheckCircle2 size={13} className={description.trim() ? "text-emerald-500" : "text-gray-300"} /> Description
                            </li>
                            <li className={`flex items-center gap-2 ${buttons.length > 0 ? "text-emerald-600" : ""}`}>
                                <CheckCircle2 size={13} className={buttons.length > 0 ? "text-emerald-500" : "text-gray-300"} />
                                {buttons.length} vote button{buttons.length !== 1 ? "s" : ""}
                            </li>
                            <li className="flex items-center gap-2 text-gray-400">
                                <CheckCircle2 size={13} className="text-gray-200" />
                                {existingImages.length + newFiles.filter(f => f.type === "image").length} image(s) · {existingPdfs.length + newFiles.filter(f => f.type === "pdf").length} PDF(s)
                            </li>
                        </ul>

                        <button type="button" onClick={handleSave} disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm">
                            {saving ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                            ) : (
                                <><Save size={15} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
