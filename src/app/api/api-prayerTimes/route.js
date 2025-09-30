import { NextResponse } from "next/server";

// Default coordinates for Bilaspur, Chhattisgarh
const DEFAULT_COORDS = { lat: 22.0796, lon: 82.1391 };

// Helper: convert YYYY-MM-DD to unix timestamp (seconds)
function dateToTimestamp(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    return Math.floor(d.getTime() / 1000);
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // Accept either: date=YYYY-MM-DD OR lat & lon. If neither, use default Bilaspur coords and today's date.
        const date = searchParams.get("date");
        const latParam = searchParams.get("lat");
        const lonParam = searchParams.get("lon");

        const coords = {
            lat: latParam ? parseFloat(latParam) : DEFAULT_COORDS.lat,
            lon: lonParam ? parseFloat(lonParam) : DEFAULT_COORDS.lon,
        };

        let timestamp;
        if (date) {
            timestamp = dateToTimestamp(date);
            if (!timestamp) {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Invalid date format. Use YYYY-MM-DD.",
                    },
                    { status: 400 }
                );
            }
        } else {
            // use today's date (local) midnight
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, "0");
            const d = String(today.getDate()).padStart(2, "0");
            timestamp = dateToTimestamp(`${y}-${m}-${d}`);
        }

        // Use IslamicFinder public widget API to fetch prayer timings. Proxy the response.
        const apiUrl = `https://www.islamicfinder.org/prayer-widget/1275637/hanafi/6/0/18.0/18.0`;

        const res = await fetch(apiUrl);
        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json(
                { ok: false, error: "Upstream API error", details: text },
                { status: 502 }
            );
        }

        const html = await res.text();
        // Extract prayer times from HTML using regex
        // This is a simple example and may need adjustment based on actual HTML structure
        const timings = {};
        const regexMap = {
            Fajr: /Fajr<[^>]*>\s*<[^>]*>(\d{1,2}:\d{2}\s*[AP]M)/i,
            Sunrise:
                /(Sunrise|Shuruq)[^<]*<[^>]*>\s*<[^>]*>(\d{1,2}:\d{2}\s*[AP]M)/i,
            Dhuhr: /Dhuhr<[^>]*>\s*<[^>]*>(\d{1,2}:\d{2}\s*[AP]M)/i,
            Asr: /Asr<[^>]*>\s*<[^>]*>(\d{1,2}:\d{2}\s*[AP]M)/i,
            Maghrib: /Maghrib<[^>]*>\s*<[^>]*>(\d{1,2}:\d{2}\s*[AP]M)/i,
            Isha: /Isha<[^>]*>\s*<[^>]*>(\d{1,2}:\d{2}\s*[AP]M)/i,
        };
        for (const [key, regex] of Object.entries(regexMap)) {
            const match = html.match(regex);
            if (key === "Sunrise") {
                timings[key] = match ? match[2] : null;
            } else {
                timings[key] = match ? match[1] : null;
            }
        }

        const result = {
            ok: true,
            source: "islamicfinder.org",
            location: {
                name:
                    searchParams.get("location") ||
                    "Bilaspur, Chhattisgarh (default)",
                latitude: coords.lat,
                longitude: coords.lon,
            },
            date: date || null,
            timings,
            raw: null, // Do not include raw HTML in response
        };

        return NextResponse.json(result, { status: 200 });
    } catch (err) {
        console.error("GET /api/api-prayerTimes error", err);
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
