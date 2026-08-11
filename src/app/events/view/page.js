import React, { Suspense } from "react";
import EventPageClient from "./EventPageClient";

export const dynamic = 'force-static';

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="flex items-center justify-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                </div>
            </div>
        }>
            <EventPageClient />
        </Suspense>
    );
}
