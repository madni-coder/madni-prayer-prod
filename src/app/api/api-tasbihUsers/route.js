import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
    try {
        const body = await req.json();

        const fullName = body["Full Name"] ?? body.fullName ?? body.fullname;
        const address = body.Address ?? body.address;
        const mobileNumber =
            body["mobile number"] ?? body.mobileNumber ?? body.mobile;

        const errors = [];
        if (!fullName || typeof fullName !== "string")
            errors.push("Full Name is required and must be a string.");
        if (!address || typeof address !== "string")
            errors.push("Address is required and must be a string.");
        if (!mobileNumber || typeof mobileNumber !== "string")
            errors.push("mobile number is required and must be a string.");

        if (errors.length) {
            return NextResponse.json({ ok: false, errors }, { status: 400 });
        }

        // Save to database
        const newItem = await prisma.tasbihUser.create({
            data: {
                fullName,
                address,
                mobileNumber,
            },
        });

        return NextResponse.json({ ok: true, data: newItem }, { status: 201 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Fetch from database
        const users = await prisma.tasbihUser.findMany();
        const filtered = users.map((u) => ({
            "Full Name": u.fullName,
            Address: u.address,
            "mobile number": u.mobileNumber,
        }));
        return NextResponse.json({ ok: true, data: filtered }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
