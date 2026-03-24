"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import {
    Plus, Minus, X, ChevronDown, CheckCircle, AlertCircle,
    Upload, Calendar, Clock, ArrowLeft
} from "lucide-react";
import AnimatedLooader from "../../../components/animatedLooader";

// Sanitize and display-friendly title (strip trailing random slug parts)
function sanitizeText(text) {
    if (text == null) return "";
    const str = String(text);
    const withoutTags = str.replace(/<[^>]*>/g, "");
    if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = withoutTags;
        return textarea.value;
    }
    return withoutTags;
}

function displayTitle(text) {
    const clean = sanitizeText(text);
    // remove trailing space or hyphen/underscore + 6 alphanumeric chars (common unique suffix)
    return clean.replace(/(?:\s|[-_])[A-Za-z0-9]{6}$/i, "").trim();
}

// ─── Static Mock Schemas (removed demo data) ────────────────────────────────
const MOCK_SCHEMAS = {};

// ─── Individual Field Renderers ───────────────────────────────────────────────

function TextField({ field, value, onChange }) {
    const inputType = field.type === "phone" ? "tel" : (field.type ?? "text");
    return (
        <input
            id={field.id}
            type={inputType}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            style={{ "--tw-ring-color": "#7c3aed" }}
        />
    );
}

function TextareaField({ field, value, onChange }) {
    return (
        <textarea
            id={field.id}
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
        />
    );
}

function NumberField({ field, value, onChange }) {
    return (
        <input
            id={field.id}
            type="number"
            value={value ?? ""}
            onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
        />
    );
}

