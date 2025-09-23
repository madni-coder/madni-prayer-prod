"use client";

import { useState } from "react";
import Link from "next/link";
import { RefreshCw, X } from "lucide-react";

const MASJIDS = [
    {
        id: 1,
        name: "Al-Noor Masjid",
        address: "Block A, Gulshan-e-Iqbal",
        locality: "Karachi",
    },
    {
        id: 2,
        name: "Falah Masjid",
        address: "Model Town, Block C",
        locality: "Lahore",
    },
    {
        id: 3,
        name: "Nurani Masjid",
        address: "F-8 Sector, Street 15",
        locality: "Islamabad",
    },
];

export default function Page() {
    const [localityFilter, setLocalityFilter] = useState("All");
    const [addressFilter, setAddressFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const handleReset = () => {
        setLocalityFilter("All");
        setAddressFilter("All");
        setSearchQuery("");
    };

    const clearSearch = () => {
        setSearchQuery("");
    };

    const clearAddressFilter = () => {
        setAddressFilter("All");
    };

    const clearLocalityFilter = () => {
        setLocalityFilter("All");
    };

    const filteredMasjids = MASJIDS.filter((masjid) => {
        const matchesLocality =
            localityFilter === "All" || masjid.locality === localityFilter;
        const matchesAddress =
            addressFilter === "All" || masjid.address === addressFilter;
        const matchesSearch = masjid.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchesLocality && matchesAddress && matchesSearch;
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Masjid</h1>
                <Link href="/admin/all-masjids/add">
                    <button className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        Add Masjid Entry
                    </button>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Masjid Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search masjid name"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Colony Address
                        </label>
                        <div className="relative">
                            <select
                                value={addressFilter}
                                onChange={(e) =>
                                    setAddressFilter(e.target.value)
                                }
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black appearance-none"
                            >
                                <option value="All">All</option>
                                <option value="Block A, Gulshan-e-Iqbal">
                                    Block A, Gulshan-e-Iqbal
                                </option>
                                <option value="Model Town, Block C">
                                    Model Town, Block C
                                </option>
                                <option value="F-8 Sector, Street 15">
                                    F-8 Sector, Street 15
                                </option>
                            </select>
                            {addressFilter !== "All" && (
                                <button
                                    onClick={clearAddressFilter}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear address filter"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Locality
                        </label>
                        <div className="relative">
                            <select
                                value={localityFilter}
                                onChange={(e) =>
                                    setLocalityFilter(e.target.value)
                                }
                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black appearance-none"
                            >
                                <option value="All">All</option>
                                <option value="Karachi">Karachi</option>
                                <option value="Lahore">Lahore</option>
                                <option value="Islamabad">Islamabad</option>
                            </select>
                            {localityFilter !== "All" && (
                                <button
                                    onClick={clearLocalityFilter}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    title="Clear locality filter"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleReset}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            title="Reset all filters"
                        >
                            <RefreshCw size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="bg-yellow-600 text-white">
                    <div className="grid grid-cols-6 gap-4 px-6 py-4 font-medium">
                        <div className="col-span-2">Masjid</div>
                        <div className="col-span-2">Colony Address</div>
                        <div className="col-span-2">Locality</div>
                    </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                    {filteredMasjids.map((masjid) => (
                        <div
                            key={masjid.id}
                            className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            {/* Masjid Info */}
                            <div className="col-span-2 flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <span className="text-lg">🕌</span>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">
                                        {masjid.name}
                                    </div>
                                </div>
                            </div>

                            {/* Colony Address */}
                            <div className="col-span-2">
                                <div className="text-sm text-gray-900">
                                    {masjid.address}
                                </div>
                            </div>

                            {/* Locality */}
                            <div className="col-span-2">
                                <div className="text-sm text-gray-900">
                                    {masjid.locality}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
