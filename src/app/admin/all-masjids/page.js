"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

const MASJIDS = [
    {
        id: 1,
        name: "Al-Noor Masjid",
        city: "Karachi",
        capacity: 500,
        status: "Active",
    },
    {
        id: 2,
        name: "Falah Masjid",
        city: "Lahore",
        capacity: 300,
        status: "Active",
    },
    {
        id: 3,
        name: "Nurani Masjid",
        city: "Islamabad",
        capacity: 200,
        status: "Inactive",
    },
];

export default function Page() {
    const [nameQuery, setNameQuery] = useState("");
    const [cityQuery, setCityQuery] = useState("");

    const filteredMasjids = MASJIDS.filter(
        (m) =>
            m.name.toLowerCase().includes(nameQuery.toLowerCase()) &&
            m.city.toLowerCase().includes(cityQuery.toLowerCase())
    );

    return (
        <div className="p-6 bg-white text-black opacity-100">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">All Masjids</h1>
                <Link href="/admin/all-masjids/add" className="">
                    <button
                        type="button"
                        className="btn btn-primary btn-sm gap-2 text-black"
                    >
                        <Plus size={16} />
                        Add Masjid
                    </button>
                </Link>
            </div>
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="input input-bordered w-full max-w-xs text-black bg-white border-gray-300 focus:border-primary focus:ring-0"
                />
                <input
                    type="text"
                    placeholder="Search by city"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    className="input input-bordered w-full max-w-xs text-black bg-white border-gray-300 focus:border-primary focus:ring-0"
                />
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow opacity-100">
                <table className="table w-full text-black">
                    <thead className="text-black opacity-100">
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>City</th>
                            <th>Capacity</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMasjids.map((m, idx) => (
                            <tr key={m.id}>
                                <th className="text-black">{idx + 1}</th>
                                <td className="text-black">{m.name}</td>
                                <td className="text-black">{m.city}</td>
                                <td className="text-black">{m.capacity}</td>
                                <td>
                                    <span
                                        className={`badge px-4 py-2 rounded-full text-white ${
                                            m.status === "Active"
                                                ? "bg-green-600"
                                                : "bg-gray-600"
                                        }`}
                                    >
                                        {m.status}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/all-masjids/edit-jamatTime`}
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-outline btn-sm btn-square text-blue-600"
                                                aria-label={`Edit ${m.name}`}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