function DropdownField({ field, value, onChange }) {
    return (
        <div className="relative">
            <select
                id={field.id}
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                required={field.required}
                className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition appearance-none"
            >
                <option value="">{field.placeholder || "— Select —"}</option>
                {(field.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-80 pointer-events-none" />
        </div>
    );
}

function RadioField({ field, value, onChange }) {
    return (
        <div className="flex flex-wrap gap-3">
            {(field.options || []).map(opt => (
                <label key={opt}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition text-sm font-medium ${value === opt ? "border-transparent text-primary-content bg-primary" : "border-base-300 text-white font-bold hover:border-base-200"}`}>
                    <input
                        type="radio"
                        name={field.key}
                        value={opt}
                        required={field.required}
                        checked={value === opt}
                        onChange={() => onChange(opt)}
                        className="sr-only"
                    />
                    {value === opt ? <CheckCircle className="w-4 h-4 shrink-0 text-white" /> : <div className="w-4 h-4 rounded-full border-2 border-white shrink-0" />}
                    {opt}
                </label>
            ))}
        </div>
    );
}

function CheckboxField({ field, value, onChange }) {
    const checked = !!value;
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <input
                id={field.id}
                name={field.key}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                required={field.required}
            />
            <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${checked ? "border-transparent bg-primary" : "border-white group-hover:border-white"}`}>
                {checked && <CheckCircle className="w-3.5 h-3.5 text-primary-content" />}
            </div>
            <span className="text-sm font-bold text-white leading-snug">{field.label}</span>
        </label>
    );
}

function CheckboxGroupField({ field, value = [], onChange }) {
    const toggle = (opt) => {
        const current = Array.isArray(value) ? value : [];
        onChange(current.includes(opt) ? current.filter(v => v !== opt) : [...current, opt]);
    };
    return (
        <div className="flex flex-wrap gap-2">
            {(field.options || []).map((opt, idx) => {
                const checked = Array.isArray(value) && value.includes(opt);
                return (
                    <label key={opt + "-" + idx}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition text-sm font-medium ${checked ? "border-transparent text-primary-content bg-primary" : "border-white text-white font-bold hover:border-white"}`}>
                        <input
                            type="checkbox"
                            className="sr-only"
                            name={field.key}
                            id={`${field.id || field.key}-${idx}`}
                            checked={checked}
                            onChange={() => toggle(opt)}
                            // only set required on the first checkbox so the group is validated as a group
                            required={field.required && idx === 0}
                        />
                        {opt}
                    </label>
                );
            })}
        </div>
    );
}

function ArrayField({ field, value = [], onChange }) {
    const items = Array.isArray(value) ? value : [];
    const add = () => onChange([...items, ""]);
    const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
    const update = (i, val) => {
        const next = [...items];
        next[i] = val;
        onChange(next);
    };
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <input
                        type={field.itemType || "text"}
                        value={item}
                        onChange={e => update(i, e.target.value)}
                        placeholder={field.placeholder || `Item ${i + 1}`}
                        className="flex-1 px-3 py-2 border border-base-300 bg-base-200 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <button type="button" onClick={() => remove(i)}
                        className="p-2 text-white font-bold hover:text-red-400 hover:bg-red-50 rounded-lg transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={add}
                className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-focus transition">
                <Plus className="w-4 h-4" />
                {field.placeholder ? `Add ${field.label}` : "Add item"}
            </button>
        </div>
    );
}

function AddressField({ field, value = {}, onChange }) {
    return (
        <div className="space-y-3">
            <input
                type="text"
                value={value.locality || ""}
                onChange={e => onChange({ ...value, locality: e.target.value })}
                placeholder="Locality / Area"
                className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <input
                type="text"
                value={value.city || ""}
                onChange={e => onChange({ ...value, city: e.target.value })}
                placeholder="City"
                className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
        </div>
    );
}

function MasjidField({ field, value = {}, onChange }) {
    return (
        <div className="space-y-3">
            <input
                type="text"
                value={value.masjidName || ""}
                onChange={e => onChange({ ...value, masjidName: e.target.value })}
                placeholder="Name of Masjid"
                className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <input
                type="text"
                value={value.locality || ""}
                onChange={e => onChange({ ...value, locality: e.target.value })}
                placeholder="Locality / Area"
                className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
            <input
                type="text"
                value={value.city || ""}
                onChange={e => onChange({ ...value, city: e.target.value })}
                placeholder="City"
                className="w-full px-4 py-2.5 border border-base-300 bg-base-200 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
            />
        </div>
    );
}

// ─── Shared Info Modal ───────────────────────────────────────────────────────
function InfoModal({ title, content, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onMouseDown={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Sheet — bottom-sheet on mobile, centered card on sm+ */}
            <div
                className="relative bg-base-100 w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[80vh] sm:mx-4"
                onMouseDown={e => e.stopPropagation()}
            >
                {/* Sticky header — drag handle merged inside, amber/warning toned */}
                <div className="flex flex-col shrink-0 sm:rounded-t-2xl rounded-t-3xl"
                    style={{ background: "linear-gradient(160deg, #3d2800 0%, #2a1c00 100%)", borderBottom: "1px solid rgba(251,191,36,0.18)" }}>
                    {/* Drag handle — mobile only, lives inside header so no double strip */}
                    <div className="flex justify-center pt-2.5 pb-0 sm:hidden" aria-hidden>
                        <div className="w-9 h-[4px] rounded-full" style={{ background: "rgba(251,191,36,0.35)" }} />
                    </div>
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "rgba(251,191,36,0.18)" }}>
                                <AlertCircle className="w-4 h-4" style={{ color: "#fbbf24" }} />
                            </div>
                            <h3 className="text-base font-bold leading-snug truncate" style={{ color: "#fef3c7" }}>
                                {title || "Information"}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="ml-3 w-8 h-8 flex items-center justify-center rounded-full transition-colors shrink-0"
                            style={{ background: "rgba(251,191,36,0.18)", color: "#fbbf24" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(251,191,36,0.32)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(251,191,36,0.18)"}
                        >
                            <X className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 bg-base-100">
                    <p className="text-sm text-base-content whitespace-pre-line leading-[1.9] tracking-wide">
                        {content}
                    </p>
                </div>

                {/* Sticky footer — matching amber tone */}
                <div className="px-5 py-2.5 shrink-0 sm:rounded-b-2xl rounded-b-none flex justify-center"
                    style={{ background: "linear-gradient(160deg, #2a1c00 0%, #3d2800 100%)", borderTop: "1px solid rgba(251,191,36,0.18)", paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-10 py-2.5 rounded-full text-sm font-semibold transition active:scale-[0.97]"
                        style={{
                            background: "rgba(251,191,36,0.12)",
                            border: "1.5px solid rgba(251,191,36,0.55)",
                            color: "#fbbf24",
                            boxShadow: "0 0 18px rgba(251,191,36,0.12)"
                        }}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

function ButtonField({ field, color }) {
    const [popupOpen, setPopupOpen] = useState(false);

    const handleClick = () => {
        if (field.action === "toast") {
            const type = field.toastType || "success";
            const msg = field.toastMessage || "Action triggered";
            if (type === "success") toast.success(msg);
            else if (type === "error") toast.error(msg);
            else if (type === "warning") toast.warning(msg);
            else toast.info(msg);
        } else {
            setPopupOpen(true);
        }
    };

    return (
        <>
            <button type="button" onClick={handleClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 bg-transparent hover:bg-amber-500/10 active:scale-[0.97] transition font-bold tracking-widest text-xs uppercase"
                style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
                {field.label}
                <ChevronDown className="w-3.5 h-3.5 -rotate-90 shrink-0" />
            </button>
            {field.helperText && (
                <p className="text-xs font-bold text-white/60 mt-1 pl-1">{field.helperText}</p>
            )}
            {popupOpen && (
                <InfoModal
                    title={field.popupTitle}
                    content={field.popupContent}
                    onClose={() => setPopupOpen(false)}
                />
            )}
        </>
    );
}

function PopupField({ field }) {
    const [popupOpen, setPopupOpen] = useState(false);
    const triggerType = field.triggerType || field.display || "button";

    return (
        <>
            {triggerType === "link" ? (
                <button type="button" onClick={() => setPopupOpen(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-2 hover:underline transition"
                    style={{ color: "#f59e0b" }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {field.label || "View"}
                </button>
            ) : (
                <button type="button" onClick={() => setPopupOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 bg-transparent hover:bg-amber-500/10 active:scale-[0.97] transition font-bold tracking-widest text-xs uppercase"
                    style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
                    {field.label || "View"}
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 shrink-0" />
                </button>
            )}
            {field.helperText && (
                <p className="text-xs font-bold text-white/60 mt-1 pl-1">{field.helperText}</p>
            )}
            {popupOpen && (
                <InfoModal
                    title={field.popupTitle}
                    content={field.popupContent}
                    onClose={() => setPopupOpen(false)}
                />
            )}
        </>
    );
}

function FieldWrapper({ field, value, onChange }) {
    if (field.type === "divider") {
        return <hr className="border-gray-200 my-2" />;
    }
    if (field.type === "heading") {
        const Tag = field.size || "h3";
        const classes = {
            h1: "text-2xl font-bold text-white",
            h2: "text-xl font-bold text-white",
            h3: "text-base font-bold text-white",
            p: "text-sm font-bold text-white",
        };
        return <Tag className={classes[field.size || "h3"]}>{field.text}</Tag>;
    }
    if (field.type === "popup") {
        return <PopupField field={field} />;
    }
    if (field.type === "button") {
        return <ButtonField field={field} />;
    }

    const renderInput = () => {
        switch (field.type) {
            case "textarea":
                // Treat legacy/incorrect textarea fields named 'name' as single-line text inputs
                if (/name/i.test(field.label || "") || /name/i.test(field.key || "")) {
                    return <TextField field={{ ...field, type: "text" }} value={value} onChange={onChange} />;
                }
                return <TextareaField field={field} value={value} onChange={onChange} />;
            case "notes":
                return <TextareaField field={field} value={value} onChange={onChange} />;
            case "number": return <NumberField field={field} value={value} onChange={onChange} />;
            case "email": return <TextField field={{ ...field, type: "email" }} value={value} onChange={onChange} />;
            case "phone": return <TextField field={{ ...field, type: "tel" }} value={value} onChange={onChange} />;
            case "dropdown": return <DropdownField field={field} value={value} onChange={onChange} />;
            case "radio": return <RadioField field={field} value={value} onChange={onChange} />;
            case "checkbox": return <CheckboxField field={field} value={value} onChange={onChange} />;
            case "checkboxGroup": return <CheckboxGroupField field={field} value={value} onChange={onChange} />;
            case "array": return <ArrayField field={field} value={value} onChange={onChange} />;
            case "address": return <AddressField field={field} value={value} onChange={onChange} />;
            case "masjid": return <MasjidField field={field} value={value} onChange={onChange} />;
            case "image": return (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-base-300 bg-base-200 rounded-xl cursor-pointer hover:border-primary transition text-white">
                    <Upload className="w-6 h-6 mb-1 opacity-70" />
                    <span className="text-xs opacity-70">Click to upload image</span>
                    <input type="file" accept="image/*" className="sr-only" />
                </label>
            );
            case "links":
                return (
                    <div className="flex flex-col gap-2">
                        {(field.links || []).map((ln, i) => (
                            <a key={i} href={ln.url || "#"} target="_blank" rel="noopener noreferrer" className="text-sm underline text-white font-semibold">
                                {ln.name || ln.url}
                            </a>
                        ))}
                    </div>
                );
            default: return <TextField field={field} value={value} onChange={onChange} />;
        }
    };

    return (
        <div className="space-y-1.5">
            {field.type !== "checkbox" && (
                <label htmlFor={field.id} className="flex items-center gap-1.5 text-sm font-bold text-white">
                    {field.label}
                    {field.required && <span className="text-red-500 text-base leading-none">*</span>}
                </label>
            )}
            {renderInput()}
            {field.helperText && field.type !== "button" && (
                <p className="text-xs font-bold text-white">{field.helperText}</p>
            )}
        </div>
    );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ schema, onReset }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-base-200">
            <div className="max-w-md w-full text-center space-y-5 bg-base-100 p-8 rounded-2xl shadow-xl border border-base-300">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg bg-primary">
                    <CheckCircle className="w-10 h-10 text-primary-content" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mt-4 text-base-content">Registration Complete!</h2>
                    <p className="opacity-70 mt-2">
                        Your registration for <strong>{displayTitle(schema.page_title)}</strong> has been received. We'll contact you soon.
                    </p>
                </div>
                <button onClick={onReset}
                    className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition shadow-md w-full mt-4 bg-primary text-primary-content">
                    Submit Another Response
                </button>
            </div>
        </div>
    );
}

// ─── Draft / Not Found Screen ─────────────────────────────────────────────────
function NotFoundScreen({ slug, isDraft }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    {isDraft ? <Clock className="w-8 h-8 text-gray-500" /> : <AlertCircle className="w-8 h-8 text-gray-500" />}
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                    {isDraft ? "This Page is Not Live Yet" : "Page Not Found"}
                </h2>
                <p className="text-gray-500 text-sm">
                    {isDraft
                        ? "This event page is currently in Draft mode. Please check back later."
                        : `No event page found for "${slug}". The link may be incorrect.`}
                </p>
            </div>
        </div>
    );
}

// ─── Main Public Event Page ───────────────────────────────────────────────────
export default function DynamicEventPage({ slug: propSlug }) {
    const slug = propSlug || "";

    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [alreadyRegistered, setAlreadyRegistered] = useState(false);
    const [fillForOther, setFillForOther] = useState(false);
    // prevent a very brief "Not Found" flash while client data hydrates
    const [showNotFound, setShowNotFound] = useState(false);
    // whether we've attempted to load the event from the API at least once
    const [attemptedFetch, setAttemptedFetch] = useState(false);
    const router = useRouter();

    // Build full API base for Tauri static export
    const apiBase = process.env.NEXT_PUBLIC_TAURI_STATIC_EXPORT === "1" || process.env.NEXT_PUBLIC_TAURI_BUILD === "1"
        ? (process.env.NEXT_PUBLIC_API_BASE_URL || "")
        : "";

    useEffect(() => {
        if (!slug) return;
        const controller = new AbortController();
        let timeoutId = null;
        let cancelled = false;
        setLoading(true);
        setAttemptedFetch(true);

        const maxRetries = 3;

        const fetchWithRetries = async (attempt = 0) => {
            try {
                const { default: axios } = await import("axios");
                const res = await axios.get(`${apiBase}/api/events/${slug}`, { signal: controller.signal, timeout: 15000 });
                if (cancelled) return;
                if (res.data?.event) {
                    const ev = res.data.event;
                    setSchema({
                        page_title: ev.title,
                        page_slug: ev.slug,
                        description: ev.description,
                        submit_label: ev.submit_label,
                        color: ev.theme_color,
                        isActive: ev.is_active,
                        allowMultipleRegistrations: ev.allow_multiple_registrations || false,
                        fields: ev.schema_fields || []
                    });
                } else {
                    // fallback or not found, keeping MOCK_SCHEMAS for visual fail-safe
                    setSchema(MOCK_SCHEMAS[slug] || null);
                }
                setLoading(false);
            } catch (err) {
                if (err?.code === "ERR_CANCELED" || err?.name === "AbortError") return;
                const isNetworkError = !err.response;
                // On network errors, retry a few times with exponential backoff
                if (isNetworkError && attempt < maxRetries) {
                    const backoff = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                    timeoutId = setTimeout(() => {
                        if (!controller.signal.aborted && !cancelled) fetchWithRetries(attempt + 1);
                    }, backoff);
                    return;
                }
                console.error("Failed to load schema:", err);
                setSchema(MOCK_SCHEMAS[slug] || null);
                setLoading(false);
            }
        };

        fetchWithRetries(0);

        return () => {
            cancelled = true;
            controller.abort();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [slug]);

    // Check localStorage to see if this device/browser already registered for this event
    useEffect(() => {
        if (!slug) return;
        try {
            const key = `registered_event_${slug}`;
            const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
            if (stored) setAlreadyRegistered(true);
        } catch (err) {
            console.warn("localStorage unavailable", err);
        }
    }, [slug]);

    // Delay showing the NotFound screen slightly so we don't flash it.
    // Only show NotFound after we've actually attempted a fetch.
    useEffect(() => {
        let t;
        // Wait a bit longer before showing the NotFound screen to avoid
        // a brief flash while the client data hydrates / the API responds.
        if (attemptedFetch && !loading && !schema) {
            t = setTimeout(() => setShowNotFound(true), 800);
        } else {
            setShowNotFound(false);
        }
        return () => clearTimeout(t);
    }, [loading, schema, attemptedFetch]);

    const setField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run HTML5 form validation first
        const form = e.target;
        if (form && typeof form.checkValidity === "function" && !form.checkValidity()) {
            if (typeof form.reportValidity === "function") {
                form.reportValidity();
            } else {
                toast.error("Please complete the required fields.");
            }
            return;
        }

        setSubmitting(true);
        try {
            const axios = (await import("axios")).default;
            await axios.post(`${apiBase}/api/events/${slug}/submit`, { formData });
            console.log("Form submitted successfully.");
            // Always persist registration locally to mark device as having submitted
            try {
                const key = `registered_event_${slug}`;
                localStorage.setItem(key, JSON.stringify({ time: Date.now() }));
                setAlreadyRegistered(true);
            } catch (err) {
                console.warn("Failed to persist registration locally:", err);
            }
            toast.success(`Registration received for ${displayTitle(schema?.page_title) || "this event"}`);
            setFormData({});
            if (schema?.allowMultipleRegistrations) {
                // Stay on page — show "already registered" card with Fill for other link
                setFillForOther(false);
            } else {
                // navigate back to events listing
                setTimeout(() => router.push('/events'), 2000);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to submit form. Please try again.");
            setTimeout(() => router.push('/events'), 2000);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="flex items-center justify-center">
                    <AnimatedLooader message="Loading event..." />
                </div>
            </div>
        );
    }

    // Avoid flashing the NotFound screen for a very short moment during
    // client-side navigation/hydration — keep showing the loader until the
    // small delay passes (see showNotFound state/effect above).
    if (!schema && !showNotFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="flex items-center justify-center">
                    <AnimatedLooader message="Loading event..." />
                </div>
            </div>
        );
    }

    if (!schema) return <NotFoundScreen slug={slug} isDraft={false} />;
    if (!schema.isActive) return <NotFoundScreen slug={slug} isDraft={true} />;

    return (
        <main className="min-h-screen bg-base-100 flex flex-col font-sans text-base-content">
            {/* Page Title Bar */}
            <div className="bg-base-100 px-4 py-5">
                <div className="max-w-xl mx-auto flex items-center gap-3">
                    <Link href="/events" className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-base-200 text-base-content transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-base-content">Event Registration</h1>
                </div>
            </div>

            {/* Event Announcement (title only, no filled tile) */}
            <div className="max-w-xl mx-auto px-4 pt-4">
                <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-content/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="text-2xl font-bold leading-tight text-primary ">{displayTitle(schema.page_title)}</div>
                        {schema.description && (
                            <div className="text-l text-white font-bold opacity-80 mt-1 whitespace-pre-line leading-relaxed">{schema.description}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-xl mx-auto px-4 py-8">
                {alreadyRegistered && !fillForOther ? (
                    <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden p-6 text-center">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg bg-primary">
                            <CheckCircle className="w-10 h-10 text-primary-content" />
                        </div>
                        <h2 className="text-2xl font-bold mt-4 text-base-content">You have already registered</h2>
                        <p className="opacity-70 mt-2">
                            Our records show you've already submitted a registration for <strong>{displayTitle(schema.page_title)}</strong>.
                        </p>
                        <div className="mt-5 flex gap-3 justify-center">
                            <Link href="/events" className="px-6 py-3 font-semibold rounded-xl hover:opacity-90 transition shadow-md bg-primary text-primary-content">Back to Events</Link>
                        </div>
                        {schema.allowMultipleRegistrations && (
                            <button
                                type="button"
                                onClick={() => { setFillForOther(true); setFormData({}); }}
                                className="mt-4 text-base font-semibold text-amber-500 underline underline-offset-2 hover:opacity-80 transition">
                                Fill the form for others ?
                            </button>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}
                        className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden text-base-content">
                        {/* Progress indicator */}
                        <div className="h-1 w-full bg-base-300">
                            <div className="h-full transition-all duration-500 bg-primary"
                                style={{
                                    width: `${Math.min(100, (Object.keys(formData).filter(k => formData[k] !== "" && formData[k] !== undefined && formData[k] !== false && !(Array.isArray(formData[k]) && formData[k].length === 0)).length / Math.max(1, schema.fields.filter(f => !["divider", "heading"].includes(f.type)).length)) * 100)}%`
                                }} />
                        </div>

                        <div className="p-6 space-y-6">
                            {schema.fields.map(field => (
                                <FieldWrapper
                                    key={field.id}
                                    field={field}
                                    value={formData[field.key]}
                                    onChange={val => setField(field.key, val)}
                                />
                            ))}

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-3.5 text-primary-content font-bold rounded-xl hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-70 flex items-center justify-center gap-2 text-base bg-primary">
                                    {submitting ? (
                                        <AnimatedLooader className="inline-block" message="Submitting..." />
                                    ) : (
                                        schema.submit_label || "Submit"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
