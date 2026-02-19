"use client";

import { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";

export default function NoticeFeed() {
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function fetchImages() {
            try {
                const { data } = await apiClient.get("/api/api-notice");
                // Show newest images first
                const imgs = data.images || [];
                const list = Array.isArray(imgs) ? imgs.slice().reverse() : imgs;
                setImages(list);
                // mark as seen: store the total count (not reversed length)
                try {
                    const total = Array.isArray(imgs) ? imgs.length : (imgs ? 1 : 0);
                    localStorage.setItem("notice_last_seen_count", String(total));
                } catch (e) {
                    // ignore storage errors
                }
                setLoading(false); // Stop loading on API success
            } catch (err) {
                setError(err.message || "An error occurred");
                setLoading(false); // Stop loading on error
            }
        }
        fetchImages();
    }, []);

    return (
        <div className="min-h-screen relative flex flex-col items-center bg-base-200 pt-6 pb-24">
            <div className="w-full max-w-xs mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-2 text-left">
                        Aelaan
                    </h1>
                </div>
            </div>
            <div className="w-full max-w-xs mx-auto space-y-6 pb-4">
                {error && (
                    <div className="text-sm text-error p-3">Error: {error}</div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <span className="mt-2 text-primary font-semibold">
                            Loading Elaan...
                        </span>
                    </div>
                ) : (
                    images.map((img, idx) => (
                        <div
                            key={idx}
                            className="w-full rounded-2xl shadow-lg bg-base-100 overflow-hidden flex flex-col border-4 border-primary"
                            style={{ aspectRatio: "9/16", maxWidth: 360 }}
                        >
                            <div
                                className="relative w-full h-0 flex items-center justify-center bg-base-100"
                                style={{ paddingBottom: "177.77%" }}
                            >
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
                    ))
                )}
            </div>
        </div>
    );
}
