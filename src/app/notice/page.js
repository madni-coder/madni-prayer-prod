"use client";

import { useEffect, useState } from "react";

export default function NoticeFeed() {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchImages() {
            try {
                const res = await fetch("/api/api-notice");
                if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
                const data = await res.json();
                setImages(data.images || []);
            } catch (err) {
                setError(err.message || "An error occurred");
            }
        }
        fetchImages();
    }, []);

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto py-4 bg-base-100">
            <div
                className="w-full max-w-xs mx-auto "
                style={{ height: "calc(100vh - 64px)" }}
            >
                {error && (
                    <div className="text-sm text-error p-3">Error: {error}</div>
                )}

                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="w-full mb-6 rounded-2xl shadow-lg bg-base-100 overflow-hidden flex flex-col border-4 border-primary"
                        style={{ aspectRatio: "9/16", maxWidth: 360 }}
                    >
                        <div
                            className="relative w-full h-0 flex items-center justify-center bg-base-100"
                            style={{ paddingBottom: "177.77%" }}
                        >
                            {/* Use a regular img tag to avoid Next/Image remote domain configuration */}
                            <img
                                src={img.imageSrc}
                                alt={img.imageName}
                                className="object-contain w-full h-full"
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                }}
                            />
                        </div>
                        <div className="p-3 flex flex-col gap-1">
                            <span className="font-semibold text-base-content">
                                {img.imageName}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
