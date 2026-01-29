"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaMosque, FaPhone, FaVenusMars } from "react-icons/fa";
import apiClient from "../../lib/apiClient";
import { useRouter } from "next/navigation";

export default function MyProfilePage() {
    const router = useRouter();
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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    async function handleRegister(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!gender || !fullName.trim() || !address.trim() || !areaMasjid.trim() || !email.trim() || !password || !confirmPassword) {
            setError("Please fill in all required fields.");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (mobileValue.trim() && !/^\d{10}$/.test(mobileValue.trim())) {
            setError("Mobile number must be exactly 10 digits.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                email: email.trim(),
                password,
                gender,
                fullName: fullName.trim(),
                address: address.trim(),
                areaMasjid: areaMasjid.trim(),
                mobile: mobileValue.trim() || null,
            };

            const res = await apiClient.post("/api/auth/register", payload);
            const data = res.data;

            if (data?.session) {
                localStorage.setItem('userSession', JSON.stringify(data.session));
            }
            if (data?.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
            }

            setLoading(false);
            setSuccessMessage("Registration successful!");
            setShowSuccessToast(true);

            // keep user on page; other flows can read localStorage afterwards
            setTimeout(() => setShowSuccessToast(false), 2000);
        } catch (err) {
            console.error("Registration error:", err);
            const apiMessage = err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
            setError(apiMessage);
            setLoading(false);
        }
    }

    const isDark = typeof window !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 pb-24 pt-6 px-4">
            <div className="w-full max-w-full">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        MY PROFILE
                    </h1>
                    <p className="text-white text-sm">Complete your profile information</p>
                </div>

                {/* Full Width Form */}
                <form onSubmit={handleRegister} className="w-full space-y-5 md:space-y-6 max-w-2xl mx-auto">
                    {/* Gender Selection */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Gender <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="flex flex-row gap-3 sm:gap-4">
                            <label className={`flex-1 cursor-pointer border-2 rounded-xl px-5 py-3 transition-all duration-200 flex items-center justify-center gap-3 ${gender === "Male" ? 'border-primary bg-primary/10 shadow-md' : 'border-base-300 hover:border-primary/50 hover:bg-base-200'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Male"
                                    checked={gender === "Male"}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="radio radio-primary radio-sm"
                                />
                                <span className="font-semibold text-white">Male</span>
                            </label>
                            <label className={`flex-1 cursor-pointer border-2 rounded-xl px-5 py-3 transition-all duration-200 flex items-center justify-center gap-3 ${gender === "Female" ? 'border-secondary bg-secondary/10 shadow-md' : 'border-base-300 hover:border-secondary/50 hover:bg-base-200'}`}>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="Female"
                                    checked={gender === "Female"}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="radio radio-secondary radio-sm"
                                />
                                <span className="font-semibold text-white">Female</span>
                            </label>
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Full Name <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                            <input
                                ref={fullNameRef}
                                type="text"
                                placeholder="Enter your full name"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Email <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Password <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                            <input
                                type="password"
                                placeholder="Add a password"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Confirm Password <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                            <input
                                type="password"
                                placeholder="Confirm your password"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Address */

                        <div className="form-control w-full">
                            <label className="label pb-2">
                                <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                    Address <span className="text-error">*</span>
                                </span>
                            </label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                                <input
                                    ref={addressRef}
                                    type="text"
                                    placeholder="Enter your address"
                                    className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>
                        </div>}

                    {/* Area Masjid */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Area Masjid <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaMosque className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                            <input
                                ref={areaMasjidRef}
                                type="text"
                                placeholder="Enter your nearby masjid"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={areaMasjid}
                                onChange={(e) => setAreaMasjid(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-2 text-white">
                                Mobile Number
                                <span className="text-white/60 text-sm font-normal">(Optional)</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white-400 z-10" size={18} />
                            <input
                                ref={mobileRef}
                                type="text"
                                placeholder="Enter mobile number (optional)"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={mobileValue}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    if (/^\d*$/.test(v) && v.length <= 10) setMobileValue(v);
                                }}
                            />
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-error rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Registering...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>
                </form>

                {showSuccessToast && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
                        <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="font-semibold">{successMessage}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

