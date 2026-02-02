"use client";
import React from "react";
import { AlertCircle } from "lucide-react";

export default function UpdatePopup({ open = false, onUpdate = () => { }, onCancel = () => { } }) {
    if (!open) return null;

    const isDark = typeof window !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-md bg-[#243447] rounded-2xl shadow-2xl border-2 ${isDark ? 'border-primary/30' : 'border-primary/20'} overflow-hidden animate-fade-in`}>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4">
                    <div className="flex items-center justify-center gap-3">
                        <AlertCircle className="text-white" size={32} />
                        <h3 className="font-bold text-xl text-white text-center">
                            Update Available
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-center text-white text-lg font-medium leading-relaxed">
                        Please Update towards the new version. It's important
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onUpdate();
                            }}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Update
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onCancel();
                            }}
                            className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transform transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
