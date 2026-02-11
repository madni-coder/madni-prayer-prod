"use client";

import { useState, useRef } from "react";
import { Upload, X, Smartphone } from "lucide-react";

export default function SocialMediaImageUpload({ onUploadComplete, uploadUrl = "/api/local-stores", httpMethod = "POST", autoUploadToServer = false }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false); // added
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Utility: load image from URL
    const loadImage = (url) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });

    // Convert any image into 9:16 with blurred background (no cropping of main image)
    const processToPortrait = async (file, targetW = 1080, targetH = 1920) => {
        const url = URL.createObjectURL(file);
        try {
            const img = await loadImage(url);
            const canvas = document.createElement("canvas");
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext("2d");

            // Fill base to avoid transparent edges after blur
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, targetW, targetH);

            // 1) Blurred background that COVERS the canvas
            const coverScale =
                Math.max(targetW / img.width, targetH / img.height) * 1.1; // slight overdraw to hide blur edges
            const coverW = img.width * coverScale;
            const coverH = img.height * coverScale;
            const coverX = (targetW - coverW) / 2;
            const coverY = (targetH - coverH) / 2;

            // Apply blur for background if supported
            try {
                ctx.filter = "blur(40px)";
            } catch (_) {
                // no-op if not supported
            }
            ctx.drawImage(img, coverX, coverY, coverW, coverH);

            // 2) Sharp foreground that CONTAINS fully (no cropping)
            ctx.filter = "none";
            const containScale = Math.min(
                targetW / img.width,
                targetH / img.height
            );
            const fw = img.width * containScale;
            const fh = img.height * containScale;
            const fx = (targetW - fw) / 2;
            const fy = (targetH - fh) / 2;
            ctx.drawImage(img, fx, fy, fw, fh);

            // Export as JPEG
            const blob = await new Promise((res) =>
                canvas.toBlob(res, "image/jpeg", 0.9)
            );
            if (!blob) throw new Error("Failed to create processed image");

            const processedFile = new File(
                [blob],
                (file.name || "image").replace(/\.[^.]+$/, "") +
                "-portrait.jpg",
                {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                }
            );
            const processedPreviewUrl = URL.createObjectURL(blob);

            return {
                processedFile,
                processedPreviewUrl,
                width: targetW,
                height: targetH,
            };
        } finally {
            URL.revokeObjectURL(url);
        }
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Revoke previous preview
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setError(null);
        setProcessing(true);
        try {
            const { processedFile, processedPreviewUrl } =
                await processToPortrait(file);
            setSelectedFile(processedFile);
            setPreviewUrl(processedPreviewUrl);
            if (autoUploadToServer) {
                // upload to server using FormData
                await uploadFile(processedFile);
            } else {
                // Convert processed file to data URL and notify parent (no server call)
                const dataUrl = await fileToDataUrl(processedFile);
                if (onUploadComplete) onUploadComplete({ fileName: processedFile.name, imageSrc: dataUrl, imageSrcPortrait: dataUrl });
            }
        } catch (e) {
            setError(e?.message || "Failed to process image");
            // fallback to raw preview if processing fails
            const url = URL.createObjectURL(file);
            setSelectedFile(file);
            setPreviewUrl(url);
            if (autoUploadToServer) {
                await uploadFile(file);
            } else {
                const dataUrl = await fileToDataUrl(file);
                if (onUploadComplete) onUploadComplete({ fileName: file.name, imageSrc: dataUrl, imageSrcPortrait: dataUrl });
            }
        } finally {
            setProcessing(false);
        }
    };

    // Convert a File/Blob to data URL
    const fileToDataUrl = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const uploadFile = async (file) => {
        if (!file) return;

        // Abort any previous upload
        if (abortControllerRef.current) {
            try {
                abortControllerRef.current.abort();
            } catch (_) { }
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(uploadUrl, {
                method: httpMethod,
                body: formData,
                signal: controller.signal,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Upload failed");
            }

            const json = await response.json();
            // Reset selection preview after successful upload
            handleCancel();
            if (onUploadComplete) onUploadComplete(json);
        } catch (err) {
            if (err.name === 'AbortError') {
                setError('Upload cancelled');
            } else {
                setError(err.message || 'Upload failed');
            }
        } finally {
            setUploading(false);
            abortControllerRef.current = null;
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleCancel = () => {
        // Abort in-progress server upload if any
        if (abortControllerRef.current) {
            try {
                abortControllerRef.current.abort();
            } catch (_) { }
            abortControllerRef.current = null;
        }
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Manual upload removed — uploads happen automatically after selection

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
                            type="button"
                            onClick={handleUploadClick}
                            disabled={processing || uploading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {processing ? "Processing..." : "Select Image"}
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        We will auto-convert to 9:16 portrait without cropping
                        and fill side gaps with a blurred background.
                    </p>
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-600" />
                            <p className="text-sm text-yellow-800 font-medium ">
                                Upload only 9:16 ratio / Portrait size image for
                                better view experience. Non-portrait images will
                                be adjusted automatically.
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
                            <p className="text-xs text-gray-500">
                                Output: 1080x1920 (9:16) portrait
                            </p>
                            {error && (
                                <p className="text-sm text-red-500 mt-2">
                                    {error}
                                </p>
                            )}
                            <div className="flex space-x-3 mt-4 items-center">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={processing}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <div className="text-sm text-gray-600">
                                    {processing ? 'Processing...' : 'Image ready'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
