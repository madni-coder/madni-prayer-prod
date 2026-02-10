"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SocialMediaImageUpload from "../../../components/SocialMediaImageUpload";

export default function LocalStorePage() {
    const router = useRouter();
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

    function handleSubmit(e) {
        e.preventDefault();
        try {
            const existing = JSON.parse(localStorage.getItem("localStores") || "[]");
            existing.push({ ...form, id: Date.now() });
            localStorage.setItem("localStores", JSON.stringify(existing));
            alert("Saved to local storage");
            router.push("/admin");
        } catch (err) {
            console.error(err);
            alert("Failed to save");
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-error mb-4">Local Store</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full name</label>
                            <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile</label>
                            <input name="mobile" value={form.mobile} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shop name</label>
                            <input name="shopName" value={form.shopName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shop address</label>
                            <input name="shopAddress" value={form.shopAddress} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Work type</label>
                            <input name="workType" value={form.workType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>

                        <div>
                            <button type="submit" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white border rounded-lg p-4">
                        <SocialMediaImageUpload onUploadComplete={() => {
                            console.log('image uploaded');
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
