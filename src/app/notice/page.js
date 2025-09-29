"use client";

import { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function NoticeFeed() {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const router = useRouter();

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
            <button
                className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
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
