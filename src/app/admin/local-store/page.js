"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useLocalStoreContext } from "../../../context/LocalStoreContext";

export default function LocalStoreListPage() {
    const router = useRouter();
    const { stores, loading, fetchAll } = useLocalStoreContext();

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);



    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Local Stores</h1>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{stores.length} stores</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => router.push('/admin/local-store/createStore')} className="btn btn-primary">Create Store</button>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-50 to-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Shop name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Work type</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-sm text-gray-500">Loading...</td></tr>
                        ) : stores.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No stores found.</td>
                            </tr>
                        ) : (
                            stores.map((s, idx) => (
                                <tr key={s.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-semibold">{(s.fullName || '').charAt(0) || 'S'}</div>
                                            <div className="cursor-pointer" onClick={() => router.push(`/admin/local-store/${s.id}`)}>
                                                <div className="text-sm font-medium text-gray-900">{s.fullName}</div>
                                                <div className="text-xs text-gray-500">ID: {s.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer" onClick={() => router.push(`/admin/local-store/${s.id}`)}>{s.shopName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer" onClick={() => router.push(`/admin/local-store/${s.id}`)}>{s.shopAddress || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer" onClick={() => router.push(`/admin/local-store/${s.id}`)}>{s.workType || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button className="btn btn-sm btn-ghost" onClick={() => router.push(`/admin/local-store/editStore?id=${s.id}`)}>Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
