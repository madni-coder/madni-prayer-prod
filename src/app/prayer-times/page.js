"use client";
import React, { useEffect, useState } from "react";
import { Bell, BellOff, MapPin, Calendar, Moon } from "lucide-react";

const prayerTimes = [
    { name: "Fajr", time: "04:29:23 AM", alert: true, color: "text-blue-400" },
    {
        name: "Sun Rise",
        time: "05:43:29 AM",
        alert: false,
        color: "text-pink-400",
    },
    {
        name: "Dahwa-e-kubra",
        time: "11:27:48 AM",
        alert: false,
        color: "text-gray-400",
    },
    { name: "Zuhr", time: "12:04:59 PM", alert: true, color: "text-red-400" },
    {
        name: "Asr (Hanafi)",
        time: "04:35:58 PM",
        alert: true,
        color: "text-yellow-400",
    },
    {
        name: "Maghrib",
        time: "06:26:12 PM",
        alert: true,
        color: "text-purple-400",
    },
    {
        name: "Isha (Hanafi)",
        time: "07:40:09 PM",
        alert: true,
        color: "text-blue-900",
    },
];

export default function PrayerTimes() {
    // Real-time clock state
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time as HH:MM:SS AM/PM
    const formatTime = (date) =>
        date
            .toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            })
            .replace(/^0/, "");

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-2 py-4 animate-fade-in bg-green/70 light:bg-[#f3f4f6]/80">
            {/* Top Bar */}
            <div className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Moon className="w-5 h-5" />
                    <span>3, Rabi-ul-Awwal, 1447</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-5 h-5" />
                    <span>Wed 27 August 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>GMT: 5.5, Height: 964ft</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-5 h-5" />
                    <span>Raipur, Chhattisgarh 492001</span>
                </div>
            </div>
            {/* Main Card */}
            <div className="relative glass-card p-4 md:p-6 max-w-2xl w-full flex flex-col md:flex-row gap-4 items-center bg-white/90 dark:bg-[#f9fafb] border border-gray-200 shadow-md">
                {/* Circular Countdown */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center w-32 h-32">
                        <svg
                            className="absolute top-0 left-0"
                            width="128"
                            height="128"
                        >
                            <circle
                                cx="64"
                                cy="64"
                                r="60"
                                stroke="#fbbf24"
                                strokeWidth="5"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 60}
                                strokeDashoffset={2 * Math.PI * 60 * 0.7}
                                className="transition-all"
                                style={{ opacity: 0.5 }}
                            />
                        </svg>
                        <div className="flex flex-col items-center justify-center z-10">
                            <span className="text-yellow-500 font-semibold text-lg">
                                {prayerTimes[3].name}
                            </span>
                            <span className="text-2xl md:text-3xl font-bold text-white">
                                {formatTime(now)}
                            </span>
                        </div>
                    </div>
                </div>
                {/* Prayer Times List */}
                <div className="flex-1 w-full">
                    {prayerTimes.map((prayer) => (
                        <div
                            key={prayer.name}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg mb-2 bg-white/80 light:bg-[#f3f4f6] border-l-4 ${
                                prayer.name.startsWith("Fajr")
                                    ? "border-blue-300"
                                    : prayer.name.startsWith("Zuhr")
                                    ? "border-red-300"
                                    : prayer.name.startsWith("Asr")
                                    ? "border-yellow-300"
                                    : prayer.name.startsWith("Maghrib")
                                    ? "border-purple-200"
                                    : prayer.name.startsWith("Isha")
                                    ? "border-blue-200"
                                    : "border-gray-200"
                            } shadow-sm`}
                        >
                            <span className={`font-semibold ${prayer.color}`}>
                                {prayer.name}
                            </span>
                            <span className="font-mono text-gray-600">
                                {prayer.time}
                            </span>
                            <span>
                                {prayer.alert ? (
                                    <Bell
                                        className="w-5 h-5 text-yellow-400"
                                        title="Azan alert on"
                                    />
                                ) : (
                                    <BellOff
                                        className="w-5 h-5 text-gray-300"
                                        title="Azan alert off"
                                    />
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {/* Coming soon note */}
            <p className="text-xs text-gray-400 mt-2">
                (Auto-location, Azan alerts, and masjid list coming soon)
            </p>
        </section>
    );
}
