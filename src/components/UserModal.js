"use client";
import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

export default function UserModal({
    open = false,
    onClose = () => {},
    onSuccess = () => {},
    tasbihCount = 0,
}) {
    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const mobileRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(open);
    const [step, setStep] = useState("mobile"); // 'mobile', 'details', 'registered'
    const [savedMobile, setSavedMobile] = useState("");
    const [mobileValue, setMobileValue] = useState("");

    useEffect(() => {
        setVisible(open);
        setStep("mobile");
        setError(null);
    }, [open]);

    function resetForm() {
        if (fullNameRef.current) fullNameRef.current.value = "";
        if (addressRef.current) addressRef.current.value = "";
        if (mobileRef.current) mobileRef.current.value = "";
        setError(null);
        setStep("mobile");
        setMobileValue("");
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
                };
            } else {
                payload = {
                    "Full Name": fullNameRef.current?.value?.trim(),
                    Address: addressRef.current?.value?.trim(),
                    "mobile number": savedMobile,
                    tasbihCount: tasbihCount,
                };
            }
            const res = await fetch(`/api/api-tasbihUsers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
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
            resetForm();
            setVisible(false);
            onSuccess(data);
            onClose();
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
                <div className="modal-box w-[min(95vw,480px)] max-h-[90vh] overflow-y-auto relative">
                    {/* Cross icon for closing modal */}
                    <button
                        type="button"
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        onClick={() => {
                            resetForm();
                            setVisible(false);
                            onClose();
                        }}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                    <h3 className="font-bold text-lg">Register for Durood</h3>

                    {step === "registered" ? (
                        <div className="mt-6 text-success text-center text-lg">
                            Your durood cont is submitted
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
                                            <span className="label-text">
                                                Mobile Number
                                            </span>
                                        </label>
                                        <input
                                            ref={mobileRef}
                                            name="mobile"
                                            type="text"
                                            placeholder="Mobile Number"
                                            className="input input-bordered w-full"
                                            value={mobileValue}
                                            onChange={(e) =>
                                                setMobileValue(e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text ">
                                                Total Tasbih Count
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            value={tasbihCount}
                                            disabled
                                            className="input input-bordered w-full bg-gray-100 text-gray-500"
                                        />
                                    </div>
                                </>
                            )}
                            {step === "details" && (
                                <>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">
                                                Full Name
                                            </span>
                                        </label>
                                        <input
                                            ref={fullNameRef}
                                            name="fullName"
                                            type="text"
                                            placeholder="Full Name"
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                    <div className="form-control w-full">
                                        <label className="label">
                                            <span className="label-text">
                                                Address
                                            </span>
                                        </label>
                                        <input
                                            ref={addressRef}
                                            name="address"
                                            type="text"
                                            placeholder="Address"
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                </>
                            )}
                            {error && (
                                <div className="text-error text-sm">
                                    {error}
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
                                    {loading
                                        ? "Saving..."
                                        : step === "mobile"
                                        ? "Next"
                                        : "Save"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
