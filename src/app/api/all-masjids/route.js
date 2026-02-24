import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

const UNIQUE_ID_TARGET = "id";

function extractTargets(err) {
    const raw = err?.meta?.target;
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") return [raw];
    return [];
}

async function createMasjidWithSequenceGuard(data) {
    try {
        return await prisma.allMasjid.create({ data });
    } catch (err) {
        const isIdConflict =
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002" &&
            extractTargets(err).some(
                (target) =>
                    target === UNIQUE_ID_TARGET ||
                    target?.toLowerCase().endsWith("_id_key")
            );

        if (!isIdConflict) {
            throw err;
        }

        try {
            await prisma.$executeRaw`
                SELECT setval(
                    pg_get_serial_sequence('all_masjid', 'id'),
                    COALESCE(MAX(id), 0)
                )
                FROM all_masjid;
            `;
        } catch (syncErr) {
            console.error("Failed to sync all_masjid id sequence", syncErr);
            throw err;
        }

        return prisma.allMasjid.create({ data });
    }
}

// POST: Create a new Masjid with jamat times
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            name = null,
            masjidName,
            colony,
            locality = null,
            fazar,
            zuhar,
            asar,
            maghrib,
            isha,
            taravih = null,
            juma,
            role = null,
            mobile = null,
            pasteMapUrl = null,
            city = 'Bilaspur',
            loginId = null,
            memberNames = [],
            mobileNumbers = [],
            password = 0
        } = body;

        const required = [
            { key: "masjidName", value: masjidName },
            { key: "colony", value: colony },
            { key: "fazar", value: fazar },
            { key: "zuhar", value: zuhar },
            { key: "asar", value: asar },
            { key: "maghrib", value: maghrib },
            { key: "isha", value: isha },
            { key: "juma", value: juma },
        ];

        const missing = required.filter((f) => !f.value).map((f) => f.key);
        if (missing.length) {
            return NextResponse.json(
                { error: "Missing required fields", missing },
                { status: 400 }
            );
        }

        const created = await createMasjidWithSequenceGuard({
            masjidName,
            colony,
            locality,
            fazar,
            zuhar,
            asar,
            maghrib,
            isha,
            taravih,
            juma,
            name,
            role,
            mobile,
            pasteMapUrl,
            city,
            loginId,
            memberNames,
            mobileNumbers,
            password
        });

        return NextResponse.json(
            { message: "Masjid created", data: created },
            { status: 201 }
        );
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            const targetList = extractTargets(err);
            const target = targetList.length
                ? targetList.join(", ")
                : UNIQUE_ID_TARGET;
            return NextResponse.json(
                { error: `Unique constraint violation on ${target}` },
                { status: 409 }
            );
        }

        console.error("POST /api/all-masjids error", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH: Update an existing Masjid
export async function PATCH(request) {
    try {
        const body = await request.json();
        const {
            id,
            name,
            masjidName,
            colony,
            locality,
            fazar,
            zuhar,
            asar,
            maghrib,
            isha,
            taravih,
            juma,
            role,
            mobile,
            pasteMapUrl,
            city = 'Bilaspur',
            loginId,
            memberNames,
            mobileNumbers,
            password
        } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Missing required field: id" },
                { status: 400 }
            );
        }

        // Check if masjid exists
        const existingMasjid = await prisma.allMasjid.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingMasjid) {
            return NextResponse.json(
                { error: "Masjid not found" },
                { status: 404 }
            );
        }

        // Build update data object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (masjidName !== undefined) updateData.masjidName = masjidName;
        if (colony !== undefined) updateData.colony = colony;
        if (locality !== undefined) updateData.locality = locality;
        if (fazar !== undefined) updateData.fazar = fazar;
        if (zuhar !== undefined) updateData.zuhar = zuhar;
        if (asar !== undefined) updateData.asar = asar;
        if (maghrib !== undefined) updateData.maghrib = maghrib;
        if (isha !== undefined) updateData.isha = isha;
        if (taravih !== undefined) updateData.taravih = taravih;
        if (juma !== undefined) updateData.juma = juma;
        if (role !== undefined) updateData.role = role;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (pasteMapUrl !== undefined) updateData.pasteMapUrl = pasteMapUrl;
        if (city !== undefined) updateData.city = city;
        if (loginId !== undefined) updateData.loginId = loginId;
        if (memberNames !== undefined) updateData.memberNames = memberNames;
        if (mobileNumbers !== undefined) updateData.mobileNumbers = mobileNumbers;
        if (password !== undefined) updateData.password = password;

        const updated = await prisma.allMasjid.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(
            { message: "Masjid updated successfully", data: updated },
            { status: 200 }
        );
    } catch (err) {
        console.error("PATCH /api/all-masjids error", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET: List all masjids (basic filters by colony / masjidName optional) OR get single masjid by id
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const colony = searchParams.get("colony");
        const masjid = searchParams.get("masjid");

        // If id is provided, fetch single masjid
        if (id) {
            const singleMasjid = await prisma.allMasjid.findUnique({
                where: { id: parseInt(id) },
            });

            if (!singleMasjid) {
                return NextResponse.json(
                    { error: "Masjid not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(singleMasjid, { status: 200 });
        }

        // Otherwise, list all masjids with optional filters
        const where = {};
        if (colony) where.colony = { contains: colony, mode: "insensitive" };
        if (masjid)
            where.masjidName = { contains: masjid, mode: "insensitive" };

        let data;
        try {
            data = await prisma.allMasjid.findMany({
                where,
                orderBy: { id: "desc" },
            });
        } catch (err) {
            // Handle missing column / schema drift gracefully
            if (err?.code === "P2022") {
                console.error("Prisma schema mismatch (missing column):", err.meta || err);
                return NextResponse.json(
                    {
                        error:
                            "Database schema mismatch: some columns are missing. Please run migrations or sync the database.",
                    },
                    { status: 500 }
                );
            }
            throw err;
        }

        return NextResponse.json({ data, count: data.length });
    } catch (err) {
        console.error("GET /api/all-masjids error", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
