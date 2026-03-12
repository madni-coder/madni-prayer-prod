"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
    Plus, Minus, X, ChevronDown, CheckCircle, AlertCircle,
    Loader2, Clock, Calendar, Upload
} from "lucide-react";

// ─── Static Mock Schemas (same as in admin builder) ───────────────────────────
const MOCK_SCHEMAS = {
    "eid-milad-2026": {
        page_title: "Eid Milad-un-Nabi Program 2026",
        page_slug: "eid-milad-2026",
        description: "Join us for the annual Eid Milad-un-Nabi celebration. Fill in your details below to register and participate in the event.",
        submit_label: "Register Now",
        color: "#7c3aed",
        isActive: true,
        fields: [
            { id: "f1", key: "full_name", label: "Full Name", type: "text", placeholder: "Enter your full name", required: true, helperText: "As per your CNIC" },
            { id: "f2", key: "age", label: "Age", type: "number", placeholder: "Your age", min: 5, max: 120, required: true },
            { id: "f3", key: "gender", label: "Gender", type: "radio", options: ["Male", "Female"], required: true },
            { id: "f4", key: "city", label: "City", type: "dropdown", options: ["Karachi", "Lahore", "Islamabad", "Quetta", "Peshawar", "Other"], required: false, placeholder: "Select your city" },
            { id: "f5", key: "contact", label: "Contact Number", type: "phone", placeholder: "03xx-xxxxxxx", required: true },
            { id: "f6", key: "email", label: "Email Address", type: "email", placeholder: "you@example.com", required: false, helperText: "We'll send confirmation here" },
            {
                id: "f7", key: "section_sep", type: "divider"
            },
            { id: "fh2", key: "attend_section", type: "heading", text: "Attendance Preferences", size: "h3" },
            { id: "f8", key: "program_session", label: "Preferred Session", type: "radio", options: ["Morning (9:00 AM)", "Evening (6:00 PM)", "Both"], required: true },
            { id: "f9", key: "food_pref", label: "Food Preference", type: "checkboxGroup", options: ["Vegetarian", "Non-Vegetarian", "No Preference"], required: false },
            { id: "f10", key: "emergency_contact", label: "Emergency Contact", type: "object", required: false, fields: [{ key: "name", label: "Name", type: "text" }, { key: "phone", label: "Phone", type: "text" }] },
            { id: "f11", key: "languages", label: "Languages Known", type: "array", itemType: "text", placeholder: "Add a language" },
            {
                id: "f12", key: "event_rules_btn", label: "📋 View Event Rules", type: "button",
                action: "popup", helperText: "Click to read before registering",
                popupTitle: "Event Rules & Guidelines",
                popupContent: "1. Please arrive 15 minutes early.\n2. Dress modestly — Islamic attire preferred.\n3. Phones on silent during the program.\n4. Children must be accompanied by a guardian.\n5. Follow all instructions from the volunteers."
            },
            {
                id: "f13", key: "reminder_btn", label: "🔔 Set Reminder", type: "button",
                action: "toast", toastMessage: "Reminder set! Event is on Friday, 15th March 2026 at 6:00 PM.", toastType: "success"
            },
            { id: "f14", key: "accept_terms", label: "I agree to the event rules and guidelines", type: "checkbox", required: true },
        ],
    },
    "juma-khitab-registration": {
        page_title: "Juma Khitab — Volunteer Registration",
        page_slug: "juma-khitab-registration",
        description: "Sign up to volunteer for the Friday Juma Khitab. We need enthusiastic volunteers to help organize.",
        submit_label: "Sign Up as Volunteer",
        color: "#0284c7",
        isActive: true,
        fields: [
            { id: "f1", key: "full_name", label: "Full Name", type: "text", placeholder: "Your full name", required: true },
            { id: "f2", key: "contact", label: "Phone Number", type: "phone", placeholder: "03xx-xxxxxxx", required: true },
            { id: "f3", key: "role", label: "Preferred Role", type: "dropdown", options: ["Crowd Management", "Mic / Audio", "Food Distribution", "Parking", "Other"], required: true, placeholder: "Choose a role" },
            { id: "f4", key: "experience", label: "Previous Experience", type: "textarea", placeholder: "Briefly describe any relevant volunteer experience", required: false },
            { id: "f5", key: "availability", label: "Day of Availability", type: "checkboxGroup", options: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], required: true },
            { id: "f6", key: "confirm", label: "I confirm I am available and committed to volunteer", type: "checkbox", required: true },
        ],
    },
    "monthly-ijtima-2026": {
        page_title: "Monthly Ijtima — March 2026",
        page_slug: "monthly-ijtima-2026",
        description: "Register to attend the monthly gathering.",
        submit_label: "Register",
        color: "#059669",
        isActive: false,
        fields: [
            { id: "f1", key: "name", label: "Your Name", type: "text", required: true, placeholder: "Full name" },
            { id: "f2", key: "phone", label: "Phone", type: "phone", required: true, placeholder: "Phone number" },
        ],
    },
};

