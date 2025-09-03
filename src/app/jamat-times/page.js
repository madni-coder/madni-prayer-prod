"use client";
import React, { useState, useEffect } from "react";
import masjidList from "./list.json";

// Extract addresses and names from the JSON list
const locations = masjidList.map((m) => m.Address);
const masjids = masjidList.map((m) => m.name);

const jamatTimes = [
    { name: "Fajr", time: "05:25 AM", color: "border-blue-500" },
    { name: "Zuhr", time: "01:30 PM", color: "border-red-500" },
    { name: "Asar", time: "05:00 PM", color: "border-yellow-500" },
    { name: "Maghrib", time: "06:23 PM", color: "border-pink-500" },
    { name: "Isha", time: "08:30 PM", color: "border-indigo-500" },
    { name: "Juma Khutba", time: "01:30 PM", color: "border-green-500" },
];

function DigitalClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);
    const pad = (n) => n.toString().padStart(2, "0");
    let hours = time.getHours();
    const minutes = pad(time.getMinutes());
    const seconds = pad(time.getSeconds());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = pad(hours);

    return (
        <div className="flex flex-col items-center mb-4">
            <span className="mt-1 text-xl text-amber-100 tracking-widest">
                Current Time
            </span>
            <br />
            <div className="flex items-end gap-2">
                <span
                    className="text-4xl md:text-5xl font-mono font-extrabold text-primary bg-black/80 px-6 py-3 rounded-xl shadow-lg border-4 border-primary"
                    style={{
                        fontFamily: "'Orbitron', 'Fira Mono', monospace",
                        letterSpacing: "0.08em",
                        boxShadow: "0 4px 24px #0004, 0 1px 0 #fff2",
                    }}
                >
                    {hours}:{minutes}:{seconds}
                </span>
                <span className="text-xl md:text-xl font-bold text-primary ml-1 mb-2 select-none">
                    {ampm}
                </span>
            </div>
        </div>
    );
}

export default function JamatTimesPage() {
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedMasjid, setSelectedMasjid] = useState("");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200">
            {/* Responsive and sticky digital clock at the very top */}
            <div className="sticky top-0 left-0 w-full z-10 flex justify-center bg-base-200/80 backdrop-blur-sm py-2">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
                    <DigitalClock />
                </div>
            </div>
            <div className="w-full max-w-md mt-8">
                <div className="flex justify-start mb-8 ml-8">
                    <button
                        className="btn btn-outline btn-primary btn-xxl transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-content"
                        // onClick handler can be added here for actual auto-locate functionality
                    >
                        AUTO LOCATE
                    </button>
                </div>

                <div className="mb-6 ml-4 mr-4">
                    <select
                        className="select select-primary select-lg w-full"
                        value={selectedMasjid}
                        onChange={(e) => setSelectedMasjid(e.target.value)}
                    >
                        <option value=""> Select Masjid </option>
                        {masjids.map((masjid) => (
                            <option key={masjid} value={masjid}>
                                {masjid}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4 ml-4 mr-4">
                    <select
                        className="select select-primary select-lg w-full"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                        <option value=""> Select Location </option>
                        {locations.map((address) => (
                            <option key={address} value={address}>
                                {address}
                            </option>
                        ))}
                    </select>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-center">
                    Jamat time
                </h1>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-4">
                        {jamatTimes.map((prayer) => (
                            <div
                                key={prayer.name}
                                className={`flex justify-between items-center border-l-4 ${prayer.color} bg-base-200 rounded-lg px-4 py-3 mb-3 last:mb-0`}
                            >
                                <span className="font-semibold text-base">
                                    {prayer.name}
                                </span>
                                <span className="font-mono text-lg">
                                    {prayer.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
