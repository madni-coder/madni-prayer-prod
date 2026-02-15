import { Suspense } from 'react';
import JobDetailClient from './JobDetailClient';

// Static export compatible - uses query params instead of dynamic routing
export default function JobAdminDetailPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
            <JobDetailClient />
        </Suspense>
    );
}
