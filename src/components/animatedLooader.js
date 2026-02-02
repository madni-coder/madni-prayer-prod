"use client";

import React from "react";

export default function AnimatedLooader({ message = "Loading..." }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm" />

            <div className="relative pointer-events-auto p-6 rounded-2xl bg-gradient-to-br from-black/60 to-slate-900 border border-slate-700 shadow-xl w-64 flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-500 to-teal-400 p-1 flex items-center justify-center shadow-lg">
                    <div className="w-full h-full rounded-full bg-[#071426] flex items-center justify-center overflow-hidden">
                        <svg className="w-20 h-20 animate-spin-slow" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="g" x1="0" x2="1">
                                    <stop offset="0%" stopColor="#34D399" />
                                    <stop offset="100%" stopColor="#06B6D4" />
                                </linearGradient>
                            </defs>
                            <path d="M25 5a20 20 0 1 0 0 40" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="25" cy="5" r="2.6" fill="#10B981" />
                        </svg>
                    </div>
                </div>

                <div className="text-center">
                    <div className="text-sm font-semibold text-white">{message}</div>
                    <div className="mt-2 flex items-center justify-center gap-1">
                        <span className="w-2.5 h-2.5 bg-white/90 rounded-full animate-pulse-delay-0" />
                        <span className="w-2.5 h-2.5 bg-white/70 rounded-full animate-pulse-delay-200" />
                        <span className="w-2.5 h-2.5 bg-white/50 rounded-full animate-pulse-delay-400" />
                    </div>
                </div>
            </div>

            <style jsx>{`\
                @keyframes spin-slow { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }\
                .animate-spin-slow { animation: spin-slow 2.2s linear infinite }\
                @keyframes pulse-delay-0 { 0%{ transform:scale(1); opacity:1 } 50%{ transform:scale(0.6); opacity:0.4 } 100%{ transform:scale(1); opacity:1 } }\
                .animate-pulse-delay-0 { animation: pulse-delay-0 1s ease-in-out infinite }\
                .animate-pulse-delay-200 { animation: pulse-delay-0 1s ease-in-out infinite 0.2s }\
                .animate-pulse-delay-400 { animation: pulse-delay-0 1s ease-in-out infinite 0.4s }\
            `}</style>
        </div>
    );
}
