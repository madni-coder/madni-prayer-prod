"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FaStore, FaMapMarkerAlt, FaPhone, FaUser, FaArrowLeft, FaInfoCircle, FaCopy, FaCheck } from "react-icons/fa";
import AnimatedLooader from "../../../components/animatedLooader";

export default function ViewStoreClient() {
    const params = useSearchParams();
    const router = useRouter();
    const id = params?.get("id");

    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let mounted = true;
        if (!id) {
            setError("Missing store id");
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/local-stores?id=${encodeURIComponent(id)}`);
                const data = await res.json();
                if (!mounted) return;
                if (data && data.ok) {
                    setStore(data.data);
                } else {
                    setError(data?.error || "Failed to load store");
                }
            } catch (err) {
                if (!mounted) return;
                setError(String(err));
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [id]);

    const copyToClipboard = async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-base-200 p-6">
                <div className="min-h-[60vh] flex items-center justify-center">
                    <AnimatedLooader message="Loading store..." />
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-base-200 p-6">
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="alert alert-error shadow-lg max-w-md">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!store) {
        return (
            <main className="min-h-screen bg-base-200 p-6">
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="alert alert-warning shadow-lg max-w-md">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>Store not found</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const img = store.imageSrcPortrait || store.imageSrc || null;

    return (
        <main className="min-h-screen bg-base-200 pb-8">
            <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                {img ? (
                    <>
                        <img
                            src={img}
                            alt={store.shopName || "store"}
                            className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-base-300/90 via-base-300/40 to-transparent" />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full w-full">
                        <div className="text-8xl md:text-9xl text-primary/30">
                            <FaStore />
                        </div>
                    </div>
                )}

                <button
                    onClick={() => router.back()}
                    className="btn btn-circle btn-sm sm:btn-md absolute top-4 left-4 shadow-lg backdrop-blur-sm bg-base-100/80 hover:bg-base-100 border-base-300"
                >
                    <FaArrowLeft className="text-base-content" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                    <div className="max-w-5xl mx-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
                            {store.shopName || "Untitled Store"}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {store.shopAddress && (
                            <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300">
                                <div className="card-body">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <FaMapMarkerAlt className="text-primary text-2xl" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base-content mb-1 flex items-center gap-2">
                                                Location
                                                <div className="badge badge-primary badge-sm">Address</div>
                                            </h3>
                                            <p className="text-base-content/70 leading-relaxed">
                                                {store.shopAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card bg-base-100 shadow-xl border border-base-300 hover:shadow-2xl transition-shadow duration-300">
                            <div className="card-body">
                                <h2 className="card-title text-base-content flex items-center gap-2">
                                    <FaInfoCircle className="text-primary" />
                                    About
                                </h2>
                                <div className="divider my-1"></div>
                                <p className="text-base-content/80 leading-relaxed whitespace-pre-line">
                                    {store.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        {store.imageSrc && store.imageSrc !== img && (
                            <div className="card bg-base-100 shadow-xl border border-base-300">
                                <div className="card-body p-0">
                                    <figure className="rounded-lg overflow-hidden">
                                        <img
                                            src={store.imageSrc}
                                            alt="store gallery"
                                            className="object-cover w-full h-64 hover:scale-105 transition-transform duration-500"
                                        />
                                    </figure>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20">
                            <div className="card-body">
                                <h2 className="card-title text-base-content mb-4">Contact Information</h2>
                                <div className="divider my-0"></div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 bg-base-100 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <FaUser className="text-primary text-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-base-content/60 font-medium uppercase tracking-wide mb-1">
                                                Owner
                                            </div>
                                            <div className="font-semibold text-base-content">
                                                {store.fullName || "—"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-base-100 rounded-lg hover:shadow-md transition-shadow">
                                        <div className="bg-success/10 p-2 rounded-lg">
                                            <FaPhone className="text-success text-lg" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-xs text-base-content/60 font-medium uppercase tracking-wide mb-1">
                                                Contact
                                            </div>
                                            <div className="font-semibold text-base-content flex items-center gap-2">
                                                {store.mobile ? (
                                                    <>
                                                        <a
                                                            href={`tel:${store.mobile}`}
                                                            className="link link-success hover:link-hover"
                                                        >
                                                            {store.mobile}
                                                        </a>
                                                        <button
                                                            onClick={() => copyToClipboard(store.mobile)}
                                                            className="btn btn-ghost btn-xs btn-circle hover:bg-success/20"
                                                            title="Copy phone number"
                                                        >
                                                            {copied ? (
                                                                <FaCheck className="text-success" />
                                                            ) : (
                                                                <FaCopy className="text-base-content/60" />
                                                            )}
                                                        </button>
                                                    </>
                                                ) : "—"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
