"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SocialMediaImageUpload from "../../../components/SocialMediaImageUpload";
import fetchFromApi from "../../../utils/fetchFromApi";
import { Pencil, Trash } from "lucide-react";

export default function NoticeAdmin() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    useEffect(() => {
        // Check authentication on client side
        const checkAuth = () => {
            const isAuthenticated =
                localStorage.getItem("isAuthenticated") === "true";
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    const fetchImages = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchFromApi("/api/api-notice");
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || res.statusText);
            }
            const data = await res.json();
            setImages(data.images || []);
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (imageId) => {
        setImageToDelete(imageId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;

        setLoading(true);
        setError(null);
        setShowDeleteModal(false);

        try {
            const res = await fetch("/api/api-notice", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageId: imageToDelete }),
            });
            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || res.statusText);
            }
            // Remove deleted image from state
            setImages((prev) => prev.filter((img) => img.id !== imageToDelete));
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
            setImageToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setImageToDelete(null);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Notice Management
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Create and manage announcements and notices
                    </p>
                </div>
            </div>

            {/* Social Media Image Upload Component */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:p-6">
                    <SocialMediaImageUpload onUploadComplete={fetchImages} />
                </div>
            </div>

            {/* Uploaded images list */}
            <div className="bg-white shadow sm:rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                        Uploaded Images
                    </h2>
                </div>

                {loading && (
                    <p className="text-sm text-gray-500">Loading images...</p>
                )}
                {error && (
                    <p className="text-sm text-red-500">Error: {error}</p>
                )}

                {!loading && !error && images.length === 0 && (
                    <p className="text-sm text-gray-500">
                        No images uploaded yet.
                    </p>
                )}

                {!loading && images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {images.map((img, index) => (
                            <div
                                key={img.id || index}
                                className="border rounded overflow-hidden relative"
                            >
                                {/* Edit and Delete Icons */}
                                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                                    <button
                                        className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
                                        title="Delete"
                                        onClick={() =>
                                            handleDelete(img.id || index)
                                        }
                                    >
                                        <Trash
                                            size={18}
                                            className="text-red-600"
                                        />
                                    </button>
                                </div>
                                {img.imageSrc ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <div className="w-full">
                                        <img
                                            src={
                                                img.imageSrcPortrait ||
                                                img.imageSrc
                                            }
                                            alt={`Image ${index + 1}`}
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                        No preview
                                    </div>
                                )}
                                <div className="p-1 text-xs text-gray-700 truncate">
                                    Image {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg border">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Confirm Delete
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete this image?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={cancelDelete}
                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
