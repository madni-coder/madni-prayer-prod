"use client";
import React, { useState } from "react";
import { FaBitcoin, FaMosque } from "react-icons/fa";

export default function DuroodSharifTable() {
    const [search, setSearch] = useState("");
    const data = [
        { name: "Ali Khan", address: "123 Main St", tasbih: 12 },
        { name: "Sara Ahmed", address: "456 Oak Ave", tasbih: 34 },
        { name: "Tabish Raza", address: "789 Pine Rd", tasbih: 56 },
    ];
    const filtered = data.filter(
        (row) =>
            row.name.toLowerCase().includes(search.toLowerCase()) ||
            row.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white rounded-xl shadow p-0 mt-8">
            <div className="p-4">
                <input
                    type="text"
                    placeholder="Search by name or address"
                    className="input input-bordered bg-white w-full max-w-xs text-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <table className="table w-full">
                <thead>
                    <tr className="bg-[#5fb923] rounded-t-xl">
                        <th className="font-semibold text-base text-white text-left rounded-tl-xl">
                            Masjid
                        </th>
                        <th className="font-semibold text-base text-white text-left">
                            Colony Address
                        </th>
                        <th className="font-semibold text-base text-white text-left rounded-tr-xl">
                            Tasbih Counter
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((row, idx) => (
                        <tr
                            key={idx}
                            className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                            <td className="flex items-center gap-3 py-4 text-gray-800 text-left">
                                <span className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                                    <FaBitcoin className="text-2xl text-amber-700" />
                                </span>
                                <span className="font-medium">{row.name}</span>
                            </td>
                            <td className="py-4 text-gray-800 text-left">
                                {row.address}
                            </td>
                            <td className="py-4 text-gray-800 text-left">
                                {row.tasbih}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
