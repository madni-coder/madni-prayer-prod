"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLocalStoreContext } from "../../../../context/LocalStoreContext";
import SocialMediaImageUpload from "../../../../components/SocialMediaImageUpload";
import { toast } from "react-toastify";

export default function CreateStorePage() {
    const router = useRouter();
    const { create } = useLocalStoreContext();
    const [form, setForm] = useState({
        fullName: "",
        mobile: "",
        shopName: "",
        shopAddress: "",
        workType: "",
        description: "",
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await create(form);
            toast.success('Store created successfully!');
            router.push('/admin/local-store');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save store. Please try again.');
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-error mb-4">Add New Store</h1>
            <div className="w-full max-w-5xl flex items-center mb-4">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white btn btn-sm mr-2 flex items-center gap-1"
                    onClick={() => router.push("/admin/local-store")}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-blue-600 font-bold uppercase tracking-wide mb-1">Image</label>
                            <SocialMediaImageUpload onUploadComplete={(res) => {
                                if (res?.imageSrc || res?.imageSrcPortrait) {
                                    setForm((p) => ({ ...p, imageName: res.fileName || null, imageSrc: res.imageSrc || null, imageSrcPortrait: res.imageSrcPortrait || null }));
                                }
                            }} />
                            {form.imageSrcPortrait && (
                                <img src={form.imageSrcPortrait} alt="preview" className="mt-2 w-40 h-72 object-cover rounded-md" />
                            )}
                        </div>
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
                            <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                        </div>
                    </form>
                </div>


            </div>
        </div>
    );
}
