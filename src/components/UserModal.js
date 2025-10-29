"use client";
import React, { useRef, useState, useEffect } from "react";
import { X, User, MapPin, Phone, BookUser } from "lucide-react";
import fetchFromApi from "../utils/fetchFromApi";

export default function UserModal({
    open = false,
    onClose = () => {},
    onSuccess = () => {},
    tasbihCount = 0,
    // when true, always show the mobile entry step even if saved user data exists
    alwaysShowMobile = false,
}) {
    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const mobileRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(open);
    const [step, setStep] = useState("mobile");
    const [savedMobile, setSavedMobile] = useState("");
    const [mobileValue, setMobileValue] = useState("");
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        setVisible(open);
        setError(null);

        // Load user data from localStorage
        if (open && typeof window !== "undefined") {
            const savedUserData = localStorage.getItem("userRegistrationData");
            if (savedUserData) {
                const parsedData = JSON.parse(savedUserData);
                setUserData(parsedData);
                setMobileValue(parsedData.mobile || "");
                setSavedMobile(parsedData.mobile || "");
                // Skip to review if user data exists unless the parent wants to
                // force showing the mobile entry screen (alwaysShowMobile)
                if (!alwaysShowMobile) {
                    setStep("review");
                } else {
                    setStep("mobile");
                }
            } else {
                setUserData(null);
                setMobileValue("");
                setStep("mobile");
            }
        }
    }, [open, alwaysShowMobile]);

    function resetForm() {
        if (fullNameRef.current) fullNameRef.current.value = "";
        if (addressRef.current) addressRef.current.value = "";
        if (mobileRef.current) mobileRef.current.value = "";
        setError(null);
        setStep("mobile");
        setMobileValue("");
        setUserData(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            let payload;
            if (step === "mobile") {
                payload = {
                    "mobile number": mobileValue.trim(),
                    tasbihCount: tasbihCount,
                    // include weeklyCounts (store tasbih count for weekly tracking)
                    weeklyCounts: tasbihCount,
                };
            } else if (step === "review") {
                // User is submitting with saved data
                payload = {
                    "mobile number": userData.mobile,
                    tasbihCount: tasbihCount,
                    weeklyCounts: tasbihCount,
                };
            } else {
                payload = {
                    "Full Name": fullNameRef.current?.value?.trim(),
                    Address: addressRef.current?.value?.trim(),
                    "mobile number": savedMobile,
                    tasbihCount: tasbihCount,
                    weeklyCounts: tasbihCount,
                };
            }
            const res = await fetchFromApi(
                `/api/api-tasbihUsers`,
                "POST",
                payload
            );
            const data = await res.json();
            if (data.error === "NOT_REGISTERED") {
                setStep("details");
                setSavedMobile(mobileValue.trim());
                setError(null);
                setLoading(false);
                return;
            }
            if (data.error === "REGISTERED_USER") {
                setStep("registered");
                setError(null);
                setLoading(false);
                // Show the registered message briefly, then notify parent with mobile and close
                const registeredMobile = mobileValue.trim() || userData?.mobile;
                setTimeout(() => {
                    onSuccess({ mobile: registeredMobile });
                }, 1500);
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
            // Show message card after successful submission
            setStep("submitted");
            setError(null);
            setLoading(false);

            // Save user data to localStorage
            const userDataToSave = {
                fullName: fullNameRef.current?.value?.trim(),
                address: addressRef.current?.value?.trim(),
                mobile: savedMobile || mobileValue.trim(),
            };
            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "userRegistrationData",
                    JSON.stringify(userDataToSave)
                );
            }

            // Delay notifying parent so the user can see the submitted message
            const submittedMobile = savedMobile || mobileValue.trim();
            setTimeout(() => {
                onSuccess({ mobile: submittedMobile });
            }, 1500);
            return;
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                    resetForm();
                    setVisible(false);
                    onClose();
                }}
            />

            <div className="modal modal-open">
                <div className="modal-box w-[min(95vw,480px)] max-h-[90vh] overflow-y-auto relative bg-base-100">
                    {/* Cross icon for closing modal */}
                    <button
                        type="button"
                        className="absolute top-4 right-4 btn btn-ghost btn-sm btn-circle"
                        onClick={() => {
                            resetForm();
                            setVisible(false);
                            onClose();
                        }}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                    <h3 className="font-bold text-lg text-base-content">
                        Register for Durood Counts
                    </h3>

                    {step === "registered" || step === "submitted" ? (
                        <div className="mt-6 text-center">
                            <div className="alert alert-success shadow-lg">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-current flex-shrink-0 h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-lg font-semibold">
                                    Your Durood Counts are submitted!
                                </span>
                            </div>
                        </div>
                    ) : step === "review" ? (
                        <div
                            className="mt-4 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="alert alert-info shadow-sm">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="stroke-current flex-shrink-0 w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                                <span className="text-sm">Welcome back!</span>
                            </div>
                            <div className="card bg-base-200 shadow-sm">
                                <div className="card-body space-y-4 p-4">
                                    <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary text-primary-content rounded-full w-12 h-12 flex items-center justify-center">
                                                <User
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-base-content/60">
                                                Full Name
                                            </p>
                                            <p className="font-semibold text-base-content">
                                                {userData?.fullName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="bg-secondary text-secondary-content rounded-full w-12 h-12 flex items-center justify-center">
                                                <MapPin
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-base-content/60">
                                                Address
                                            </p>
                                            <p className="font-semibold text-base-content">
                                                {userData?.address}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="bg-accent text-accent-content rounded-full w-12 h-12 flex items-center justify-center">
                                                <Phone
                                                    size={18}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-base-content/60">
                                                Mobile Number
                                            </p>
                                            <p className="font-semibold text-base-content">
                                                {userData?.mobile}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="divider my-2"></div>

                                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-xs text-base-content/60">
                                                Total Tasbih Count
                                            </p>
                                            <p className="text-2xl font-bold text-primary">
                                                {tasbihCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 pb-2">
                                <button
                                    className="btn btn-primary  sm:flex-initial"
                                    onClick={(e) => handleSubmit(e)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        "Confirm & Submit"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-ghost  sm:flex-initial border-base-content/20"
                                    onClick={() => {
                                        // Clear localStorage and start fresh
                                        if (typeof window !== "undefined") {
                                            localStorage.removeItem(
                                                "userRegistrationData"
                                            );
                                        }
                                        setUserData(null);
                                        setMobileValue("");
                                        setStep("mobile");
                                    }}
                                >
                                    Use Different Number
                                </button>
                            </div>{" "}
                            {error && (
                                <div className="alert alert-error shadow-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="stroke-current flex-shrink-0 h-6 w-6"
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
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-4 space-y-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {step === "mobile" && (
                                <>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Mobile Number
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={20}
                                                aria-hidden="true"
                                            />
                                            <input
                                                ref={mobileRef}
                                                name="mobile"
                                                type="text"
                                                placeholder="Enter your mobile number"
                                                className="input input-bordered w-full pl-11"
                                                value={mobileValue}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    if (/^\d*$/.test(value)) {
                                                        // Allow only digits
                                                        setMobileValue(value);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Total Tasbih Count
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={tasbihCount}
                                            disabled
                                            className="input input-bordered w-full bg-base-200 text-base-content font-bold"
                                        />
                                    </div>
                                </>
                            )}
                            {step === "details" && (
                                <>
                                    <div className="alert alert-success shadow-sm">
                                        <BookUser />
                                        <span className="text-sm">
                                            Add Details for your registration
                                        </span>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Full Name
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <User
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={20}
                                                aria-hidden="true"
                                            />
                                            <input
                                                ref={fullNameRef}
                                                name="fullName"
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="input input-bordered w-full pl-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text font-medium">
                                                Address
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <MapPin
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={20}
                                                aria-hidden="true"
                                            />
                                            <input
                                                ref={addressRef}
                                                name="address"
                                                type="text"
                                                placeholder="Enter your address"
                                                className="input input-bordered w-full pl-11"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {error && (
                                <div className="alert alert-error shadow-sm">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="stroke-current flex-shrink-0 h-6 w-6"
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
                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        resetForm();
                                        setVisible(false);
                                        onClose();
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        loading ||
                                        (step === "mobile" &&
                                            mobileValue.trim().length === 0)
                                    }
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Saving...
                                        </>
                                    ) : step === "mobile" ? (
                                        "Next"
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
