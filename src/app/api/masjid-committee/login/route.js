import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();
        const { masjidId, password } = body;

        if (!masjidId || !password) {
            return NextResponse.json({ error: "masjidId and password required" }, { status: 400 });
        }

        const record = await prisma.allMasjid.findUnique({ where: { loginId: parseInt(masjidId) } });
        if (!record) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (record.password === parseInt(password)) {
            const { password: _pw, ...rest } = record;
            return NextResponse.json({ authenticated: true, data: rest }, { status: 200 });
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (err) {
        console.error("POST /api/masjid-committee/login error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
