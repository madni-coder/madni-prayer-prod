import { Suspense } from "react";
import ClientPdfViewer from "./ClientPdfViewer";

export default function PdfViewerPage() {
    return (
        <div className="w-full h-full min-h-screen bg-base-100 text-base-content mb-20">
            {/* ClientPdfViewer will read search params on the client if needed */}
            <Suspense
                fallback={
                    <div className="p-6 text-center">Loading viewer...</div>
                }
            >
                <ClientPdfViewer />
            </Suspense>
        </div>
    );
}
