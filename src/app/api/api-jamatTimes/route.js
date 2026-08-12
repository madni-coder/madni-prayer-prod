import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { sendTopicPush, PUSH_TOPICS } from "../../../../lib/push";

const PRAYER_LABELS = {
    fazar: "Fajr",
    zuhar: "Zuhr",
    asar: "Asar",
    maghrib: "Maghrib",
    isha: "Isha",
    juma: "Juma",
};

// Notifies devices that saved this masjid, scoped to only the prayer(s)
// that actually changed. Awaited (but failure-safe) so serverless platforms
// like Vercel don't kill the request before the push finishes sending.
async function notifyJamatTimeChange(before, after) {
    if (!before || !after) return;
    const changed = Object.keys(PRAYER_LABELS).filter((key) => before[key] !== after[key]);
    if (changed.length === 0) return;

    const body = changed
        .map((key) => `${PRAYER_LABELS[key]} jamat time updated`)
        .join(", ");

    await sendTopicPush({
        topic: PUSH_TOPICS.masjid(after.id),
        title: after.masjidName,
        body,
        data: { type: "jamat_time_change", masjidId: String(after.id), path: "/jamat-times" },
    });
}

// PATCH: Update jamat times for an existing masjid
export async function PATCH(request) {
    try {
        const body = await request.json();
        const {
            id,
            masjidName,
            fazar,
            zuhar,
            asar,
            maghrib,
            isha,
            juma,
        } = body;

        // Must provide either id or masjidName to identify the masjid
        if (!id && !masjidName) {
            return NextResponse.json(
                { error: "Either id or masjidName is required to update" },
                { status: 400 }
            );
        }

        const whereClause = id ? { id: parseInt(id) } : { masjidName };

        // Build update data object with only provided fields
        const updateData = {};
        if (fazar !== undefined) updateData.fazar = fazar;
        if (zuhar !== undefined) updateData.zuhar = zuhar;
        if (asar !== undefined) updateData.asar = asar;
        if (maghrib !== undefined) updateData.maghrib = maghrib;
        if (isha !== undefined) updateData.isha = isha;
        if (juma !== undefined) updateData.juma = juma;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No jamat times provided to update" },
                { status: 400 }
            );
        }

        const before = await prisma.allMasjid.findUnique({ where: whereClause });

        const updated = await prisma.allMasjid.update({
            where: whereClause,
            data: updateData,
        });

        await notifyJamatTimeChange(before, updated);

        return NextResponse.json(
            { message: "Jamat times updated successfully", data: updated },
            { status: 200 }
        );
    } catch (err) {
        console.error("PATCH /api/api-jamatTimes error", err);

        if (err.code === "P2025") {
            return NextResponse.json(
                { error: "Masjid not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
