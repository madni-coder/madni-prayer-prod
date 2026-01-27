"use client";
import React, { useRef, useState, useEffect } from "react";
import { X, User, MapPin, Phone, BookUser } from "lucide-react";
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
}) {
    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const mobileRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState("mobile");
    const [savedMobile, setSavedMobile] = useState("");
    const [mobileValue, setMobileValue] = useState("");
    const [userData, setUserData] = useState(null);
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        // Debug: log when the parent toggles the modal
        console.log("UserModal open prop:", open);
        setError(null);

        // Load user data from localStorage when modal opens
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
            // Focus the mobile input shortly after mount so we can confirm the modal rendered
            setTimeout(() => {
                try {
                    mobileRef.current?.focus();
                } catch (e) {
                    // ignore
                }
            }, 50);
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
        setFullName("");
        setAddress("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // If on mobile step, just validate and move to details step
        if (step === "mobile") {
            if (!/^\d{10}$/.test(mobileValue.trim())) {
                setError("Mobile number must be exactly 10 digits.");
                setLoading(false);
                return;
            }
            // Move to details step to collect full name and address
            setSavedMobile(mobileValue.trim());
            setStep("details");
            setLoading(false);
            return;
        }

        // Validate mobile number for review step
        if (step === "review" && (!userData?.mobile || !/^\d{10}$/.test(userData.mobile))) {
            setError("Mobile number must be exactly 10 digits.");
            setLoading(false);
            return;
        }

        try {
            let payload;
            if (step === "review") {
                payload = {
                    "mobile number": userData.mobile,
                    tasbihCount: tasbihCount,
                    weeklyCounts: tasbihCount,
                };
            } else {
                // step === "details" - registering new user
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

            if (data.error === "REGISTERED_USER") {
                setStep("registered");
                setError(null);
                setLoading(false);
                // Show the registered message briefly, then notify parent with mobile and close
                const registeredMobile = userData?.mobile || savedMobile;
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

    // Render only when parent asks to open
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                    resetForm();
                    onClose();
                }}
            />

            <div className="modal modal-open">
                <div className="modal-box w-[min(95vw,420px)] max-h-[90vh] overflow-y-auto relative  p-4 border-4 border-green-300">
                    {/* Cross icon for closing modal */}
                    <button
                        type="button"
                        className="absolute top-2 right-2 btn btn-ghost btn-xs btn-circle"
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                    <h3 className="font-bold text-base text-base-content pr-6">
                        {pageType === "zikr" ? "Register for Zikr Counts" : "Register for Durood Counts"}
                    </h3>

                    {importantMessage && !["registered", "submitted"].includes(step) && (
                        <details className="mt-2">
                            <summary className="text-xs text-primary/60 hover:text-primary cursor-pointer underline list-none">
                                Click to view important message
                            </summary>
                            <div className="mt-1 text-sm">{importantMessage}</div>
                        </details>
                    )}

                    {step === "registered" || step === "submitted" ? (
                        <div className="mt-3 text-center">
                            <div className="alert alert-success shadow-lg py-3">
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-base font-semibold">
                                    {pageType === "zikr" ? "Your Zikr Count is submitted!" : "Your Durood Counts are submitted!"}
                                </span>
                            </div>
                        </div>
                    ) : step === "review" ? (
                        <div
                            className="mt-3 space-y-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="alert alert-info shadow-sm py-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    className="stroke-current flex-shrink-0 w-5 h-5"
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
                                <div className="card-body space-y-2 p-3">
                                    <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="bg-primary text-primary-content rounded-full w-9 h-9 flex items-center justify-center">
                                                <User
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-base-content/60">
                                                Full Name
                                            </p>
                                            <p className="font-semibold text-sm text-base-content truncate">
                                                {userData?.fullName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="bg-secondary text-secondary-content rounded-full w-9 h-9 flex items-center justify-center">
                                                <MapPin
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-base-content/60">
                                                Address
                                            </p>
                                            <p className="font-semibold text-sm text-base-content truncate">
                                                {userData?.address}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 bg-base-100 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="bg-accent text-accent-content rounded-full w-9 h-9 flex items-center justify-center">
                                                <Phone
                                                    size={16}
                                                    strokeWidth={2.5}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-base-content/60">
                                                Mobile Number
                                            </p>
                                            <p className="font-semibold text-sm text-base-content">
                                                {userData?.mobile}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="divider my-1"></div>

                                    <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                                        <div className="flex-1">
                                            <p className="text-[10px] text-base-content/60">
                                                {pageType === "zikr" ? "Total Zikr Count" : "Total Tasbih Count"}
                                            </p>
                                            <p className="text-xl font-bold text-primary">
                                                {tasbihCount}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <button
                                    className="btn btn-primary btn-sm sm:flex-1"
                                    onClick={(e) => handleSubmit(e)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        "Confirm & Submit"
                                    )}
                                </button>

                            </div>{" "}
                            {error && (
                                <div className="alert alert-error shadow-sm py-2">
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
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="mt-3 space-y-3"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {step === "mobile" && (
                                <>
                                    <div className="form-control w-full">
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium">
                                                Mobile Number
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={16}
                                                aria-hidden="true"
                                            />
                                            <input
                                                ref={mobileRef}
                                                name="mobile"
                                                type="text"
                                                placeholder="Enter your mobile number"
                                                className="input input-bordered input-sm w-full pl-10"
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
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium">
                                                {pageType === "zikr" ? "Total Zikr Count" : "Total Tasbih Count"}
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={tasbihCount}
                                            disabled
                                            className="input input-bordered input-sm w-full bg-base-200 text-base-content font-bold"
                                        />
                                    </div>
                                </>
                            )}
                            {step === "details" && (
                                <>
                                    <div className="alert alert-success shadow-sm py-2">
                                        <BookUser size={18} />
                                        <span className="text-sm">
                                            Complete your registration
                                        </span>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium">
                                                Mobile Number
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={16}
                                                aria-hidden="true"
                                            />
                                            <input
                                                type="text"
                                                value={savedMobile}
                                                disabled
                                                className="input input-bordered input-sm w-full pl-10 bg-base-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control w-full">
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium">
                                                Full Name
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <User
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={16}
                                                aria-hidden="true"
                                            />
                                            <input
                                                ref={fullNameRef}
                                                name="fullName"
                                                type="text"
                                                placeholder="Enter your full name"
                                                className="input input-bordered input-sm w-full pl-10"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label py-1">
                                            <span className="label-text text-sm font-medium">
                                                Address
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <MapPin
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content z-10 pointer-events-none"
                                                size={16}
                                                aria-hidden="true"
                                            />
                                            <input
                                                ref={addressRef}
                                                name="address"
                                                type="text"
                                                placeholder="Enter your address"
                                                className="input input-bordered input-sm w-full pl-10"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            {error && (
                                <div className="alert alert-error shadow-sm py-2">
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
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}
                            <div className="modal-action mt-3">
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
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
                                    className="btn btn-primary btn-sm"
                                    disabled={
                                        loading ||
                                        (step === "mobile" &&
                                            mobileValue.trim().length === 0) ||
                                        (step === "details" &&
                                            (!fullName.trim() || !address.trim()))
                                    }
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
                                            {step === "details" ? "Registering..." : "Loading..."}
                                        </>
                                    ) : step === "mobile" ? (
                                        "Next"
                                    ) : step === "details" ? (
                                        "Register"
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
