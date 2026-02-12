import React, { Suspense } from "react";
import ViewStoreClient from "./ViewStoreClient";

export const dynamic = 'force-static';

export default function Page() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-base-200 p-6">
                <div className="min-h-[60vh] flex items-center justify-center">Loading...</div>
            </main>
        }>
            <ViewStoreClient />
        </Suspense>
    );
}
