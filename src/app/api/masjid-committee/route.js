import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

function extractTargets(err) {
    const raw = err?.meta?.target;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") return [raw];
    return [];
}

// Create
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            masjidId,
            masjidName,
            fullAddress,
            city,
            mutwalliName,
            committeeMembers = [],
            mobileNumbers = [],
            password,
            imaamName = null,
            committeeImages = [],
        } = body;

        const required = [
            { key: "masjidId", value: masjidId },
            { key: "masjidName", value: masjidName },
            { key: "fullAddress", value: fullAddress },
            { key: "city", value: city },
            { key: "mutwalliName", value: mutwalliName },
            { key: "committeeMembers", value: committeeMembers },
            { key: "mobileNumbers", value: mobileNumbers },
            { key: "password", value: password },
        ];

        const missing = required.filter((f) => f.value === undefined || f.value === null || (Array.isArray(f.value) && f.value.length === 0)).map((f) => f.key);
        if (missing.length) {
            return NextResponse.json({ error: "Missing required fields", missing }, { status: 400 });
        }

        // Verify referenced AllMasjid exists to satisfy foreign key constraint
        let targetMasjidId = parseInt(masjidId);
        if (Number.isNaN(targetMasjidId)) {
            return NextResponse.json({ error: "Invalid masjidId, must be a number" }, { status: 400 });
        }

        let existingMasjid = await prisma.allMasjid.findUnique({ where: { id: targetMasjidId } });
        // If referenced AllMasjid doesn't exist, create a minimal AllMasjid record
        // and use its id so the foreign key constraint is satisfied.
        if (!existingMasjid) {
            try {
                // Try to create the AllMasjid record using the provided id so
                // the committee keeps the same masjidId the admin entered.
                const createdMasjid = await prisma.allMasjid.create({
                    data: {
                        id: targetMasjidId,
                        masjidName: masjidName || `Masjid ${Date.now()}`,
                        colony: null,
                        locality: null,
                        fazar: null,
                        zuhar: null,
                        asar: null,
                        maghrib: null,
                        isha: null,
                        taravih: null,
                        juma: null,
                        name: null,
                        role: null,
                        mobile: (Array.isArray(mobileNumbers) && mobileNumbers.length) ? mobileNumbers[0] : null,
                        pasteMapUrl: null,
                        city: city || null,
                    },
                });
                existingMasjid = createdMasjid;
                // keep targetMasjidId as the provided id (createdMasjid.id === targetMasjidId)
            } catch (createErr) {
                console.error("Failed to create fallback AllMasjid record", createErr);
                return NextResponse.json({ error: "Failed to create linked Masjid record" }, { status: 500 });
            }
        }

        const created = await prisma.masjidCommittee.create({
            data: {
                masjidId: targetMasjidId,
                masjidName,
                fullAddress,
                city,
                mutwalliName,
                committeeMembers,
                mobileNumbers,
                password,
                imaamName,
                committeeImages,
            },
        });

        return NextResponse.json({ message: "Masjid committee created", data: created }, { status: 201 });
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            const targetList = extractTargets(err);
            const target = targetList.length ? targetList.join(", ") : "unique field";
            return NextResponse.json({ error: `Unique constraint violation on ${target}` }, { status: 409 });
        }
        console.error("POST /api/masjid-committee error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH (update)
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });

        const existing = await prisma.masjidCommittee.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        const updateData = {};
        const updatable = ["masjidId", "masjidName", "fullAddress", "city", "mutwalliName", "committeeMembers", "mobileNumbers", "password", "imaamName", "committeeImages"];
        updatable.forEach((k) => {
            if (body[k] !== undefined) updateData[k] = body[k];
        });

        if (updateData.masjidId) updateData.masjidId = parseInt(updateData.masjidId);

        const updated = await prisma.masjidCommittee.update({ where: { id: parseInt(id) }, data: updateData });
        return NextResponse.json({ message: "Updated", data: updated }, { status: 200 });
    } catch (err) {
        console.error("PATCH /api/masjid-committee error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request) {
    try {
        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });

        await prisma.masjidCommittee.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
    } catch (err) {
        console.error("DELETE /api/masjid-committee error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET: list or single by id or by masjidId
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const masjidId = searchParams.get("masjidId");

        if (id) {
            const single = await prisma.masjidCommittee.findUnique({ where: { id: parseInt(id) } });
            if (!single) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json(single, { status: 200 });
        }

        if (masjidId) {
            const single = await prisma.masjidCommittee.findUnique({ where: { masjidId: parseInt(masjidId) } });
            if (!single) return NextResponse.json({ error: "Not found" }, { status: 404 });
            return NextResponse.json(single, { status: 200 });
        }

        const data = await prisma.masjidCommittee.findMany({ orderBy: { id: "desc" } });
        return NextResponse.json({ data, count: data.length }, { status: 200 });
    } catch (err) {
        console.error("GET /api/masjid-committee error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
