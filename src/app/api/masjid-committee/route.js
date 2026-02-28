import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const masjidId = searchParams.get("masjidId");

        if (!masjidId) {
            const records = await prisma.allMasjid.findMany();
            const data = records.map(record => {
                const { password, ...rest } = record;
                return rest;
            });
            return NextResponse.json({ data }, { status: 200 });
        }

        // The frontend passes 'masjidId' as parameter, but it actually represents the loginId
        const record = await prisma.allMasjid.findUnique({
            where: { loginId: parseInt(masjidId) },
        });

        if (!record) {
            return NextResponse.json({ error: "Masjid not found" }, { status: 404 });
        }

        const { password, ...rest } = record;
        return NextResponse.json({ data: rest }, { status: 200 });
    } catch (error) {
        console.error("GET /api/masjid-committee error", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
