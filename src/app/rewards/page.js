import React from "react";

const demoData = [
    { firstName: "Dorcius", lastName: "dorlensley", xp: 956 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 639 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 444 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 321 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 231 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 109 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 108 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 108 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 108 },
    { firstName: "Dorcius", lastName: "dorlensley", xp: 108 },
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
    return (
        <div
            style={{
                maxWidth: 400,
                margin: "24px auto",
                background: "linear-gradient(180deg, #2d185a 0%, #5a3fa0 100%)",
                borderRadius: 24,
                padding: 16,
                color: "#fff",
                fontFamily: "sans-serif",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
        >
            {/* Winner Announcement Card */}
            <div
                style={{
                    background: "#111",
                    borderRadius: 24,
                    padding: "36px 16px 28px 16px",
                    marginBottom: 24,
                    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
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
                <div
                    style={{
                        color: "#FFD700",
                        fontWeight: 700,
                        fontSize: 40,
                        marginBottom: 4,
                    }}
                >
                    Amjad Ali
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
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 12,
                }}
            >
                {medalSVG.map((svg, idx) => (
                    <span key={idx}>{svg}</span>
                ))}
            </div>
            <div
                style={{
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 22,
                    marginBottom: 4,
                }}
            >
                Durood Sharif
            </div>

            <div
                style={{
                    textAlign: "center",
                    fontSize: 14,
                    color: "#FFD700",
                    marginBottom: 12,
                    marginTop: 2,
                }}
            >
                Winner of the week
            </div>
            <div
                style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 12,
                    padding: 8,
                }}
            >
                {/* Label Row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 0 4px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.13)",
                        fontWeight: 600,
                        fontSize: 13,
                        color: "#FFD700",
                        letterSpacing: 0.2,
                        textTransform: "uppercase",
                    }}
                >
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
                        style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom:
                                idx < demoData.length - 1
                                    ? "1px solid rgba(255,255,255,0.08)"
                                    : "none",
                        }}
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
            <style>{`
        @media (max-width: 500px) {
          div[style*="max-width: 400px"] {
            max-width: 98vw !important;
            padding: 6vw !important;
          }
        }
      `}</style>
        </div>
    );
};

export default RewardsPage;
