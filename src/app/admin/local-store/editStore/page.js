import React, { Suspense } from "react";
import EditStoreClient from "../EditStoreClient";

export const dynamic = 'force-static';

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <EditStoreClient />
        </Suspense>
    );
}
