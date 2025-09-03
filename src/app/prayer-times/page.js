"use client";
import React, { useEffect, useState } from "react";
import { Bell, BellOff, MapPin, Calendar, Moon } from "lucide-react";

const prayerTimes = [
    {
        name: "Fajr",
        time: "04:29:23 AM",
        alert: true,
        color: "text-primary text-base md:text-md",
    },
    {
        name: "Sun Rise",
        time: "05:43:29 AM",
        alert: false,
        color: "text-secondary text-base md:text-md",
    },
    {
        name: "Dahwa-e-kubra",
        time: "11:23:48 AM",
        alert: false,
        color: "text-base-content/70 text-base md:text-md",
    },
    {
        name: "Zuhr",
        time: "12:00:26 PM",
        alert: true,
        color: "text-accent text-base md:text-md",
    },
    {
        name: "Asr (Hanafi)",
        time: "04:30:00 PM",
        alert: true,
        color: "text-warning text-base md:text-md",
    },
    {
        name: "Maghrib",
        time: "06:17:25 PM",
        alert: true,
        color: "text-success text-base md:text-md",
    },
    {
        name: "Isha (Hanafi)",
        time: "07:31:00 PM",
        alert: true,
        color: "text-info text-base md:text-md",
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
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-1 py-2 sm:px-2 sm:py-4 animate-fade-in bg-base-100">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-2 sm:mb-3">
                Prayer Times
            </h2>
            {/* Top Bar */}
            <div className="w-full max-w-2xl flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-0 mb-2">
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>12, Rabi-ul-Awwal, 1447</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Fri 05 September 2025</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
                    <span>GMT: 5.5, Height: 964ft</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Bilaspur, Chhattisgarh 495001</span>
                </div>
            </div>
            {/* Main Card */}
            <div className="relative glass-card p-2 sm:p-4 md:p-6 max-w-full sm:max-w-2xl w-full flex flex-col sm:flex-row gap-3 sm:gap-4 items-center bg-base-200 border border-base-300 shadow-md">
                {/* Circular Countdown */}
                <div className="flex flex-col items-center justify-center w-full sm:w-auto mb-2 sm:mb-0">
                    <div className="relative flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32">
                        <svg
                            className="absolute top-0 left-0"
                            width="80"
                            height="80"
                            viewBox="0 0 128 128"
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
                            <span className="text-warning font-semibold text-sm sm:text-base md:text-lg">
                                {prayerTimes[3].name}
                            </span>
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-base-content">
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
                            className={`flex items-center justify-between px-3 py-3 rounded-lg mb-3 bg-base-100 border-l-4 ${
                                prayer.name.startsWith("Fajr")
                                    ? "border-primary"
                                    : prayer.name.startsWith("Sun Rise")
                                    ? "border-secondary"
                                    : prayer.name.startsWith("Dahwa-e-kubra")
                                    ? "border-amber-500"
                                    : prayer.name.startsWith("Zuhr")
                                    ? "border-accent"
                                    : prayer.name.startsWith("Asr")
                                    ? "border-warning"
                                    : prayer.name.startsWith("Maghrib")
                                    ? "border-green-500"
                                    : prayer.name.startsWith("Isha")
                                    ? "border-blue-500"
                                    : "border-base-300"
                            } shadow-sm`}
                        >
                            <span
                                className={`font-semibold text-base md:text-lg flex-1 truncate ${prayer.color}`}
                            >
                                {prayer.name}
                            </span>
                            <span className="font-mono text-white md:text-lg text-base-content/90 ml-2 flex-shrink-0">
                                {prayer.time}
                            </span>
                            <span className="ml-2 flex-shrink-0">
                                {prayer.alert ? (
                                    <Bell
                                        className="w-5 h-5 text-warning"
                                        title="Azan alert on"
                                    />
                                ) : (
                                    <BellOff
                                        className="w-5 h-5 text-base-content/30"
                                        title="Azan alert off"
                                    />
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
