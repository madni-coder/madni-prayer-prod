"use client";
import React, { useState, useEffect } from "react";
import { FaBitcoin, FaMosque } from "react-icons/fa";
import { useRouter } from "next/navigation";
import fetchFromApi from "../../../utils/fetchFromApi";

export default function DuroodSharifPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState(null);

    useEffect(() => {
        // Check authentication on client side
        const checkAuth = () => {
            const isAuthenticated =
                localStorage.getItem("isAuthenticated") === "true";
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetchFromApi("/api/api-tasbihUsers");
                const json = await res.json();
                if (json.ok) setUsers(json.data);
            } catch (e) {
                setUsers([]);
            }
        }
        fetchUsers();
    }, []);

    // Sort users by Tasbih Counts (durood counts) in descending order and assign TOP rank
    const sortedUsers = [...users].sort((a, b) => {
        const aCount = Number(a["Tasbih Counts"] || 0);
        const bCount = Number(b["Tasbih Counts"] || 0);
        return bCount - aCount;
    });

    // Assign TOP rank to top 10 users
    const usersWithRank = sortedUsers.map((user, idx) => {
        return {
            ...user,
            TOP: idx < 10 ? idx + 1 : "",
        };
    });

    // Filter after ranking
    const filtered = usersWithRank.filter(
        (row) =>
            row["Full Name"].toLowerCase().includes(search.toLowerCase()) ||
            row["Address"].toLowerCase().includes(search.toLowerCase()) ||
            row["mobile number"].toLowerCase().includes(search.toLowerCase())
    );

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow p-0 mt-8">
            <div className="p-4 flex items-start justify-between gap-4">
                <div>
                    <input
                        type="text"
                        placeholder="Search by name, address or mobile number"
                        className="input input-bordered bg-white w-full max-w-xs text-black"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Theme-based publish button at top-right */}
                <div className="ml-auto">
                    <button
                        onClick={async () => {
                            // publish top 10 rows in a single POST
                            setIsPublishing(true);
                            setPublishStatus(null);
                            try {
                                // Take top 10 from usersWithRank (they have TOP assigned for top 10)
                                const topTen = usersWithRank
                                    .filter((u) => u.TOP)
                                    .slice(0, 10);

                                if (!topTen.length) {
                                    setPublishStatus({
                                        ok: 0,
                                        fail: 0,
                                        error: "No top entries to publish",
                                    });
                                    setIsPublishing(false);
                                    return;
                                }

                                const payloadItems = topTen.map((row, i) => ({
                                    position:
                                        row.TOP !== "" && row.TOP !== undefined
                                            ? Number(row.TOP)
                                            : i + 1,
                                    fullName: row["Full Name"] || "",
                                    address: row["Address"] || "",
                                    // areaMasjid required by API; fallback to Address
                                    areaMasjid:
                                        row["areaMasjid"] ||
                                        row["Address"] ||
                                        "",
                                    counts: Number(row["Tasbih Counts"] || 0),
                                }));

                                const res = await fetch("/api/api-rewards", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                        items: payloadItems,
                                    }),
                                });

                                const txt = await res.text();
                                if (!res.ok) {
                                    throw new Error(txt || res.statusText);
                                }

                                // parse success response which contains inserted count
                                let result;
                                try {
                                    result = JSON.parse(txt);
                                } catch (e) {
                                    result = { message: txt };
                                }

                                setPublishStatus({
                                    ok:
                                        result.inserted ||
                                        (result.success
                                            ? payloadItems.length
                                            : 0),
                                    fail: 0,
                                });
                            } catch (e) {
                                setPublishStatus({
                                    ok: 0,
                                    fail: 1,
                                    error: e.message,
                                });
                            } finally {
                                setIsPublishing(false);
                            }
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
                        disabled={isPublishing || filtered.length === 0}
                        title="Publish top 10 results to rewards API"
                    >
                        {isPublishing ? "Publishing..." : "Publish Results"}
                    </button>
                    {publishStatus && (
                        <div className="mt-2 text-sm text-gray-700">
                            Published: {publishStatus.ok} — Failed:{" "}
                            {publishStatus.fail}
                            {publishStatus.error && (
                                <span> — {publishStatus.error}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <table className="table w-full">
                <thead>
                    <tr className="bg-[#5fb923] rounded-t-xl">
                        <th className="font-semibold text-base text-white text-left rounded-tl-xl">
                            TOP
                        </th>
                        <th className="font-semibold text-base text-white text-left">
                            Name
                        </th>
                        <th className="font-semibold text-base text-white text-left">
                            Colony Address
                        </th>
                        <th className="font-semibold text-base text-white text-left">
                            Mobile Number
                        </th>
                        <th className="font-semibold text-base text-white text-left">
                            Durood Counts
                        </th>
                        <th className="font-semibold text-base text-white text-left rounded-tr-xl">
                            Date
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((row, idx) => (
                        <tr
                            key={idx}
                            className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                            <td className="py-4 text-gray-800 text-left font-bold">
                                {row.TOP}
                            </td>
                            <td className="flex items-center gap-3 py-4 text-gray-800 text-left">
                                <span className="bg-amber-100 rounded-full p-2 flex items-center justify-center">
                                    <FaBitcoin className="text-2xl text-amber-700" />
                                </span>
                                <span className="font-medium">
                                    {row["Full Name"]}
                                </span>
                            </td>
                            <td className="py-4 text-gray-800 text-left">
                                {row["Address"]}
                            </td>
                            <td className="py-4 text-gray-800 text-left">
                                {row["mobile number"]}
                            </td>
                            <td className="py-4 text-gray-800 text-left">
                                {row["Tasbih Counts"] || "NA"}
                            </td>
                            <td className="py-4 text-gray-800 text-left">
                                {row["date"] || new Date().toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
