"use client";

import { useState, useRef } from "react";
import { Upload, X, Smartphone } from "lucide-react";

export default function SocialMediaImageUpload({ onUploadComplete }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setError(null);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            const response = await fetch("/api/api-notice", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Upload failed");
            }

            const result = await response.json();

            // Reset form after successful upload
            handleCancel();

            // Notify parent component to refresh images
            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (err) {
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload New Image
            </h3>

            {!selectedFile ? (
                // File selection button
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                        <button
                            onClick={handleUploadClick}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Upload Image
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Select an image file to upload
                    </p>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-600" />
                            <p className="text-sm text-yellow-800 font-medium ">
                                Upload only 9:16 ratio / Portrait size image for
                                better view experience
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                // Preview container with cancel and upload buttons
                <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-24 w-24 object-cover rounded-lg"
                            />
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-500">
                                Size:{" "}
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                            </p>

                            {error && (
                                <p className="text-sm text-red-500 mt-2">
                                    {error}
                                </p>
                            )}

                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={handleCancel}
                                    disabled={uploading}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
