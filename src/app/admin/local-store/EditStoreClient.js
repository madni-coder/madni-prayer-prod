"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "../../../lib/apiClient";
import { toast } from "react-toastify";
import { ArrowLeft, Trash } from "lucide-react";
import SocialMediaImageUpload from "../../../components/SocialMediaImageUpload";

export default function EditStoreClient() {
    const router = useRouter();
    const search = useSearchParams();
    const id = search.get('id');

    const [form, setForm] = useState({
        fullName: "",
        mobile: "",
        shopName: "",
        shopAddress: "",
        workType: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        const fetchStore = async () => {
            setLoading(true);
            try {
                const { data } = await apiClient.get(`/api/local-stores?id=${id}`);
                const payload = data?.ok ? (Array.isArray(data.data) ? data.data[0] : data.data) : null;
                if (mounted && payload) {
                    setForm({
                        fullName: payload.fullName || "",
                        mobile: payload.mobile || "",
                        shopName: payload.shopName || "",
                        shopAddress: payload.shopAddress || "",
                        workType: payload.workType || "",
                        description: payload.description || "",
                        imageName: payload.imageName || null,
                        imageSrc: payload.imageSrc || null,
                        imageSrcPortrait: payload.imageSrcPortrait || null,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch store for edit', err);
                toast.error('Failed to fetch store for edit.');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchStore();
        return () => { mounted = false; };
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!id) {
            console.warn('Missing id');
            return;
        }
        try {
            const { data } = await apiClient.patch('/api/local-stores', { id, ...form });
            if (data?.ok) {
                toast.success('Store updated successfully!');
                router.push('/admin/local-store');
            } else {
                console.error('Update failed', data);
                toast.error(data?.error || 'Failed to update store.');
                console.warn('Failed to update');
            }
        } catch (err) {
            console.error('Patch error', err);
            toast.error('Failed to update store. Please try again.');
            console.warn('Failed to update');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
                <button onClick={() => router.back()} className="btn btn-ghost btn-sm flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                <h1 className="text-2xl text-black font-bold">Edit Store</h1>
            </div>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : (
                <div className="bg-white rounded-md shadow-sm p-6 max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Full name</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Mobile</label>
                            <input name="mobile" value={form.mobile} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Shop name</label>
                            <input name="shopName" value={form.shopName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Shop address</label>
                            <input name="shopAddress" value={form.shopAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Work type</label>
                            <input name="workType" value={form.workType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Image</label>
                            <SocialMediaImageUpload uploadUrl={`/api/local-stores?id=${id}`} httpMethod="PATCH" onUploadComplete={(res) => {
                                if (res?.imageSrc || res?.imageSrcPortrait) {
                                    setForm((p) => ({ ...p, imageName: res.fileName || null, imageSrc: res.imageSrc || null, imageSrcPortrait: res.imageSrcPortrait || null }));
                                }
                            }} />

                            {form.imageSrcPortrait && (
                                <div className="relative mt-2 inline-block">
                                    <img src={form.imageSrcPortrait} alt="preview" className="w-40 h-72 object-cover rounded-md" />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!confirm('Remove image?')) return;
                                            setForm((p) => ({ ...p, imageName: null, imageSrc: null, imageSrcPortrait: null }));
                                            if (id) {
                                                try {
                                                    const { data } = await apiClient.patch('/api/local-stores', { id, imageName: null, imageSrc: null, imageSrcPortrait: null });
                                                    if (!data?.ok) {
                                                        console.error('Failed to remove image', data);
                                                        toast.error(data?.error || 'Failed to remove image.');
                                                        console.warn('Failed to remove image');
                                                    } else {
                                                        toast.success('Image removed');
                                                    }
                                                } catch (err) {
                                                    console.error('Remove image error', err);
                                                    toast.error('Failed to remove image.');
                                                    console.warn('Failed to remove image');
                                                }
                                            }
                                        }}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-600"
                                        aria-label="Remove image"
                                    >
                                        <Trash size={34} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <button type="submit" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md">Save changes</button>
                            <button type="button" className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md" onClick={() => router.push(`/admin/local-store`)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
