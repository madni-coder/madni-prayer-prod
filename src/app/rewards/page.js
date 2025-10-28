"use client";
import React, { useState } from "react";
import {
    FaAngleLeft,
    FaArrowDown,
    FaRegCheckCircle,
    FaStar,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

const demoData = [
    { firstName: "Name", lastName: "surname", xp: 956 },
    { firstName: "Name", lastName: "surname", xp: 639 },
    { firstName: "Name", lastName: "surname", xp: 444 },
    { firstName: "Name", lastName: "surname", xp: 321 },
    { firstName: "Name", lastName: "surname", xp: 231 },
    { firstName: "Name", lastName: "surname", xp: 109 },
    { firstName: "Name", lastName: "surname", xp: 108 },
    { firstName: "Name", lastName: "surname", xp: 108 },
    { firstName: "Name", lastName: "surname", xp: 108 },
    { firstName: "Name", lastName: "surname", xp: 108 },
];

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
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
            <button
                className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            {/* Winner Announcement Card */}
            <div
                className="w-full max-w-md mx-auto bg-base-100 rounded-2xl p-6 mb-6 shadow-xl"
                style={{
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Gold Medal SVG with rays */}
                <div style={{ marginBottom: 24 }}>
                    <svg
                        width="96"
                        height="96"
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
                <div className="flex justify-center mb-2">
                    <div className="alert alert-success py-2 px-4 rounded-lg shadow text-lg text-white font-bold w-fit mx-auto">
                        🎉 Congratulations!
                    </div>
                </div>
                <div
                    style={{
                        color: "#FFD700",
                        fontWeight: 700,
                        fontSize: 40,
                        marginBottom: 4,
                    }}
                >
                    MOHAMMAD ALI
                </div>
                <div
                    style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 20,
                        marginBottom: 8,
                    }}
                >
                    You have earned Gold Medal on this level!
                </div>
            </div>
          
            <div className="flex justify-center gap-2 mb-3">
                {medalSVG.map((svg, idx) => (
                    <span key={idx}>{svg}</span>
                ))}
            </div>
            <div className="text-center font-semibold text-2xl mb-1">
                Durood Sharif
            </div>

            <div className="text-center text-sm text-yellow-400 mb-3 mt-1">
                Winners of the week
            </div>

            <div className="bg-base-200 rounded-xl p-2 w-full max-w-md">
                {/* Label Row */}
                <div className="flex items-center py-2 border-b border-yellow-100 font-semibold text-xs text-yellow-400 uppercase tracking-wide">
                    <div style={{ width: 28, textAlign: "center" }}>Medals</div>
                    <div style={{ width: 36, margin: "0 12px" }}></div>
                    <div style={{ flex: 1 }}>Names</div>
                    <div style={{ minWidth: 60, textAlign: "right" }}>
                        Durood Counts
                    </div>
                </div>
                {/* Data Rows */}
                {demoData.map((user, idx) => (
                    <div
                        key={idx}
                        className="flex items-center py-2 border-b last:border-b-0 border-base-300"
                    >
                        <div style={{ width: 28, textAlign: "center" }}>
                            {idx < 3 ? (
                                medalSVG[idx]
                            ) : (
                                <span style={{ fontWeight: 600, fontSize: 16 }}>
                                    {idx + 1}
                                </span>
                            )}
                        </div>
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "#fff",
                                margin: "0 12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#5a3fa0",
                                fontWeight: 700,
                                fontSize: 16,
                            }}
                        >
                            {user.firstName[0]}
                            {user.lastName[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 15 }}>
                                {user.firstName} {user.lastName}
                            </div>
                        </div>
                        <div
                            style={{
                                fontWeight: 600,
                                fontSize: 15,
                                minWidth: 60,
                                textAlign: "right",
                            }}
                        >
                            {user.xp}
                        </div>
                    </div>
                ))}
            </div>

            {/* Decorative Roadmap UI moved below winners list */}
            <div className="w-full max-w-md mx-auto my-6">
                <div className="relative bg-base-100 rounded-xl p-4 shadow-sm overflow-visible">
                    <div className="text-center text-lg font-bold mb-3">
                        How to register
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
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
                            <div className="w-0.5 h-6 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded" />
                            <FaArrowDown className="my-1 text-yellow-500" />
                            <div className="w-0.5 h-6 bg-gradient-to-b from-yellow-200 to-yellow-400 rounded" />
                        </div>

                        <div className="flex items-center gap-4">
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
                                    Open the Tasbih page where registration is
                                    available
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-200 to-indigo-400 rounded" />
                            <FaArrowDown className="my-1 text-indigo-500" />
                            <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-200 to-indigo-400 rounded" />
                        </div>

                        <div className="flex items-center gap-4">
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
                                    Recite Durood and Tap the submit button to open the form
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-0.5 h-6 bg-gradient-to-b from-green-200 to-green-400 rounded" />
                            <FaArrowDown className="my-1 text-green-500" />
                            <div className="w-0.5 h-6 bg-gradient-to-b from-green-200 to-green-400 rounded" />
                        </div>

                        <div className="flex items-center gap-4">
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
            </div>
            {/* Animated Modal */}
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
        <p className="text-center text-xl font-bold mb-2">
                Click Register button below to participate For Weekly Durood Sharif
            </p>
            <div className="flex justify-center mb-4">
                <button
                    className="btn btn-primary px-6 py-2 rounded-lg font-semibold text-white shadow mb-20"
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
