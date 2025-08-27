import React from "react";

export default function AzanAlerts() {
    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in bg-base-100">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Azan Alerts
            </h2>
            <div className="glass-card p-6 max-w-2xl w-full text-center bg-base-200 text-base-content">
                <p className="text-lg mb-2">
                    Push notifications and Azan sound toggle.
                </p>
                <p className="text-sm text-base-content/60">
                    (Feature coming soon)
                </p>
            </div>
        </section>
    );
}
