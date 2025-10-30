import React from "react";

export default function TasbihSvgIcon({ className = "" }) {
    return (
        <svg
            viewBox="0 0 250 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            width="1em"
            height="1em"
        >
            {/* Main Body Shape */}
            <path
                d="M225 175C225 240 200 300 125 300C50 300 25 240 25 175V75C25 40 50 25 125 25C200 25 225 40 225 75V175Z"
                fill="#1A1A1A"
                stroke="#333333"
                strokeWidth="2"
            />
            <path
                d="M220 175C220 230 195 280 125 280C55 280 30 230 30 175V75C30 45 55 30 125 30C195 30 220 45 220 75V175Z"
                fill="#292929"
                stroke="#000000"
                strokeWidth="1"
            />
            {/* Screen Background */}
            <rect x="50" y="60" width="150" height="70" rx="8" fill="#000000" />
            <rect x="53" y="63" width="144" height="64" rx="6" fill="#0A3C0A" />
            <rect x="55" y="65" width="140" height="60" rx="4" fill="#135C13" />
            {/* Digital Display Numbers (0099) */}
            {/* Digit 1 (0) */}
            <path
                d="M68 90L72 86L76 90V110L72 114L68 110V90ZM72 90V110"
                fill="#00FF00"
                fillOpacity="0.3"
            />
            {/* Digit 2 (0) */}
            <path
                d="M92 90L96 86L100 90V110L96 114L92 110V90ZM96 90V110"
                fill="#00FF00"
                fillOpacity="0.3"
            />
            {/* Digit 3 (9) */}
            <path
                d="M116 90L120 86L124 90V100L120 104L116 100V90ZM120 90H124M116 94H120"
                fill="#00FF00"
            />
            <path
                d="M120 90H124V94L120 98H116M120 98V104L124 100V90"
                fill="#00FF00"
            />
            {/* Digit 4 (9) */}
            <path
                d="M140 90L144 86L148 90V100L144 104L140 100V90ZM144 90H148M140 94H144"
                fill="#00FF00"
            />
            <path
                d="M144 90H148V94L144 98H140M144 98V104L148 100V90"
                fill="#00FF00"
            />
            {/* Smaller Button (Reset/Mode) */}
            <circle
                cx="170"
                cy="155"
                r="12"
                fill="#3D3D3D"
                stroke="#000000"
                strokeWidth="1"
            />
            <circle cx="170" cy="155" r="10" fill="#4CAF50" />
            <circle cx="170" cy="155" r="8" fill="#2E7D32" />
            {/* Main Button (Press to Count) */}
            <circle
                cx="125"
                cy="220"
                r="45"
                fill="#CCCCCC"
                stroke="#000000"
                strokeWidth="1"
            />
            <circle cx="125" cy="220" r="42" fill="#EEEEEE" />
            <circle
                cx="125"
                cy="220"
                r="40"
                fill="#DDDDDD"
                stroke="#AAAAAA"
                strokeWidth="1"
                strokeOpacity="0.5"
            />
            <circle cx="125" cy="220" r="38" fill="#4CAF50" />
            <circle cx="125" cy="220" r="35" fill="#2E7D32" />
        </svg>
    );
}
