"use client";
import { useEffect, useState, useRef } from "react";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SocialMediaImageUpload from "../../../components/SocialMediaImageUpload";
import { Pencil, Trash, Smile } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import html2canvas from "html2canvas";
import dynamic from "next/dynamic";
import apiClient from "../../../lib/apiClient";
import "../../tiptap.css";

// Dynamically import EmojiPicker to avoid SSR issues
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
    ssr: false,
});

export default function NoticeAdmin() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    // Removed noticeTitle and isSaving state (save-notice functionality removed)
    const [isPostingImage, setIsPostingImage] = useState(false);
    const [contentError, setContentError] = useState(null);
    const [liveOverflow, setLiveOverflow] = useState(false);
    const [fitScale, setFitScale] = useState(1); // live preview scale-to-fit (1 = no scale)
    const contentRef = useRef(null);
    const [selectedBgColor, setSelectedBgColor] = useState("#ffffff"); // Background color state
    const [showAllBackgrounds, setShowAllBackgrounds] = useState(false); // Toggle for showing all backgrounds
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Emoji picker visibility
    const [editorKey, setEditorKey] = useState(0); // Force toolbar re-render
    const [pendingImage, setPendingImage] = useState(null); // image selected but not uploaded

    // TipTap Editor
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        editorProps: {
            attributes: {
                // Remove inner padding; we'll control exact padding via the outer wrapper
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px]",
            },
        },
        immediatelyRender: false,
        onUpdate: () => {
            setEditorKey((prev) => prev + 1); // Trigger toolbar re-render
        },
        onSelectionUpdate: () => {
            setEditorKey((prev) => prev + 1); // Trigger toolbar re-render on selection change
        },
    });



    // Live overflow check: render content into an offscreen iframe sized to editor card
    const checkOverflow = useCallback(async (html) => {
        try {
            const W = 312;
            const H = 554;
            const MIN_SCALE = 0.9; // allow up to 10% downscale to fit without showing error
            const iframe = document.createElement("iframe");
            iframe.style.position = "fixed";
            iframe.style.left = "-99999px";
            iframe.style.width = W + "px";
            iframe.style.height = H + "px";
            iframe.style.border = "0";
            document.body.appendChild(iframe);
            const doc = iframe.contentDocument;
            doc.open();
            doc.write(`<!doctype html><html><head><meta charset=\"utf-8\"><style>
                html,body{margin:0;padding:0;width:${W}px;height:${H}px}
                /* Remove top/bottom padding to avoid extra white space in export */
                .content{box-sizing:border-box;padding:0 36px;height:100%;width:100%;overflow:hidden;}
                #fit{display:block;}
                .ProseMirror{font-size:22px;line-height:1.45}
                /* Normalize margins so blocks don't create fake padding */
                .ProseMirror p,
                .ProseMirror ul,
                .ProseMirror ol,
                .ProseMirror h1,
                .ProseMirror h2,
                .ProseMirror h3,
                .ProseMirror blockquote { margin-top: 0; margin-bottom: 0; }
                .ProseMirror li { margin: 0; }
                /* Trim outer whitespace created by first/last block margins */
                .ProseMirror > :first-child { margin-top: 0 !important; }
                .ProseMirror > :last-child { margin-bottom: 0 !important; }
            </style></head><body><div class=\"content\"><div id=\"fit\"><div class=\"ProseMirror\">${html}</div></div></div></body></html>`);
            doc.close();
            // small delay for layout
            await new Promise((r) => setTimeout(r, 30));
            const prose = doc.querySelector(".ProseMirror");
            const available = H; // no top/bottom padding
            const required = prose?.getBoundingClientRect().height || 0;

            // Compute a scale that would make it fit if possible, but don't go below MIN_SCALE
            const rawScale = required ? Math.min(1, available / required) : 1;
            const canFitWithMinScale = required <= available / MIN_SCALE;

            // Update live preview scale
            setFitScale(rawScale < 1 ? Math.max(rawScale, MIN_SCALE) : 1);

            const overflow = !canFitWithMinScale;
            document.body.removeChild(iframe);
            setLiveOverflow(overflow);
            if (overflow) {
                setContentError(
                    "Notice is too long to fit in 9:16 even after slight auto-fit. Please shorten the text."
                );
            } else {
                setContentError(null);
            }
        } catch (e) {
            // ignore transient errors
            console.warn("Overflow check failed", e);
            setLiveOverflow(false);
            setContentError(null);
        }
    }, []);

    // Hook editor updates for live checking
    useEffect(() => {
        if (!editor) return;
        const handler = () => {
            const html = editor.getHTML();
            checkOverflow(html);
        };
        editor.on("update", handler);
        // initial check
        handler();
        return () => editor.off("update", handler);
    }, [editor, checkOverflow]);

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
            const { data } = await apiClient.get("/api/api-notice");
            setImages(data?.images || []);
        } catch (err) {
            setError(err?.response?.data?.error || err.message || String(err));
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
            await apiClient.delete("/api/api-notice", {
                data: { imageId: imageToDelete },
            });
            // Remove deleted image from state
            setImages((prev) => prev.filter((img) => img.id !== imageToDelete));
        } catch (err) {
            setError(err?.response?.data?.error || err.message || String(err));
        } finally {
            setLoading(false);
            setImageToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setImageToDelete(null);
    };

    // save-notice handler removed; notices are saved by posting content as images only

    const handlePostContentAsImage = async () => {
        if (!editor || !contentRef.current) {
            setError("Editor content not available");
            return;
        }

        setIsPostingImage(true);
        setError(null);
        setContentError(null);

        try {
            // Isolate rendering into a clean iframe so global CSS (daisyUI okLCH colors)
            // can't affect computed styles.
            const raw = editor.getHTML();
            const cleaned = raw
                .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
                .replace(/ style=("|')(.*?)("|')/gi, "");

            // Render at the same logical size as the editor preview (mobile width),
            // then upscale the canvas for a crisp 1080x1920 image so visual proportions match.
            const SCALE = 3; // 360 * 3 = 1080
            const W = 360; // logical render width similar to editor card
            const H = 640; // logical render height (9:16)
            const MIN_SCALE = 0.9;

            const iframe = document.createElement("iframe");
            iframe.setAttribute("aria-hidden", "true");
            iframe.style.position = "fixed";
            iframe.style.left = "-99999px";
            iframe.style.top = "0";
            iframe.style.width = W + "px";
            iframe.style.height = H + "px";
            iframe.style.border = "0";
            document.body.appendChild(iframe);

            const doc = iframe.contentDocument;
            if (!doc) throw new Error("Failed to create isolated renderer");
            doc.open();
            doc.write(`<!DOCTYPE html>
                                <html>
                                <head>
                                    <meta charset="utf-8" />
                                    <style>
                                        /* Canvas base */
                                        html, body { margin: 0; padding: 0; width: ${W}px; height: ${H}px; }
                                        body { background: ${selectedBgColor}; color: #000000; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
                                        * { box-sizing: border-box; }
                                        /* Remove vertical padding so output has no extra space on top/bottom */
                                        .content{ width: 100%; height: 100%; padding: 0 36px; overflow: hidden; background: ${selectedBgColor}; }
                                        #fit{ display: block; }

                                        /* TipTap (ProseMirror) parity styles copied from src/app/tiptap.css */
                                        .ProseMirror { outline: none; color: black; }
                                        .ProseMirror h1 { font-size: 2em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.5em; }
                                        .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.5em; }
                                        .ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin-top: 0.5em; margin-bottom: 0.5em; }
                                        .ProseMirror p { margin-top: 0; margin-bottom: 0; font-size: 22px; line-height: 1.45; }
                                        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin-top: 0; margin-bottom: 0; }
                                        .ProseMirror ul { list-style-type: disc; }
                                        .ProseMirror ol { list-style-type: decimal; }
                                        .ProseMirror blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin-left: 0; margin-top: 0.5em; margin-bottom: 0.5em; color: #6b7280; font-style: italic; }
                                        .ProseMirror hr { border: none; border-top: 2px solid #d1d5db; margin: 1em 0; }
                                        .ProseMirror strong { font-weight: bold; }
                                        .ProseMirror em { font-style: italic; }
                                        .ProseMirror s { text-decoration: line-through; }
                                        .ProseMirror u { text-decoration: underline; }
                                        .ProseMirror code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
                                        .ProseMirror pre { background-color: #1f2937; color: #f9fafb; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
                                        .ProseMirror pre code { background-color: transparent; padding: 0; color: inherit; }
                                        /* Remove extra whitespace at the top/bottom caused by outer block margins */
                                        .ProseMirror > :first-child { margin-top: 0 !important; }
                                        .ProseMirror > :last-child { margin-bottom: 0 !important; }
                                    </style>
                                </head>
                                <body>
                                    <div class="content">
                                        <div id="fit"><div class="ProseMirror">${cleaned}</div></div>
                                    </div>
                                </body>
                                </html>`);
            doc.close();

            // Wait for fonts/layout
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Validate that the composed content actually fits in our fixed 9:16 surface.
            // If it overflows, stop and show a friendly message.
            const container = doc.querySelector(".content");
            const prose = doc.querySelector(".ProseMirror");
            const fitWrap = doc.getElementById("fit");
            if (!container || !prose)
                throw new Error("Renderer container missing");
            const available = H; // no vertical padding, use full height
            const required = Math.ceil(
                prose.getBoundingClientRect().height || 0
            );
            const fitsWithMinScale = required <= available / MIN_SCALE;
            if (!fitsWithMinScale) {
                document.body.removeChild(iframe);
                setContentError(
                    "Notice is too long to fit in 9:16 even after slight auto-fit. Please shorten the text so nothing gets cut."
                );
                setIsPostingImage(false);
                return;
            }

            // Compute a scale that would make it fit if possible, but don't go below MIN_SCALE
            const rawScale = Math.min(1, available / Math.max(required, 1));
            const applyScale = rawScale < 1 ? Math.max(rawScale, MIN_SCALE) : 1;

            // Instead of capturing a transformed element (which may confuse html2canvas
            // and cause bottom clipping), capture the untransformed layout at the
            // measured height and rely on html2canvas's `scale` option to produce a
            // crisp image. To keep the live preview behavior unchanged we only mutate
            // the iframe DOM used for rendering.
            if (fitWrap) {
                // Remove any transform that was used for preview fitting so the
                // capture target is the natural, untransformed content.
                fitWrap.style.transform = "none";
                fitWrap.style.transformOrigin = "top left";
                fitWrap.style.width = `100%`;
                // Ensure the wrapper exactly matches the measured content height
                // so html2canvas captures a tight crop with no bottom cut-off.
                fitWrap.style.height = `${required}px`;
            }

            // Make sure container height equals content height and align to top
            container.style.display = "block";
            container.style.alignItems = "flex-start";
            container.style.height = `${required}px`;

            // Capture the full logical 9:16 canvas (including whitespace) so the
            // exported image always has consistent size and aspect ratio. This
            // preserves a predictable composition even when content is short.
            const captureWidth = Math.ceil(W);
            const captureHeight = Math.ceil(H); // always full logical height

            // Ensure container fills the full logical height to preserve top/bottom
            // whitespace in the exported image.
            container.style.height = `${H}px`;

            const canvas = await html2canvas(container, {
                width: captureWidth,
                height: captureHeight,
                scale: SCALE,
                backgroundColor: null, // Don't use backgroundColor, let CSS handle it
                useCORS: true,
                logging: false,
                // windowWidth/Height should reflect the layout viewport used inside
                // the iframe so html2canvas computes styles correctly.
                windowWidth: W,
                windowHeight: H,
            });

            document.body.removeChild(iframe);

            // Convert canvas to blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/png", 1.0);
            });

            if (!blob) {
                throw new Error("Failed to create image from content");
            }

            // Create FormData and append the image
            const formData = new FormData();
            const fileName = `notice_${Date.now()}.png`;
            formData.append("image", blob, fileName);

            // Post to the API (same as route.js POST endpoint)
            const { data } = await apiClient.post(
                "/api/api-notice",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            toast.success("Posted successfully");

            // Refresh the images list
            await fetchImages();

            // Optionally clear the editor
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setIsPostingImage(false);
        }
    };

    // Handle emoji selection
    const handleEmojiClick = (emojiData) => {
        if (editor) {
            editor.chain().focus().insertContent(emojiData.emoji).run();
            setShowEmojiPicker(false);
        }
    };

    const MenuBar = ({ editor }) => {
        if (!editor) return null;

        // Modern, light-themed, text-first toolbar using small glyphs (no sub-hints).
        const Tool = ({ label, onClick, active, disabled, icon }) => (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                aria-pressed={active}
                title={label}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition border ${active
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-700 border-gray-200"
                    } ${disabled
                        ? "opacity-50 pointer-events-none"
                        : "hover:shadow-sm"
                    }`}
            >
                {icon ? icon : <span className="font-semibold">{label}</span>}
            </button>
        );

        return (
            <div className="flex flex-wrap gap-2 items-center justify-center relative">
                {/* Strong group */}
                <Tool
                    label="B"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                />
                <Tool
                    label="I"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                />
                <Tool
                    label="U"
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    active={editor.isActive("underline")}
                />

                {/* Headings (compact on small screens) */}
                <div className="hidden sm:flex items-center gap-2">
                    <Tool
                        label="H1"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                        active={editor.isActive("heading", { level: 1 })}
                    />
                    <Tool
                        label="H2"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        active={editor.isActive("heading", { level: 2 })}
                    />
                    <Tool
                        label="H3"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        active={editor.isActive("heading", { level: 3 })}
                    />
                </div>

                <Tool
                    label="• List"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    active={editor.isActive("bulletList")}
                />
                <div className="hidden sm:inline-flex">
                    <Tool
                        label="1. List"
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        active={editor.isActive("orderedList")}
                    />
                </div>

                <Tool
                    label="❝"
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    active={editor.isActive("blockquote")}
                />

                <div className="hidden md:inline-flex">
                    <Tool
                        label="—"
                        onClick={() =>
                            editor.chain().focus().setHorizontalRule().run()
                        }
                    />
                </div>

                <Tool
                    label="↶"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                />
                <Tool
                    label="↷"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                />

                {/* Emoji Picker Button */}
                <div className="relative">
                    <Tool
                        label="Emoji"
                        icon={<Smile size={18} />}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        active={showEmojiPicker}
                    />
                    {showEmojiPicker && (
                        <div className="absolute top-full mt-2 z-50 right-0">
                            <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200">
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    width={300}
                                    height={400}
                                    searchDisabled={false}
                                    skinTonesDisabled={false}
                                    previewConfig={{
                                        showPreview: false,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
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

            {/* Rich Text Notice Editor with TipTap and Social Upload side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:p-6 h-full flex flex-col">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Create Text Notice
                        </h2>

                        {/* Toolbar (outside the portrait container) */}
                        <div className="flex justify-center mb-4">
                            <div className="w-full max-w-md">
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-3 flex flex-wrap gap-2 items-center justify-center">
                                    <MenuBar editor={editor} key={editorKey} />
                                </div>
                            </div>
                        </div>

                        {/* Portrait Container for TipTap Editor */}
                        <div className="flex justify-center flex-1 gap-4">
                            <div
                                ref={contentRef}
                                className="notice-editor w-full rounded-2xl shadow-lg overflow-hidden border-4 border-primary"
                                style={{
                                    width: 312,
                                    height: 554,
                                    background: selectedBgColor,
                                }}
                            >
                                {/* TipTap Editor */}
                                <div
                                    className="h-full flex flex-col border border-gray-300 rounded-md overflow-hidden"
                                    style={{ background: selectedBgColor }}
                                >
                                    <div className="flex-1 overflow-y-auto">
                                        {/* Mirror export: no vertical padding, keep horizontal spacing only */}
                                        <div className="h-full px-9">
                                            <div
                                                style={{
                                                    transform: `scale(${fitScale})`,
                                                    transformOrigin: "top left",
                                                    width: `${(1 / fitScale) * 100
                                                        }%`,
                                                }}
                                            >
                                                <EditorContent
                                                    editor={editor}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Color Palette Section */}
                            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Background
                                </h3>

                                {/* Decorative Backgrounds */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-600 mb-2">
                                        Decorative
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Show first 6 decorative backgrounds */}
                                        <button
                                            onClick={() =>
                                                setSelectedBgColor(
                                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                )
                                            }
                                            className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            }}
                                            title="Purple Gradient"
                                        />
                                        <button
                                            onClick={() =>
                                                setSelectedBgColor(
                                                    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                                                )
                                            }
                                            className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                                            }}
                                            title="Soft Pastel"
                                        />
                                        <button
                                            onClick={() =>
                                                setSelectedBgColor(
                                                    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                                                )
                                            }
                                            className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                                            }}
                                            title="Peach"
                                        />
                                        <button
                                            onClick={() =>
                                                setSelectedBgColor(
                                                    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
                                                )
                                            }
                                            className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
                                            }}
                                            title="Pink Blush"
                                        />
                                        <button
                                            onClick={() =>
                                                setSelectedBgColor(
                                                    "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
                                                )
                                            }
                                            className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
                                            }}
                                            title="Dark Navy"
                                        />
                                        <button
                                            onClick={() =>
                                                setSelectedBgColor(
                                                    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
                                                )
                                            }
                                            className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
                                            }}
                                            title="Lavender Sky"
                                        />

                                        {/* Additional decorative backgrounds (shown when showAllBackgrounds is true) */}
                                        {showAllBackgrounds && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
                                                    }}
                                                    title="Light Gray"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #e3ffe7 0%, #d9e7ff 100%)",
                                                    }}
                                                    title="Mint Sky"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)",
                                                    }}
                                                    title="Yellow Sunshine"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
                                                    }}
                                                    title="Cotton Candy"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #74ebd5 0%, #9face6 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #74ebd5 0%, #9face6 100%)",
                                                    }}
                                                    title="Aqua Dream"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                                                    }}
                                                    title="Sunset"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
                                                    }}
                                                    title="Coral Red"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)",
                                                    }}
                                                    title="Rose Pink"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
                                                    }}
                                                    title="Soft Bloom"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    }}
                                                    title="Royal Purple"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                                    }}
                                                    title="Magenta Pink"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                                    }}
                                                    title="Electric Blue"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                                    }}
                                                    title="Fresh Green"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                                                    }}
                                                    title="Ocean Deep"
                                                />
                                                <button
                                                    onClick={() =>
                                                        setSelectedBgColor(
                                                            "linear-gradient(135deg, #ffecd2 25%, #fcb69f 100%)"
                                                        )
                                                    }
                                                    className="w-16 h-16 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200"
                                                    style={{
                                                        background:
                                                            "linear-gradient(135deg, #ffecd2 25%, #fcb69f 100%)",
                                                    }}
                                                    title="Warm Peach"
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Show More / Show Less Button */}
                                    <button
                                        onClick={() =>
                                            setShowAllBackgrounds(
                                                !showAllBackgrounds
                                            )
                                        }
                                        className="mt-2 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        {showAllBackgrounds
                                            ? "Show Less"
                                            : "Show More"}
                                    </button>
                                </div>

                                {/* Manual Color Picker */}
                                <div className="flex flex-col gap-2 mt-2">
                                    <label className="text-xs text-gray-600">
                                        Custom Color
                                    </label>
                                    <input
                                        type="color"
                                        value={
                                            selectedBgColor.startsWith("#")
                                                ? selectedBgColor
                                                : "#ffffff"
                                        }
                                        onChange={(e) =>
                                            setSelectedBgColor(e.target.value)
                                        }
                                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                                        title="Pick Custom Color"
                                    />
                                    <button
                                        onClick={() =>
                                            setSelectedBgColor("#ffffff")
                                        }
                                        className="w-12 h-12 rounded-lg shadow-md hover:scale-110 transition-transform border-2 border-gray-200 bg-white"
                                        title="Reset to White"
                                    >
                                        <span className="text-xs">Reset</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex  gap-3">
                            {/* Clear Content button: left/corner of the action group */}
                            <button
                                onClick={async () => {
                                    if (!editor) return;
                                    // Clear editor content
                                    editor.chain().focus().setContent("").run();
                                    // Reset live preview state
                                    setFitScale(1);
                                    setLiveOverflow(false);
                                    setContentError(null);
                                    toast.success("Content cleared");
                                }}
                                disabled={!editor || isPostingImage}
                                className={`px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 border border-gray-300 hover:shadow-sm`}
                            >
                                Clear content
                            </button>

                            <button
                                onClick={handlePostContentAsImage}
                                disabled={isPostingImage || liveOverflow}
                                className={`px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${liveOverflow
                                    ? "bg-gray-400 text-white"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                    }`}
                            >
                                {isPostingImage
                                    ? "Posting..."
                                    : "Post this content"}
                            </button>
                        </div>
                        {contentError && (
                            <p className="mt-3 text-sm text-red-600">
                                {contentError}
                            </p>
                        )}

                        {/* Toasts are handled by react-toastify globally */}
                    </div>
                </div>

                {/* Social Media Image Upload Component */}
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 sm:p-6 h-full flex flex-col">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                            Upload Images
                        </h2>
                        <div className="flex-1">
                            <div>
                                <SocialMediaImageUpload
                                    autoUploadToServer={false}
                                    onUploadComplete={(img) => setPendingImage(img)}
                                />
                                <div className="mt-3 flex items-center gap-2">
                                    <button
                                        onClick={async () => {
                                            if (!pendingImage) return;
                                            setIsPostingImage(true);
                                            try {
                                                // Convert data URL to blob
                                                const res = await fetch(pendingImage.imageSrc);
                                                const blob = await res.blob();
                                                const formData = new FormData();
                                                const fileName = pendingImage.fileName || `notice_${Date.now()}.jpg`;
                                                formData.append('image', blob, fileName);

                                                await apiClient.post('/api/api-notice', formData, {
                                                    headers: { 'Content-Type': 'multipart/form-data' },
                                                });
                                                toast.success('Uploaded');
                                                setPendingImage(null);
                                                await fetchImages();
                                            } catch (err) {
                                                console.error('Upload failed', err);
                                                toast.error(err?.message || String(err));
                                            } finally {
                                                setIsPostingImage(false);
                                            }
                                        }}
                                        disabled={!pendingImage || isPostingImage}
                                        className={`px-4 py-2 rounded-md ${!pendingImage ? 'bg-gray-200 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                    >
                                        {isPostingImage ? 'Uploading...' : 'Upload'}
                                    </button>
                                    {pendingImage && (
                                        <div className="text-sm text-gray-600">Ready to upload: {pendingImage.fileName}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
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
                                    <div className="w-full">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
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

/* Tighten vertical rhythm only within this page's notice editor preview */
<style jsx global>{`
    .notice-editor .ProseMirror p,
    .notice-editor .ProseMirror ul,
    .notice-editor .ProseMirror ol,
    .notice-editor .ProseMirror h1,
    .notice-editor .ProseMirror h2,
    .notice-editor .ProseMirror h3,
    .notice-editor .ProseMirror blockquote {
        margin-top: 0;
        margin-bottom: 0;
    }
    .notice-editor .ProseMirror > :first-child {
        margin-top: 0 !important;
    }
    .notice-editor .ProseMirror > :last-child {
        margin-bottom: 0 !important;
    }
`}</style>;
