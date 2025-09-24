import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// POST: Create a new Masjid with jamat times
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            masjidName,
            colony,
            locality = null,
            fazar,
            zuhar,
            asar,
            maghrib,
            isha,
            juma,
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

        const created = await prisma.allMasjid.create({
            data: {
                masjidName,
                colony,
                locality,
                fazar,
                zuhar,
                asar,
                maghrib,
                isha,
                juma,
            },
        });

        return NextResponse.json(
            { message: "Masjid created", data: created },
            { status: 201 }
        );
    } catch (err) {
        console.error("POST /api/all-masjids error", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET: List all masjids (basic filters by colony / masjidName optional)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const colony = searchParams.get("colony");
        const masjid = searchParams.get("masjid");

        const where = {};
        if (colony) where.colony = { contains: colony, mode: "insensitive" };
        if (masjid)
            where.masjidName = { contains: masjid, mode: "insensitive" };

        const data = await prisma.allMasjid.findMany({
            where,
            orderBy: { id: "desc" },
        });

        return NextResponse.json({ data, count: data.length });
    } catch (err) {
        console.error("GET /api/all-masjids error", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

