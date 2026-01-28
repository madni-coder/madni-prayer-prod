"use client";
import React, { useRef, useState, useEffect } from "react";
import { X, User, MapPin, Phone, Building2 } from "lucide-react";
import fetchFromApi from "../utils/fetchFromApi";

export default function UserModal({
    open = false,
    onClose = () => { },
    onSuccess = () => { },
    tasbihCount = 0,
    // when true, always show the mobile entry step even if saved user data exists
    alwaysShowMobile = false,
    importantMessage = null,
    pageType = "tasbih", // "tasbih" or "zikr"
    zikrType = "General", // Type of zikr being submitted
}) {
    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const mobileRef = useRef(null);
    const areaMasjidRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [gender, setGender] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [areaMasjid, setAreaMasjid] = useState("");
    const [mobileValue, setMobileValue] = useState("");

    useEffect(() => {
        if (open) {
            setError(null);
            setGender("");
            setFullName("");
            setAddress("");
            setAreaMasjid("");
            setMobileValue("");
        }
    }, [open]);

    function resetForm() {
        setGender("");
        setFullName("");
        setAddress("");
        setAreaMasjid("");
        setMobileValue("");
        setError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validate required fields
        if (!gender || !fullName.trim() || !address.trim() || !areaMasjid.trim()) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        // Validate mobile if provided
        if (mobileValue.trim() && !/^\d{10}$/.test(mobileValue.trim())) {
            setError("Mobile number must be exactly 10 digits.");
            setLoading(false);
            return;
        }

        try {
            if (pageType === "zikr") {
                // For zikr page, save to zikr table
                const payload = {
                    gender,
                    fullName: fullName.trim(),
                    address: address.trim(),
                    areaMasjid: areaMasjid.trim(),
                    mobile: mobileValue.trim() || null,
                    zikrType: zikrType,
                    zikrCounts: tasbihCount,
                };

                const res = await fetchFromApi("/api/api-zikr", "POST", payload);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Failed to submit zikr record");
                    setLoading(false);
                    return;
                }

                // Success
                setLoading(false);
                resetForm();
                onSuccess(data);
                return;
            } else {
                // For tasbih page, use existing logic
                const payload = {
                    "Full Name": fullName.trim(),
                    Address: address.trim(),
                    "mobile number": mobileValue.trim() || "N/A",
                    tasbihCount: tasbihCount,
                    weeklyCounts: tasbihCount,
                };

                const res = await fetchFromApi("/api/api-tasbihUsers", "POST", payload);
                const data = await res.json();

                if (data.error === "REGISTERED_USER") {
                    setError("Mobile number is already registered.");
                    setLoading(false);
                    return;
                }
                if (res.status === 500) {
                    setError("Mobile number is already registered.");
                    setLoading(false);
                    return;
                }
                if (data.errors) {
                    setError(data.errors.join(". "));
                    setLoading(false);
                    return;
                }

                // Success
                setLoading(false);
                resetForm();
                onSuccess(data);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    }

    // Render only when parent asks to open
    if (!open) return null;

    const isDark = typeof window !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                    resetForm();
                    onClose();
                }}
            />

            <div className={`relative w-full max-w-md bg-base-100 rounded-2xl shadow-2xl border-2 ${isDark ? 'border-primary/30' : 'border-primary/20'} overflow-hidden`}>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary to-secondary p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <Building2 size={20} />
                            {pageType === "zikr" ? "Register for Zikr" : "Register for Durood"}
                        </h3>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Important Message */}
                {importantMessage && (
                    <div className="px-4 pt-4">
                        <div className="alert alert-info py-2 text-xs">
                            <span>{importantMessage}</span>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    {/* Gender Selection */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-sm font-medium">
                                Gender <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="flex gap-3">
                            <label className={`flex-1 cursor-pointer border-2 rounded-lg p-3 transition-all ${gender === "Male" ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Male"
                                    checked={gender === "Male"}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="radio radio-primary radio-sm"
                                />
                                <span className="ml-2 text-sm font-medium">Male</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border-2 rounded-lg p-3 transition-all ${gender === "Female" ? 'border-secondary bg-secondary/10' : 'border-base-300 hover:border-base-400'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Female"
                                    checked={gender === "Female"}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="radio radio-secondary radio-sm"
                                />
                                <span className="ml-2 text-sm font-medium">Female</span>
                            </label>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-sm font-medium">
                                Full Name <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <User
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                                size={18}
                            />
                            <input
                                ref={fullNameRef}
                                type="text"
                                placeholder="Enter your full name"
                                className="input input-bordered input-sm w-full pl-10"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-sm font-medium">
                                Address <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <MapPin
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                                size={18}
                            />
                            <input
                                ref={addressRef}
                                type="text"
                                placeholder="Enter your address"
                                className="input input-bordered input-sm w-full pl-10"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Area Masjid */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-sm font-medium">
                                Area Masjid <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <Building2
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                                size={18}
                            />
                            <input
                                ref={areaMasjidRef}
                                type="text"
                                placeholder="Enter your area masjid"
                                className="input input-bordered input-sm w-full pl-10"
                                value={areaMasjid}
                                onChange={(e) => setAreaMasjid(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Mobile Number (Optional) */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-sm font-medium">
                                Mobile Number <span className="text-base-content/40 text-xs">(Optional)</span>
                            </span>
                        </label>
                        <div className="relative">
                            <Phone
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
                                size={18}
                            />
                            <input
                                ref={mobileRef}
                                type="text"
                                placeholder="Enter mobile number (optional)"
                                className="input input-bordered input-sm w-full pl-10"
                                value={mobileValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value) && value.length <= 10) {
                                        setMobileValue(value);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Total Count Display */}
                    <div className="form-control w-full">
                        <label className="label py-1">
                            <span className="label-text text-sm font-medium">
                                {pageType === "zikr" ? "Total Zikr Count" : "Total Durood Count"}
                            </span>
                        </label>
                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 rounded-lg p-3">
                            <div className="text-3xl font-bold text-primary text-center">
                                {tasbihCount}
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="alert alert-error py-2 text-sm">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="stroke-current flex-shrink-0 h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm flex-1"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm flex-1"
                            disabled={loading || !gender || !fullName.trim() || !address.trim() || !areaMasjid.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Submitting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
