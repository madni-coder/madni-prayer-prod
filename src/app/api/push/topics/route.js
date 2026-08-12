import { NextResponse } from "next/server";
import { updateTopicSubscriptions } from "../../../../../lib/push";

// POST /api/push/topics
// Body: { token: string, platform: "android" | "ios", subscribe?: string[], unsubscribe?: string[] }
// Proxies to Firebase Admin's topic subscribe/unsubscribe — the service
// account credential never leaves the server, so the client can only ever
// reach this through the token it already holds for its own device.
export async function POST(request) {
    try {
        const { token, platform, subscribe = [], unsubscribe = [] } = await request.json();

        if (!token || !["android", "ios"].includes(platform)) {
            return NextResponse.json(
                { error: "token and platform ('android' | 'ios') are required" },
                { status: 400 }
            );
        }
        if (subscribe.length === 0 && unsubscribe.length === 0) {
            return NextResponse.json({ subscribed: [], unsubscribed: [] });
        }

        const result = await updateTopicSubscriptions({ token, platform, subscribe, unsubscribe });
        return NextResponse.json(result);
    } catch (err) {
        console.error("/api/push/topics POST", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}
