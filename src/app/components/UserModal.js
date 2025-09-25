"use client";
import React, { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

export default function UserModal({
    open = false,
    onClose = () => {},
    onSuccess = () => {},
}) {
    const fullNameRef = useRef(null);
    const addressRef = useRef(null);
    const mobileRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(open);

    useEffect(() => {
        setVisible(open);
    }, [open]);

    function resetForm() {
        if (fullNameRef.current) fullNameRef.current.value = "";
        if (addressRef.current) addressRef.current.value = "";
        if (mobileRef.current) mobileRef.current.value = "";
        setError(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        const payload = {
            "Full Name": fullNameRef.current?.value?.trim(),
            Address: addressRef.current?.value?.trim(),
            "mobile number": mobileRef.current?.value?.trim(),
        };

        const errs = [];
        if (!payload["Full Name"]) errs.push("Full Name is required");
        if (!payload.Address) errs.push("Address is required");
        if (!payload["mobile number"]) errs.push("Mobile number is required");

        if (errs.length) {
            setError(errs.join(". "));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/api-tasbihUsers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(
                    data?.errors
                        ? data.errors.join("; ")
                        : data?.error || "Failed to submit"
                );

            resetForm();
            setVisible(false);
            onSuccess(data);
            onClose();
        } catch (err) {
            setError(String(err));
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
                            setVisible(false);
                            onClose();
                        }}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>
                    <h3 className="font-bold text-lg">Register for Zikr</h3>

                    <form
                        onSubmit={handleSubmit}
                        className="mt-4 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Full Name</span>
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
                                <span className="label-text">Address</span>
                            </label>
                            <input
                                ref={addressRef}
                                name="address"
                                type="text"
                                placeholder="Address"
                                className="input input-bordered w-full"
                            />
                        </div>

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
                            />
                        </div>

                        {error && (
                            <div className="text-error text-sm">{error}</div>
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
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
