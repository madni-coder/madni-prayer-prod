"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalStoreContext } from "../../../../context/LocalStoreContext";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

export default function StoreDetailClient({ id }) {
    const router = useRouter();
    const { stores, loading: ctxLoading, fetchAll, getById, remove: ctxRemove } = useLocalStoreContext();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchedRef = typeof window !== "undefined" ? require("react").useRef(false) : { current: false };

    useEffect(() => {
        if (!id) return;
        if (!fetchedRef.current && stores.length === 0) {
            fetchedRef.current = true;
            fetchAll().then(() => setLoading(false));
        } else if (stores.length > 0) {
            setLoading(false);
        }
    }, [id, fetchAll, stores.length]);

    useEffect(() => {
        if (!id || loading) return;
        const found = getById(id);
        setStore(found || null);
    }, [id, stores, getById, loading]);

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="btn btn-ghost btn-sm flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                    <h1 className="text-2xl font-bold text-gray-800">View Store Details</h1>
                    {store && <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{store.shopName}</span>}
                </div>

                <div className="flex items-center gap-2">
                    {store && (
                        <>
                            <button
                                onClick={async () => {
                                    if (!confirm('Delete store?')) return;
                                    try {
                                        await ctxRemove(store.id);
                                        toast.success('Store deleted');
                                        router.push('/admin/local-store');
                                    } catch (err) {
                                        console.error('Delete error', err);
                                        toast.error('Failed to delete store.');
                                    }
                                }}
                                className="btn btn-sm btn-error"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
            ) : !store ? (
                <div className="text-sm text-gray-500">Store not found.</div>
            ) : (
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 max-w-3xl">
                    <div className="flex items-start gap-6">
                        <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-white font-bold text-2xl">{(store.shopName || '').charAt(0) || 'S'}</div>

                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900">{store.shopName}</h2>
                            <p className="text-sm text-gray-600 mt-1">Owner: <span className="font-medium text-gray-800">{store.fullName}</span></p>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-md shadow-sm">
                                    <div className="text-xs text-gray-500">Mobile</div>
                                    <div className="font-medium text-gray-800">{store.mobile || '-'}</div>
                                </div>

                                <div className="p-3 bg-white rounded-md shadow-sm">
                                    <div className="text-xs text-gray-500">Work Type</div>
                                    <div className="font-medium text-gray-800">{store.workType || '-'}</div>
                                </div>

                                <div className="p-3 bg-white rounded-md shadow-sm sm:col-span-2">
                                    <div className="text-xs text-gray-500">Address</div>
                                    <div className="font-medium text-gray-800">{store.shopAddress || '-'}</div>
                                </div>

                                <div className="p-3 bg-white rounded-md shadow-sm sm:col-span-2">
                                    <div className="text-xs text-gray-500">Description</div>
                                    <div className="font-medium text-gray-800">{store.description || '-'}</div>
                                </div>
                            </div>

                            {store.imageSrcPortrait && (
                                <div className="mt-4">
                                    <div className="text-xs text-gray-500">Image</div>
                                    <img src={store.imageSrcPortrait} alt="store image" className="mt-2 w-48 h-80 object-cover rounded-md shadow-sm" />
                                </div>
                            )}

                            <div className="mt-4 text-sm text-gray-500">Created at: <span className="text-gray-700">{new Date(store.createdAt).toLocaleString()}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
