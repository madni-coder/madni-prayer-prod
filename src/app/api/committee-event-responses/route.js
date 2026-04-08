import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/committee-event-responses
 * Body (JSON): { eventId, masjidLoginId, masjidName, vote, comment }
 * Upserts: one response per masjid per event.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { eventId, masjidLoginId, masjidName, vote, comment } = body;

        if (!eventId || !masjidLoginId || !vote) {
            return NextResponse.json(
                { error: "eventId, masjidLoginId, and vote are required" },
                { status: 400 }
            );
        }

        const response = await prisma.committeeEventResponse.upsert({
            where: { eventId_masjidLoginId: { eventId, masjidLoginId: Number(masjidLoginId) } },
            update: { vote, comment: comment || null, masjidName: masjidName || "" },
            create: {
                eventId,
                masjidLoginId: Number(masjidLoginId),
                masjidName: masjidName || "",
                vote,
                comment: comment || null,
            },
        });

        return NextResponse.json({ success: true, response });
    } catch (err) {
        console.error("/api/committee-event-responses POST", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}

/**
 * GET /api/committee-event-responses
 *   ?eventId=<uuid>              → all responses for that event (admin view)
 *   ?masjidLoginId=<int>         → all responses by that masjid  (masjid view)
 *   ?masjidLoginId=<int>&eventId=<uuid> → specific masjid + event
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const masjidLoginId = searchParams.get("masjidLoginId");
        const eventId       = searchParams.get("eventId");

        if (!masjidLoginId && !eventId) {
            return NextResponse.json(
                { error: "Provide at least one of: eventId, masjidLoginId" },
                { status: 400 }
            );
        }

        const where = {};
        if (masjidLoginId) where.masjidLoginId = Number(masjidLoginId);
        if (eventId)       where.eventId = eventId;

        const responses = await prisma.committeeEventResponse.findMany({
            where,
            include: {
                event: { select: { id: true, title: true, description: true, createdAt: true } },
            },
            orderBy: { submittedAt: "desc" },
        });

        return NextResponse.json({ responses });
    } catch (err) {
        console.error("/api/committee-event-responses GET", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}
