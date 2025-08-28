"use client";
import React, { useEffect, useState } from "react";
import { Bell, BellOff, MapPin, Calendar, Moon } from "lucide-react";

const prayerTimes = [
    { name: "Fajr", time: "04:29:23 AM", alert: true, color: "text-primary" },
    {
        name: "Sun Rise",
        time: "05:43:29 AM",
        alert: false,
        color: "text-secondary",
    },
    {
        name: "Dahwa-e-kubra",
        time: "11:27:48 AM",
        alert: false,
        color: "text-base-content/70",
    },
    { name: "Zuhr", time: "12:04:59 PM", alert: true, color: "text-accent" },
    {
        name: "Asr (Hanafi)",
        time: "04:35:58 PM",
        alert: true,
        color: "text-warning",
    },
    {
        name: "Maghrib",
        time: "06:26:12 PM",
        alert: true,
        color: "text-success",
    },
    {
        name: "Isha (Hanafi)",
        time: "07:40:09 PM",
        alert: true,
        color: "text-info",
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
            {/* Top Bar */}
            <div className="w-full max-w-2xl flex flex-col gap-1 sm:gap-0 sm:flex-row flex-wrap items-start sm:items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60">
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>3, Rabi-ul-Awwal, 1447</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Wed 27 August 2025</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60">
                    <span>GMT: 5.5, Height: 964ft</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/60">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Raipur, Chhattisgarh 492001</span>
                </div>
            </div>
            {/* Main Card */}
            <div className="relative glass-card p-2 sm:p-4 md:p-6 max-w-full sm:max-w-2xl w-full flex flex-col sm:flex-row gap-2 sm:gap-4 items-center bg-base-200 border border-base-300 shadow-md">
                {/* Circular Countdown */}
                <div className="flex flex-col items-center justify-center w-full sm:w-auto">
                    <div className="relative flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32">
                        <svg
                            className="absolute top-0 left-0"
                            width="96"
                            height="96"
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
                            <span className="text-warning font-semibold text-base sm:text-lg">
                                {prayerTimes[3].name}
                            </span>
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-base-content">
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
                            className={`flex items-center justify-between px-2 sm:px-3 py-2 rounded-lg mb-2 bg-base-100 border-l-4 ${
                                prayer.name.startsWith("Fajr")
                                    ? "border-primary"
                                    : prayer.name.startsWith("Zuhr")
                                    ? "border-accent"
                                    : prayer.name.startsWith("Asr")
                                    ? "border-warning"
                                    : prayer.name.startsWith("Maghrib")
                                    ? "border-success"
                                    : prayer.name.startsWith("Isha")
                                    ? "border-info"
                                    : "border-base-300"
                            } shadow-sm`}
                        >
                            <span
                                className={`font-semibold text-sm sm:text-base ${prayer.color}`}
                            >
                                {prayer.name}
                            </span>
                            <span className="font-mono text-xs sm:text-base text-base-content/80">
                                {prayer.time}
                            </span>
                            <span>
                                {prayer.alert ? (
                                    <Bell
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-warning"
                                        title="Azan alert on"
                                    />
                                ) : (
                                    <BellOff
                                        className="w-4 h-4 sm:w-5 sm:h-5 text-base-content/30"
                                        title="Azan alert off"
                                    />
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {/* Coming soon note */}
            <p className="text-xs text-base-content/60 mt-2 text-center">
                (Auto-location, Azan alerts, and masjid list coming soon)
            </p>
        </section>
    );
}
