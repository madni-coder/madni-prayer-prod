"use client";
import React, { useEffect, useState } from "react";
import { Bell, BellOff, Calendar, Moon } from "lucide-react";
import { FaAngleLeft, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useRouter } from "next/navigation";

const initialPrayerTimes = [
    {
        name: "Fajr",
        displayName: "",
        time: "—",
        alert: true,
        color: "text-primary text-base md:text-md",
    },
    {
        name: "Sun Rise",
        displayName: "",
        time: "—",
        alert: false,
        color: "text-secondary text-base md:text-md",
    },
    {
        name: "Zuhr",
        displayName: "",
        time: "—",
        alert: true,
        color: "text-accent text-base md:text-md",
    },
    {
        name: "Asr",
        displayName: "",
        time: "—",
        alert: true,
        color: "text-warning text-base md:text-md",
    },
    {
        name: "Maghrib",
        displayName: "",
        time: "—",
        alert: true,
        color: "text-success text-base md:text-md",
    },
    {
        name: "Isha",
        displayName: "",
        time: "—",
        alert: true,
        color: "text-info text-base md:text-md",
    },
];

export default function PrayerTimesPage() {
    const router = useRouter();
    // Real-time clock state
    const [now, setNow] = useState(new Date());
    const [prayerTimes, setPrayerTimes] = React.useState(initialPrayerTimes);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState("");
    // Date objects for each prayer time (for countdown calculations)
    const [prayerDateTimes, setPrayerDateTimes] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(null);
    const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Parse a prayer time string like "04:39" or "4:39 PM" or "04:39 (IST)" into a Date object for referenceDate
    const parseTimeToDate = (timeStr, referenceDate) => {
        if (!timeStr || timeStr === "—") return null;
        // remove parenthesis and trailing text
        const cleaned = timeStr.replace(/\(.*?\)/, "").trim();
        const m = cleaned.match(/(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?/);
        if (!m) return null;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const ampm = m[3];

        const d = new Date(referenceDate);
        d.setSeconds(0, 0);
        if (ampm) {
            const isPm = /p/i.test(ampm);
            if (hh === 12) hh = isPm ? 12 : 0;
            else if (isPm) hh += 12;
        }
        d.setHours(hh, mm, 0, 0);
        return d;
    };

    // Build Date objects for each prayer time based on today
    useEffect(() => {
        if (!prayerTimes || prayerTimes.length === 0) return;
        const today = new Date();
        const dates = prayerTimes.map((p) => parseTimeToDate(p.time, today));

        // If any next prayer occurs earlier than previous, assume it is for the next day (handles Isha->Fajr)
        for (let i = 1; i < dates.length; i++) {
            if (dates[i] && dates[i - 1] && dates[i] < dates[i - 1]) {
                // add a day to this and subsequent dates until order is increasing
                for (let j = i; j < dates.length; j++) {
                    if (dates[j])
                        dates[j] = new Date(
                            dates[j].getTime() + 24 * 60 * 60 * 1000
                        );
                }
                break;
            }
        }

        // Ensure that if first prayer (Fajr) is logically after last (Isha), shift it to next day for correct next calculation
        if (
            dates[0] &&
            dates[dates.length - 1] &&
            dates[0] <= dates[dates.length - 1]
        ) {
            dates[0] = new Date(dates[0].getTime() + 24 * 60 * 60 * 1000);
        }

        setPrayerDateTimes(dates);
    }, [prayerTimes]);

    // Compute current prayer and seconds left until next prayer whenever 'now' or prayerDateTimes changes
    useEffect(() => {
        if (!prayerDateTimes || prayerDateTimes.length === 0) return;

        const nowMs = now.getTime();
        // Find index i such that prayerDateTimes[i] <= now < prayerDateTimes[i+1]
        let idx = -1;
        for (let i = 0; i < prayerDateTimes.length; i++) {
            const start = prayerDateTimes[i];
            if (!start) continue;
            const next = prayerDateTimes[(i + 1) % prayerDateTimes.length];
            let nextDate = next;
            if (
                i === prayerDateTimes.length - 1 &&
                nextDate &&
                nextDate <= start
            ) {
                // next is on next day
                nextDate = new Date(nextDate.getTime() + 24 * 60 * 60 * 1000);
            }
            if (
                start &&
                nowMs >= start.getTime() &&
                nextDate &&
                nowMs < nextDate.getTime()
            ) {
                idx = i;
                const left = Math.max(
                    0,
                    Math.floor((nextDate.getTime() - nowMs) / 1000)
                );
                setCurrentIdx(i);
                setTimeLeftSeconds(left);
                return;
            }
        }

        // if not found, determine next upcoming prayer
        let upcomingIdx = -1;
        for (let i = 0; i < prayerDateTimes.length; i++) {
            const dt = prayerDateTimes[i];
            if (!dt) continue;
            if (dt.getTime() > nowMs) {
                upcomingIdx = i;
                break;
            }
        }
        if (upcomingIdx === -1) {
            // next is first prayer on next day
            const first = prayerDateTimes[0];
            if (first) {
                const left = Math.max(
                    0,
                    Math.floor(
                        (first.getTime() + 24 * 60 * 60 * 1000 - nowMs) / 1000
                    )
                );
                setCurrentIdx(prayerDateTimes.length - 1);
                setTimeLeftSeconds(left);
            }
        } else {
            const left = Math.max(
                0,
                Math.floor(
                    (prayerDateTimes[upcomingIdx].getTime() - nowMs) / 1000
                )
            );
            setCurrentIdx(
                (upcomingIdx - 1 + prayerDateTimes.length) %
                    prayerDateTimes.length
            );
            setTimeLeftSeconds(left);
        }
    }, [now, prayerDateTimes]);

    const formatDuration = (secs) => {
        if (secs == null) return "";
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = Math.floor(secs % 60);
        if (h > 0)
            return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(
                2,
                "0"
            )}`;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    useEffect(() => {
        const fetchPrayerTimesAndSetState = async () => {
            try {
                const today = new Date();
                const y = today.getFullYear();
                const m = String(today.getMonth() + 1).padStart(2, "0");
                const d = String(today.getDate()).padStart(2, "0");
                const dateStr = `${y}-${m}-${d}`;

                const res = await fetch(`/api/api-prayerTimes?date=${dateStr}`);
                const json = await res.json();

                if (!res.ok) {
                    console.error("Failed to fetch prayer times:", json);
                    return;
                }

                // try to extract a sensible location name from the API response
                const loc =
                    json?.location?.name ||
                    json?.meta?.timezone ||
                    (json?.data &&
                        json.data.location &&
                        json.data.location.name) ||
                    json?.city ||
                    json?.address ||
                    "";
                setLocationName(loc);

                const timings = json.timings || {};

                // helper to find the best matching timing key for each displayed prayer
                const findTimingKey = (displayName) => {
                    const tokensMap = {
                        Fajr: ["fajr"],
                        "Sun Rise": ["sunrise", "sun rise", "sun"],
                        Zuhr: ["dhuhr", "zuhr", "zuhur"],
                        Asr: ["asr"],
                        Maghrib: ["maghrib"],
                        Isha: ["isha", "isya"],
                    };

                    const candidates = Object.keys(timings || {});
                    const tokens = tokensMap[displayName] || [
                        displayName.toLowerCase(),
                    ];

                    for (const token of tokens) {
                        const found = candidates.find((k) =>
                            k.toLowerCase().includes(token)
                        );
                        if (found) return found;
                    }

                    // fallback: try an exact key match ignoring case
                    const exact = candidates.find(
                        (k) => k.toLowerCase() === displayName.toLowerCase()
                    );
                    return exact || null;
                };

                const cleaned = (val) =>
                    typeof val === "string"
                        ? val.replace(/\s*\(.*?\)/, "").trim()
                        : val;

                setPrayerTimes((prev) =>
                    prev.map((p) => {
                        const key = findTimingKey(p.name);
                        const apiVal = key ? cleaned(timings[key]) : null;
                        return {
                            ...p,
                            time: apiVal || p.time,
                            // only show a displayName once we have an API value
                            displayName: apiVal ? p.name : "",
                        };
                    })
                );
                setLoading(false);
            } catch (err) {
                console.error("Error fetching prayer times:", err);
            }
        };

        fetchPrayerTimesAndSetState();
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
        <div
            className="w-full min-h-screen flex flex-col items-center justify-start bg-base-200"
            style={{ paddingTop: 0, marginTop: 0 }}
        >
            <button
                className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start", marginTop: 0, paddingTop: 0 }}
            >
                <FaAngleLeft /> Back
            </button>
            <section
                className="flex flex-col items-center justify-start w-full px-0 py-0 sm:px-0 sm:py-0 animate-fade-in bg-base-100"
                style={{ marginTop: 0, paddingTop: 0 }}
            >
                <h2
                    className="text-lg sm:text-2xl md:text-3xl font-bold text-primary mb-0 sm:mb-0"
                    style={{ marginTop: 0, paddingTop: 0 }}
                >
                    Prayer Times
                </h2>
                {/* Top Bar */}
                <div className="w-full max-w-2xl flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-0 mb-0">
                    {/* Hijri date removed as requested */}
                    <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-sm text-white">
                        <Calendar className="w-5 h-5 sm:w-5 sm:h-5" />
                        <span>
                            {now.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-sm text-white">
                        <FaClock className="w-4 h-4 mr-1" />
                        <span>Time: {formatTime(now)}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-white">
                        <FaMapMarkerAlt className="w-4 h-4" />
                        <span>{locationName || "Unknown location"}</span>
                    </div>
                </div>
                {/* Main Card */}
                <div className="relative glass-card p-2 sm:p-4 md:p-6 max-w-full sm:max-w-2xl w-full flex flex-col md:flex-row gap-3 sm:gap-4 items-center md:items-center bg-base-200 border border-base-300 shadow-md overflow-visible md:pl-16 lg:pl-20">
                    {/* Circular Countdown */}
                    <div className="flex flex-col items-center justify-center w-full md:w-auto mb-2 md:mb-0 shrink-0 md:mr-4 lg:mr-6">
                        <div
                            className="relative flex items-center justify-center w-[140px] sm:w-[110px] md:w-[140px] lg:w-[160px] aspect-square"
                            style={{ minWidth: "100px", minHeight: "100px" }}
                        >
                            <svg
                                className="absolute top-0 left-0 w-full h-full"
                                viewBox="0 0 180 180"
                                style={{ display: "block" }}
                            >
                                {(() => {
                                    const circumference = 2 * Math.PI * 80; // radius 80
                                    const idx = currentIdx;
                                    const start = prayerDateTimes[idx];
                                    let next =
                                        prayerDateTimes[
                                            (idx + 1) % prayerDateTimes.length
                                        ];
                                    if (next && start && next <= start) {
                                        next = new Date(
                                            next.getTime() + 24 * 60 * 60 * 1000
                                        );
                                    }
                                    const duration =
                                        start && next
                                            ? Math.max(
                                                  1,
                                                  Math.floor(
                                                      (next.getTime() -
                                                          start.getTime()) /
                                                          1000
                                                  )
                                              )
                                            : null;
                                    const progress =
                                        duration && timeLeftSeconds != null
                                            ? Math.max(
                                                  0,
                                                  Math.min(
                                                      1,
                                                      1 -
                                                          timeLeftSeconds /
                                                              duration
                                                  )
                                              )
                                            : 0;
                                    const offset =
                                        circumference * (1 - progress);

                                    return (
                                        <>
                                            {/* white full background circle */}
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r="80"
                                                stroke="#ffffff"
                                                strokeWidth="7"
                                                fill="none"
                                                style={{ opacity: 1 }}
                                            />
                                            {/* yellow progress arc */}
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r="80"
                                                stroke="#fbbf24"
                                                strokeWidth="7"
                                                fill="none"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={offset}
                                                strokeLinecap="round"
                                                className="transition-all"
                                                style={{ opacity: 0.95 }}
                                            />
                                        </>
                                    );
                                })()}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full">
                                <span
                                    className="text-warning font-semibold text-sm sm:text-sm md:text-base lg:text-lg mb-1"
                                    style={{ lineHeight: 1 }}
                                >
                                    {prayerTimes[currentIdx]?.displayName ||
                                        "namaz time"}
                                </span>
                                <span
                                    className="text-lg sm:text-lg md:text-2xl lg:text-3xl font-bold text-base-content mt-1"
                                    style={{ lineHeight: 1.05 }}
                                >
                                    {timeLeftSeconds != null
                                        ? formatDuration(timeLeftSeconds)
                                        : "--:--"}
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
                                    {prayer.displayName || "—"}
                                </span>
                                <span className="font-mono text-white text-base md:text-lg text-base-content/90 ml-2 flex-shrink-0">
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
        </div>
    );
}
