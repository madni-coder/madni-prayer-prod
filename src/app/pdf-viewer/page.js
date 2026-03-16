import { Suspense } from "react";
import ClientPdfViewer from "./ClientPdfViewer";

export default function PdfViewerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ClientPdfViewer />
        </Suspense>
    );
}
