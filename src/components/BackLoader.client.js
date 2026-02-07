"use client"
import React from 'react';

export default function BackLoader({ message = "Loading..." }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-black/90 rounded-lg p-6 flex flex-col items-center gap-3 shadow-lg">
                <div className="loading loading-spinner loading-lg" aria-hidden="true"></div>
                <div className="text-sm font-semibold text-white font-bold">{message}</div>
            </div>
        </div>
    );
}
