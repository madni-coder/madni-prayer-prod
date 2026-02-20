"use client";
import React, { useState } from "react";
import apiClient from "../../lib/apiClient";
import AnimatedLooader from "../../components/animatedLooader";
import {
    FaAngleLeft,
    FaArrowDown,
    FaRegCheckCircle,
    FaStar,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const medalSVG = [
    // Gold
    <svg key="gold" width="28" height="28" viewBox="0 0 28 28">
        <circle
            cx="14"
            cy="14"
            r="12"
            fill="#FFD700"
            stroke="#E5C100"
            strokeWidth="2"
        />
        <text
            x="14"
            y="19"
            textAnchor="middle"
            fontSize="14"
            fill="#fff"
            fontWeight="bold"
        >
            🥇
        </text>
    </svg>,
    // Silver
    <svg key="silver" width="28" height="28" viewBox="0 0 28 28">
        <circle
            cx="14"
            cy="14"
            r="12"
            fill="#C0C0C0"
            stroke="#A9A9A9"
            strokeWidth="2"
        />
        <text
            x="14"
            y="19"
            textAnchor="middle"
            fontSize="14"
            fill="#fff"
            fontWeight="bold"
        >
            🥈
        </text>
    </svg>,
    // Bronze
    <svg key="bronze" width="28" height="28" viewBox="0 0 28 28">
        <circle
            cx="14"
            cy="14"
            r="12"
            fill="#CD7F32"
            stroke="#A0522D"
            strokeWidth="2"
        />
        <text
            x="14"
            y="19"
            textAnchor="middle"
            fontSize="14"
            fill="#fff"
            fontWeight="bold"
        >
            🥉
        </text>
    </svg>,
];

const RewardsPage = () => {
    // Helper to format date as dd/mm/yyyy
    function formatDateDMY(dateStr) {
        if (!dateStr) return "--";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [showRoadmap, setShowRoadmap] = useState(false);
    const [rewardList, setRewardList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        async function fetchRewards() {
            setIsLoading(true);
            try {
                const { data } = await apiClient.get("/api/api-rewards");

                // Axios returns data as string if the API doesn't set Content-Type: application/json
                const parsedData = typeof data === "string" ? JSON.parse(data) : data;

                // Ensure we only keep top 10 by position (ascending)
                const list = Array.isArray(parsedData) ? parsedData : [];
                // keep the full normalized list in state; we'll select best per position
                list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                setRewardList(list);
            } catch (err) {
                setRewardList([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRewards();
    }, []);

    // If position is missing, show top 10 users by weeklyCounts
    const positionsList = React.useMemo(() => {
        if (!rewardList || rewardList.length === 0)
            return Array.from({ length: 10 }, (_, i) => ({ empty: true }));
        // Sort by weeklyCounts descending, then by createdAt descending
        const sorted = [...rewardList].sort((a, b) => {
            const aCount = Number(a.weeklyCounts ?? 0);
            const bCount = Number(b.weeklyCounts ?? 0);
            if (bCount !== aCount) return bCount - aCount;
            const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
            const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
            return bTime - aTime;
        });
        // Take top 10
        const top10 = sorted.slice(0, 10);
        // Fill up to 10 slots
        while (top10.length < 10) top10.push({ empty: true });
        return top10;
    }, [rewardList]);

    // goldWinner is the top user (first in sorted list)
    const goldWinner =
        positionsList[0] && !positionsList[0].empty ? positionsList[0] : null;

    // Derive a displayable week range (from / to) from the reward list
    const weekRange = React.useMemo(() => {
        if (!rewardList || rewardList.length === 0) return null;
        const item = rewardList.find((r) => r && (r.from || r.to));
        if (!item) return null;
        return {
            from: item.from ? String(item.from) : "",
            to: item.to ? String(item.to) : "",
        };
    }, [rewardList]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
            <div className="w-full max-w-md px-4">
                <div className="mb-2 flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>

                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex-1 text-center">
                        Rewards
                    </h1>
                </div>
            </div>
            {/* Winner Announcement Card */}
            <div
                className="w-full max-w-md mx-auto bg-base-100 rounded-2xl p-3 mb-2 shadow-lg"
                style={{
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Gold Medal SVG with rays */}
                <div style={{ marginBottom: 6 }}>
                    <svg
                        width="80"
                        height="80"
                        viewBox="0 0 96 96"
                        style={{ display: "block", margin: "0 auto" }}
                    >
                        <g>
                            {/* Rays */}
                            <g>
                                <rect
                                    x="44"
                                    y="8"
                                    width="8"
                                    height="24"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.7"
                                />
                                <rect
                                    x="44"
                                    y="64"
                                    width="8"
                                    height="24"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.7"
                                />
                                <rect
                                    x="8"
                                    y="44"
                                    width="24"
                                    height="8"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.7"
                                />
                                <rect
                                    x="64"
                                    y="44"
                                    width="24"
                                    height="8"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.7"
                                />
                                <rect
                                    x="22"
                                    y="22"
                                    width="8"
                                    height="24"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.4"
                                    transform="rotate(-45 26 34)"
                                />
                                <rect
                                    x="66"
                                    y="22"
                                    width="8"
                                    height="24"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.4"
                                    transform="rotate(45 70 34)"
                                />
                                <rect
                                    x="22"
                                    y="66"
                                    width="8"
                                    height="24"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.4"
                                    transform="rotate(45 26 78)"
                                />
                                <rect
                                    x="66"
                                    y="66"
                                    width="8"
                                    height="24"
                                    rx="4"
                                    fill="#FFD700"
                                    opacity="0.4"
                                    transform="rotate(-45 70 78)"
                                />
                            </g>
                            {/* Medal */}
                            <circle
                                cx="48"
                                cy="48"
                                r="28"
                                fill="#FFD700"
                                stroke="#E5C100"
                                strokeWidth="4"
                            />
                            {/* Checkmark */}
                            <polyline
                                points="38,50 46,58 60,40"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </g>
                    </svg>
                </div>
                <div className="flex justify-center mb-1">
                    <div className="alert alert-success py-2 px-4 rounded-lg shadow text-lg text-white font-bold w-fit mx-auto">
                        🎉 Congratulations!
                    </div>
                </div>
                <div
                    style={{
                        color: "#FFD700",
                        fontWeight: 700,
                        fontSize: 32,
                        marginBottom: 2,
                        lineHeight: 1.05,
                    }}
                >
                    {goldWinner ? goldWinner.fullName : "No winner"}
                </div>

                <div className="text-sm font-semibold mb-2" style={{ color: "#93C5FD" }}>
                    To Get Rank 1 on Durood Sharif Reciting
                </div>
                {/* Theme-based address for gold winner */}
                {goldWinner && goldWinner.address && (
                    <div
                        className="mx-auto mb-1 px-3 py-1 rounded-lg font-semibold text-base"
                        style={{
                            background:
                                "linear-gradient(90deg, #FFD700 60%, #FFFBEA 100%)",
                            color: "#7C5E00",
                            maxWidth: "80%",
                            boxShadow: "0 2px 8px rgba(255,215,0,0.08)",
                        }}
                    >
                        {goldWinner.address}
                    </div>
                )}
                {/* <div
                    style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 20,
                        marginBottom: 8,
                    }}
                >
                   For Achieving  1st Rank on reciting maxium durood sharif
                </div> */}
            </div>

            <div className="text-center text-xxl text-yellow-400 mb-1 mt-0">
                Top 10 Winners of this week
            </div>

            {/* Week range (from / to) displayed with theme-based colors and fonts, formatted as dd/mm/yyyy */}
            {weekRange ? (
                <div className="w-full max-w-md mx-auto flex items-center justify-center gap-2 mb-2">
                    <div className="text-sm  text-white-content/60 font-semibold tracking-wide uppercase">
                        From
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-bold text-sm">
                        {formatDateDMY(weekRange.from)}
                    </div>
                    <div className="text-sm text-white-content/60 ">To</div>
                    <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-amber-900 font-bold text-sm">
                        {formatDateDMY(weekRange.to)}
                    </div>
                </div>
            ) : null}

            <div className="bg-base-200 rounded-xl p-1 w-full max-w-md">
                <table className="w-full" style={{ tableLayout: "fixed" }}>
                    <thead>
                        <tr className="border-b border-yellow-100 font-semibold text-xs text-yellow-400 uppercase tracking-wide">
                            <th className="px-2 text-center" style={{ width: 48 }}>Rank</th>
                            <th className="px-0" style={{ width: 8 }} />
                            <th className="px-2 text-left" style={{ width: '42%' }}>Names</th>
                            <th className="px-2 text-left" style={{ width: '40%' }}>Address</th>
                            <th className="px-2 text-right" style={{ width: 70 }}>Durood<br />Counts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-3 text-center">
                                    <AnimatedLooader className="mx-auto" message="Loading winners..." />
                                </td>
                            </tr>
                        ) : rewardList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-2 text-center text-base-content/60">
                                    No winners found.
                                </td>
                            </tr>
                        ) : (
                            positionsList.map((user, idx) => {
                                const pos = idx + 1;
                                let rankDisplay = null;
                                if (pos === 1) rankDisplay = medalSVG[0];
                                else if (pos === 2) rankDisplay = medalSVG[1];
                                else if (pos === 3) rankDisplay = medalSVG[2];
                                else
                                    rankDisplay = (
                                        <span className="font-bold text-[16px]" style={{ color: "var(--theme-rank-color, #FFD700)" }}>
                                            {pos}
                                        </span>
                                    );
                                return (
                                    <tr key={user.id || `pos-${pos}`} className="border-b last:border-b-0 border-base-300 align-top">
                                        <td className="px-1 py-1 text-center align-middle align-top " style={{ width: 48 }}>{rankDisplay}</td>
                                        <td style={{ width: 8 }} />
                                        <td className="px-0 py-1 align-top break-words whitespace-normal font-medium text-[15px]" style={{ width: '42%' }}>
                                            {user.empty ? "-" : user.fullName}
                                        </td>
                                        <td className="py-1 align-top text-gray-400 break-words whitespace-normal">
                                            {user.empty ? "-" : user.address || "-"}
                                        </td>
                                        <td className="px-0 py-1 text-right font-semibold whitespace-nowrap" style={{ width: 70 }}>
                                            {user.empty ? "--" : String(user.weeklyCounts ?? 0).padStart(2, "0")}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="w-full max-w-md mx-auto my-1">
                <div
                    className="px-3 py-2 rounded-lg text-center"
                    style={{
                        background: "linear-gradient(90deg, rgba(79,70,229,0.06), rgba(245,158,11,0.04))",
                        border: "1px solid rgba(255,215,0,0.08)",
                    }}
                >
                    <div style={{ color: "#FFD700", fontWeight: 600 }}>
                        We will announce winner names on every Friday At 3 PM
                    </div>
                </div>
            </div>

            {/* Collapsible Roadmap UI below winners list */}
            <div className="w-full max-w-md mx-auto my-2">
                <button
                    className="btn btn-outline btn-info w-full mb-1 font-semibold"
                    onClick={() => setShowRoadmap((v) => !v)}
                    aria-label="See  how to register"
                >
                    {showRoadmap
                        ? "Hide registration steps"
                        : "See Steps How To Register"}
                </button>
                {showRoadmap && (
                    <div className="relative bg-base-100 rounded-xl p-4 shadow-sm overflow-visible animate-fadeIn">
                        <div className="text-center text-lg font-bold mb-2">
                            How to register
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xl shadow-lg">
                                        🎗️
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        Register for Weekly Durood Sharif
                                    </div>
                                    <div className="text-sm text-base-content/60">
                                        Begin the registration flow — quick and
                                        secure
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded" />
                                <FaArrowDown className="my-0 text-yellow-500" />
                                <div className="w-0.5 h-4 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded" />
                            </div>

                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                                        📍
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        Go to Tasbih page
                                    </div>
                                    <div className="text-sm text-base-content/60">
                                        Open the Tasbih page where registration
                                        is available
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-200 to-indigo-400 rounded" />
                                <FaArrowDown className="my-0 text-indigo-500" />
                                <div className="w-0.5 h-4 bg-gradient-to-b from-indigo-200 to-indigo-400 rounded" />
                            </div>

                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-xl shadow-lg">
                                        <FaRegCheckCircle />
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        Click on Submit Durood Sharif button
                                    </div>
                                    <div className="text-sm text-base-content/60">
                                        Recite Durood and Tap the submit button
                                        to open the form
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-0.5 h-4 bg-gradient-to-b from-green-200 to-green-400 rounded" />
                                <FaArrowDown className="my-0 text-green-500" />
                                <div className="w-0.5 h-4 bg-gradient-to-b from-green-200 to-green-400 rounded" />
                            </div>

                            <div className="flex items-center gap-2">
                                <div>
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl shadow-lg">
                                        <FaStar />
                                    </div>
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        Fill details and submit
                                    </div>
                                    <div className="text-sm text-base-content/60">
                                        Enter full name, address and mobile then
                                        submit
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn backdrop-blur-lg"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-base-100 rounded-2xl shadow-xl p-6 w-full max-w-sm relative animate-modalPop border border-base-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-xl"
                            onClick={() => setShowModal(false)}
                        >
                            &times;
                        </button>
                        <h3 className="text-lg font-bold mb-4 text-center text-gray-200">
                            Register for Weekly Durood
                        </h3>
                    </div>
                </div>
            )}
            <style>{`
        @media (max-width: 500px) {
          div[class*="max-w-md"] {
            max-width: 98vw !important;
            padding: 6vw !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s;
        }
        @keyframes modalPop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modalPop {
          animation: modalPop 0.3s;
        }
      `}</style>
            <p className="text-center text-xl font-bold mb-1">
                Click Register button below to participate For Weekly Durood
                Sharif
            </p>
            <div className="flex justify-center mb-4">
                <button
                    className="btn btn-primary px-6 py-2 rounded-lg font-semibold text-white shadow mb-4"
                    onClick={() => router.push("/tasbih")}
                    aria-label="Go to Tasbih page to register"
                >
                    Register
                </button>
            </div>
        </div>
    );
};

export default RewardsPage;