// ─── Individual Field Renderers ───────────────────────────────────────────────

function TextField({ field, value, onChange }) {
    return (
        <input
            id={field.id}
            type="text"
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition resize-none"
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
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition"
        />
    );
}

function DropdownField({ field, value, onChange, color }) {
    return (
        <div className="relative">
            <select
                id={field.id}
                value={value || ""}
                onChange={e => onChange(e.target.value)}
                required={field.required}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition appearance-none bg-white"
            >
                <option value="">{field.placeholder || "— Select —"}</option>
                {(field.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

function RadioField({ field, value, onChange, color }) {
    return (
        <div className="flex flex-wrap gap-3">
            {(field.options || []).map(opt => (
                <label key={opt}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition text-sm font-medium ${value === opt ? "border-transparent text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                    style={value === opt ? { backgroundColor: color } : {}}>
                    <input
                        type="radio"
                        name={field.key}
                        value={opt}
                        checked={value === opt}
                        onChange={() => onChange(opt)}
                        className="sr-only"
                    />
                    {value === opt ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                    {opt}
                </label>
            ))}
        </div>
    );
}

function CheckboxField({ field, value, onChange, color }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => onChange(!value)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition ${value ? "border-transparent" : "border-gray-300 group-hover:border-gray-400"}`}
                style={value ? { backgroundColor: color } : {}}>
                {value && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-sm text-gray-700 leading-snug">{field.label}</span>
        </label>
    );
}

function CheckboxGroupField({ field, value = [], onChange, color }) {
    const toggle = (opt) => {
        const current = Array.isArray(value) ? value : [];
        onChange(current.includes(opt) ? current.filter(v => v !== opt) : [...current, opt]);
    };
    return (
        <div className="flex flex-wrap gap-2">
            {(field.options || []).map(opt => {
                const checked = Array.isArray(value) && value.includes(opt);
                return (
                    <label key={opt}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition text-sm font-medium ${checked ? "border-transparent text-white" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
                        style={checked ? { backgroundColor: color } : {}}>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(opt)} />
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <button type="button" onClick={() => remove(i)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button type="button" onClick={add}
                className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition">
                <Plus className="w-4 h-4" />
                {field.placeholder ? `Add ${field.label}` : "Add item"}
            </button>
        </div>
    );
}

function ObjectField({ field, value = {}, onChange }) {
    const subFields = field.fields || [];
    return (
        <div className="pl-4 border-l-2 border-gray-200 space-y-3">
            {subFields.map(sub => (
                <div key={sub.key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{sub.label}</label>
                    <input
                        type={sub.type || "text"}
                        value={value[sub.key] || ""}
                        onChange={e => onChange({ ...value, [sub.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                </div>
            ))}
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
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 active:scale-95 transition shadow-sm"
                style={{ backgroundColor: color }}>
                {field.label}
            </button>
            {field.helperText && (
                <p className="text-xs text-gray-400 mt-1">{field.helperText}</p>
            )}

            {/* Popup Modal */}
            {popupOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">{field.popupTitle || "Information"}</h3>
                            <button onClick={() => setPopupOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                            {field.popupContent}
                        </div>
                        <button onClick={() => setPopupOpen(false)}
                            className="mt-5 w-full py-2 text-sm font-semibold text-white rounded-xl transition hover:opacity-90"
                            style={{ backgroundColor: color }}>
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function FieldWrapper({ field, value, onChange, color }) {
    if (field.type === "divider") {
        return <hr className="border-gray-200 my-2" />;
    }
    if (field.type === "heading") {
        const Tag = field.size || "h3";
        const classes = {
            h1: "text-2xl font-bold text-gray-900",
            h2: "text-xl font-bold text-gray-800",
            h3: "text-base font-semibold text-gray-700",
            p: "text-sm text-gray-500",
        };
        return <Tag className={classes[field.size || "h3"]}>{field.text}</Tag>;
    }
    if (field.type === "button") {
        return <ButtonField field={field} color={color} />;
    }

    const renderInput = () => {
        switch (field.type) {
            case "textarea": return <TextareaField field={field} value={value} onChange={onChange} />;
            case "number": return <NumberField field={field} value={value} onChange={onChange} />;
            case "email": return <TextField field={{ ...field, type: "email" }} value={value} onChange={onChange} />;
            case "phone": return <TextField field={{ ...field, type: "tel" }} value={value} onChange={onChange} />;
            case "date": return (
                <input id={field.id} type="date" value={value || ""}
                    onChange={e => onChange(e.target.value)} required={field.required}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 transition"
                />
            );
            case "time": return (
                <input id={field.id} type="time" value={value || ""}
                    onChange={e => onChange(e.target.value)} required={field.required}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 transition"
                />
            );
            case "dropdown": return <DropdownField field={field} value={value} onChange={onChange} color={color} />;
            case "radio": return <RadioField field={field} value={value} onChange={onChange} color={color} />;
            case "checkbox": return <CheckboxField field={field} value={value} onChange={onChange} color={color} />;
            case "checkboxGroup": return <CheckboxGroupField field={field} value={value} onChange={onChange} color={color} />;
            case "array": return <ArrayField field={field} value={value} onChange={onChange} />;
            case "object": return <ObjectField field={field} value={value} onChange={onChange} />;
            case "image": return (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-violet-400 transition">
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Click to upload image</span>
                    <input type="file" accept="image/*" className="sr-only" />
                </label>
            );
            default: return <TextField field={field} value={value} onChange={onChange} />;
        }
    };

    return (
        <div className="space-y-1.5">
            {field.type !== "checkbox" && (
                <label htmlFor={field.id} className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 text-base leading-none">*</span>}
                </label>
            )}
            {renderInput()}
            {field.helperText && field.type !== "button" && (
                <p className="text-xs text-gray-400">{field.helperText}</p>
            )}
        </div>
    );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ schema, onReset }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${schema.color}08, #f9fafb)` }}>
            <div className="max-w-md w-full text-center space-y-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg"
                    style={{ backgroundColor: schema.color }}>
                    <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Registration Complete!</h2>
                    <p className="text-gray-500 mt-2">
                        Your registration for <strong>{schema.page_title}</strong> has been received. We'll contact you soon.
                    </p>
                </div>
                <button onClick={onReset}
                    className="px-6 py-3 text-white font-semibold rounded-xl hover:opacity-90 transition shadow-md"
                    style={{ backgroundColor: schema.color }}>
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
export default function DynamicEventPage() {
    const params = useParams();
    const slug = params?.slug || "";

    const [schema, setSchema] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Simulate a server fetch — in real app this would be API call
        const timer = setTimeout(() => {
            setSchema(MOCK_SCHEMAS[slug] || null);
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, [slug]);

    const setField = (key, val) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1200));
        console.log("Form submitted:", { slug, formData });
        setSubmitting(false);
        setSubmitted(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p className="text-sm">Loading event...</p>
                </div>
            </div>
        );
    }

    if (!schema) return <NotFoundScreen slug={slug} isDraft={false} />;
    if (!schema.isActive) return <NotFoundScreen slug={slug} isDraft={true} />;
    if (submitted) return <SuccessScreen schema={schema} onReset={() => { setSubmitted(false); setFormData({}); }} />;

    const color = schema.color || "#7c3aed";

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Hero Header */}
            <div className="relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                        backgroundSize: "40px 40px"
                    }} />
                <div className="relative max-w-xl mx-auto px-6 py-10 text-white">
                    <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wide">
                        <Calendar className="w-3.5 h-3.5" />
                        Event Registration
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{schema.page_title}</h1>
                    {schema.description && (
                        <p className="mt-3 text-sm sm:text-base opacity-90 leading-relaxed">{schema.description}</p>
                    )}
                </div>
            </div>

            {/* Form Card */}
            <div className="max-w-xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Progress indicator */}
                    <div className="h-1 w-full" style={{ backgroundColor: `${color}22` }}>
                        <div className="h-full transition-all duration-500"
                            style={{
                                backgroundColor: color,
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
                                color={color}
                            />
                        ))}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.99] transition shadow-md disabled:opacity-70 flex items-center justify-center gap-2 text-base"
                                style={{ backgroundColor: color }}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    schema.submit_label || "Submit"
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Powered by the Dynamic Events System
                </p>
            </div>
        </div>
    );
}
