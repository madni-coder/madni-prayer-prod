"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // fetch registered users from the API using axios
        (async () => {
            try {
                const res = await axios.get("/api/auth/register");
                const data = res.data;
                if (data?.error) setError(data.error);
                else setUsers(data?.users || []);
            } catch (err) {
                setError(err?.response?.data?.error || err.message || "Failed to fetch");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // no theme/dark-mode handling here — page uses a light design with black text

    return (
        <div className="w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-black">Registered Users</h1>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="p-4 border-b border-transparent">
                    <p className="text-sm text-gray-700">A table of all registered users.</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed w-full">
                        <colgroup>
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '28%' }} />
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <thead>
                            <tr className="bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 text-black rounded-t-lg">
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Gender</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Full Name</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Address</th>
                                <th className="px-6 py-3 text-left text-sm font-bold uppercase">Area Masjid</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-700">Loading...</td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-600">{error}</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-700">No users found.</td>
                                </tr>
                            ) : (
                                users.map((u, idx) => (
                                    <tr key={u.id || idx} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.gender || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{u.fullName || u.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.email || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.address || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{u.areaMasjid || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

