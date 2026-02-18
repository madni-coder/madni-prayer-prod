"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "../../../../lib/apiClient";

export default function RegisterMasjid() {
    const router = useRouter();
    const [form, setForm] = useState({
        masjidId: "",
        masjidName: "",
        fullAddress: "",
        city: "",
        mutwalliName: "",
        committeeMembers: "",
        mobileNumbers: "",
        password: "",
        imaamName: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                masjidId: parseInt(form.masjidId),
                masjidName: form.masjidName,
                fullAddress: form.fullAddress,
                city: form.city,
                mutwalliName: form.mutwalliName,
                committeeMembers: form.committeeMembers.split(',').map(s => s.trim()).filter(Boolean),
                mobileNumbers: form.mobileNumbers.split(',').map(s => s.trim()).filter(Boolean),
                password: form.password,
                imaamName: form.imaamName || null,
            };

            await apiClient.post('/api/masjid-committee', payload);
            router.push('/admin/masjid-committee');
        } catch (err) {
            console.error(err);
            alert(err?.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded shadow text-black">
            <h1 className="text-xl font-semibold mb-4 text-black">Register Masjid Committee</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                    <label className="block text-sm text-black">Masjid Id (numeric)</label>
                    <input name="masjidId" value={form.masjidId} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm text-black">Masjid Name</label>
                    <input name="masjidName" value={form.masjidName} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm text-black">Full Address</label>
                    <input name="fullAddress" value={form.fullAddress} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm text-black">City</label>
                    <input name="city" value={form.city} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm text-black">Mutwalli Name</label>
                    <input name="mutwalliName" value={form.mutwalliName} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm text-black">Committee Members (comma separated)</label>
                    <input name="committeeMembers" value={form.committeeMembers} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm text-black">Mobile Numbers (comma separated)</label>
                    <input name="mobileNumbers" value={form.mobileNumbers} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm text-black">Password</label>
                    <input name="password" type="text" value={form.password} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" required />
                </div>

                <div className="sm:col-span-1">
                    <label className="block text-sm text-black">Imaam Name (optional)</label>
                    <input name="imaamName" value={form.imaamName} onChange={handleChange} className="w-full mt-1 rounded border p-2 text-black" />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                    <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>{loading ? 'Saving...' : 'Register'}</button>
                </div>
            </form>
        </div>
    );
}
