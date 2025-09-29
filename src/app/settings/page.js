"use client";
import React from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Settings() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
            <button
                className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in bg-base-100">
                <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                    Settings
                </h2>
                <div className="glass-card p-6 max-w-2xl w-full text-center bg-base-200 text-base-content">
                    <p className="text-lg mb-2">
                        Language, notifications, theme, font size controls.
                    </p>
                    <p className="text-sm text-base-content/60">
                        (Feature coming soon)
                    </p>
                </div>
            </section>
        </div>
    );
}
