"use client";
import React, { useRef, useState, useEffect } from "react";
import { FaUser, FaAngleLeft, FaEnvelope, FaLock, FaMapMarkerAlt, FaMosque, FaPhone, FaVenusMars, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileUser, setProfileUser] = useState(null);
    const [initializing, setInitializing] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [showRegisterForm, setShowRegisterForm] = useState(false);

    // On mount: check for auth token/session. If present, fetch user details from API.
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return;
            const sessionRaw = localStorage.getItem('userSession');
            const userDataRaw = localStorage.getItem('userData');

            if (sessionRaw || userDataRaw) {
                setIsAuthenticated(true);
                setProfileLoading(true);

                // Prefer local userData to display quickly, but still call API to get latest data
                let localEmail = null;
                if (userDataRaw) {
                    try {
                        const ud = JSON.parse(userDataRaw);
                        localEmail = ud.email || null;
                        setProfileUser(ud);
                        setFullName(ud.fullName || '');
                        setEmail(ud.email || '');
                        setAddress(ud.address || '');
                        setAreaMasjid(ud.areaMasjid || '');
                        setMobileValue(ud.mobile || '');
                        setGender(ud.gender || '');
                    } catch (e) {
                        // ignore parse error
                    }
                }

                // Call GET API to fetch latest users and pick matching user by email
                (async () => {
                    try {
                        const res = await apiClient.get('/api/auth/register');
                        const users = res?.data?.users || [];
                        const matchEmail = localEmail || (sessionRaw ? (() => { try { return JSON.parse(sessionRaw).user?.email } catch (e) { return null } })() : null);
                        if (matchEmail) {
                            const found = users.find(u => u.email === matchEmail);
                            if (found) {
                                setProfileUser(found);
                                setFullName(found.fullName || '');
                                setEmail(found.email || '');
                                setAddress(found.address || '');
                                setAreaMasjid(found.areaMasjid || '');
                                setMobileValue(found.mobile || '');
                                setGender(found.gender || '');
                            }
                        }
                    } catch (err) {
                        console.error('Failed to fetch profile users', err);
                    } finally {
                        setProfileLoading(false);
                        setInitializing(false);
                    }
                })();
            } else {
                // No session found
                setProfileLoading(false);
                setInitializing(false);
            }
        } catch (err) {
            console.error('Auth check error', err);
            setProfileLoading(false);
            setInitializing(false);
        }
    }, []);

    // If profileUser is populated (from API or localStorage), ensure we mark as authenticated
    useEffect(() => {
        if (profileUser) setIsAuthenticated(true);
    }, [profileUser]);

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

            // update local state and show success
            setLoading(false);
            setProfileUser(data.user || null);
            setFullName(data.user?.fullName || '');
            setEmail(data.user?.email || '');
            setAddress(data.user?.address || '');
            setAreaMasjid(data.user?.areaMasjid || '');
            setMobileValue(data.user?.mobile || '');
            setGender(data.user?.gender || '');
            setIsAuthenticated(true);
            // Close the register form after successful registration
            setShowRegisterForm(false);

            setSuccessMessage("Registration successful!");
            setShowSuccessToast(true);

            // Refresh the current route so any server data is re-fetched
            try {
                router.refresh();
            } catch (e) {
                // fallback to full reload if refresh isn't available
                if (typeof window !== 'undefined') window.location.reload();
            }

            setTimeout(() => setShowSuccessToast(false), 2000);
        } catch (err) {
            console.error("Registration error:", err);
            const apiMessage = err?.response?.data?.error || err?.message || "Something went wrong. Please try again.";
            setError(apiMessage);
            setLoading(false);
            // Re-open the register form so the user can correct errors
            setShowRegisterForm(true);
        }
    }

    const isDark = typeof window !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";

    async function handleLoginSubmit(e) {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);

        if (!email.trim() || !password) {
            setLoginError('Please enter email and password.');
            setLoginLoading(false);
            return;
        }

        try {
            const payload = { email: email.trim(), password };
            const res = await apiClient.post('/api/auth/login', payload);
            const data = res.data;

            if (data?.session) {
                localStorage.setItem('userSession', JSON.stringify(data.session));
            }
            if (data?.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
                setProfileUser(data.user);
                setFullName(data.user.fullName || '');
                setAddress(data.user.address || '');
                setAreaMasjid(data.user.areaMasjid || '');
                setMobileValue(data.user.mobile || '');
                setGender(data.user.gender || '');
            }

            setIsAuthenticated(true);
            setShowLoginModal(false);
            setLoginLoading(false);

            // Redirect to home page on successful login
            router.push('/');
        } catch (err) {
            console.error('Login error', err);
            const msg = err?.response?.data?.error || err?.message || 'Login failed';
            setLoginError(msg);
            setLoginLoading(false);
        }
    }

    // Function to get initials from full name
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-base-100 pb-24 pt-6 px-4">
            {/* Subtle pattern SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="p" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M40 0 L0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#p)" />
            </svg>

            <div className="w-full max-w-full relative z-10">

                {/* Title Section */}
                <div className="mb-8 flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-2 text-left">
                        My Profile
                    </h1>

                </div>
                {showLoginModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setShowLoginModal(false)} />
                        <div
                            className={`relative w-full max-w-md mx-4 rounded-xl p-6 shadow-lg z-10 ${isDark ? 'bg-neutral-900/95 text-white' : 'bg-black/90 text-white'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-semibold mb-4">Login to your account</h3>
                            {loginError && (
                                <div className="alert alert-error mb-3">
                                    <span>{loginError}</span>
                                </div>
                            )}
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="label pb-1"><span className="label-text text-white">Email</span></label>
                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered w-full bg-black/30 text-white placeholder-white/60" placeholder="you@example.com" required />
                                </div>
                                <div>
                                    <label className="label pb-1"><span className="label-text text-white">Password</span></label>
                                    <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full bg-black/30 text-white placeholder-white/60" placeholder="Password" required />
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <button type="submit" className="btn btn-primary flex-1" disabled={loginLoading}>
                                        {loginLoading ? 'Signing in...' : 'Login'}
                                    </button>
                                    <button type="button" className="btn btn-ghost" onClick={() => setShowLoginModal(false)} disabled={loginLoading}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Full Width Form */}
                <div className="w-full">
                    {initializing ? (
                        <div className="w-full text-center py-12">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p className="mt-4 text-base-content/60">Loading Profile ...</p>
                        </div>
                    ) : isAuthenticated ? (
                        profileLoading ? (
                            <div className="w-full text-center py-12">Loading profile...</div>
                        ) : (
                            <div className="w-full space-y-2 bg-base-100 backdrop-blur border border-base-300 shadow-sm rounded-2xl p-4">
                                {/* Welcome Banner */}
                                <div className="bg-gradient-to-r from-primary to-secondary p-2 flex items-center gap-3 rounded-xl ">
                                    <div className="w-12 h-12 rounded-xl bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                                        <span className="text-2xl font-bold text-white">
                                            {getInitials(fullName || profileUser?.fullName)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white/90 text-xxl font-medium">Welcome</div>
                                        <div className="text-white text-lg font-bold truncate">{fullName || profileUser?.fullName || 'User'}</div>
                                    </div>
                                </div>

                                {/* Profile Items List */}
                                {/* Full Name */}
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <FaUser className="text-base text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-base-content/60 dark:text-base-content/70">My Profile</div>
                                        <div className="font-semibold text-sm text-base-content truncate">{fullName || profileUser?.fullName || '-'}</div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <FaEnvelope className="text-base text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-base-content/60 dark:text-base-content/70">Email</div>
                                        <div className="font-semibold text-sm text-base-content truncate">{email || profileUser?.email || '-'}</div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <FaMapMarkerAlt className="text-base text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-base-content/60 dark:text-base-content/70">Saved Addresses</div>
                                        <div className="font-semibold text-sm text-base-content truncate">{address || profileUser?.address || '-'}</div>
                                    </div>
                                </div>

                                {/* Area Masjid */}
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                                        <FaMosque className="text-base text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-base-content/60 dark:text-base-content/70">Area Masjid</div>
                                        <div className="font-semibold text-sm text-base-content truncate">{areaMasjid || profileUser?.areaMasjid || '-'}</div>
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="flex items-center gap-3 p-3">
                                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                        <FaPhone className="text-base text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-base-content/60 dark:text-base-content/70">Mobile Number</div>
                                        <div className="font-semibold text-sm text-base-content truncate">{mobileValue || profileUser?.mobile || 'Not Provided'}</div>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('userSession');
                                        localStorage.removeItem('userData');
                                        setIsAuthenticated(false);
                                        setProfileUser(null);
                                        setShowRegisterForm(false);
                                        setSuccessMessage("Logged out successfully!");
                                        setShowSuccessToast(true);
                                        setTimeout(() => setShowSuccessToast(false), 3000);
                                    }}
                                    className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-gradient-to-r from-error to-error hover:opacity-90 transition-all shadow-lg"
                                >
                                    <FaSignOutAlt className="text-base text-white" />
                                    <span className="text-white font-bold text-base">Log Out</span>
                                </button>
                            </div>
                        )
                    ) : (
                        showRegisterForm ? (
                            <form onSubmit={handleRegister} className="w-full space-y-5 md:space-y-6">
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
                                            type="text"
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
                                            type="text"
                                            placeholder="Confirm your password"
                                            className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Address */}
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
                                </div>

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
                                <div className="flex items-center justify-between gap-3">

                                    <button type="button" onClick={() => { setShowLoginModal(true); }} className="text-md text-primary font-bold  underline">
                                        Already have an account? Login
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="w-full flex justify-center">
                                <div className="w-full max-w-sm text-center">
                                    <div className="mb-4 text-white font-extrabold text-lg">First Time User? Register</div>
                                    <button type="button" onClick={() => setShowRegisterForm(true)} className="btn btn-primary w-full h-14 rounded-full text-lg font-semibold">
                                        Register
                                    </button>
                                    <div className="mb-4 text-warning font-extrabold text-lg mt-2.5">Already Have Account ? Login</div>

                                    <button type="button" onClick={() => setShowLoginModal(true)} className="w-full mt-4 flex items-center justify-center gap-3 rounded-full h-14 border-2 border-green-500 text-white font-semibold bg-transparent hover:bg-green-600/10">

                                        <FaSignInAlt className="text-lg" />
                                        <span>Login</span>
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {showSuccessToast && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-3xl">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full h-12">
                        <div className="flex items-center gap-3 flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span className="font-semibold truncate">{successMessage}</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Logout card shown inside profile grid (rendered below Mobile card) */}
        </div>
        // </div>
    );
}

