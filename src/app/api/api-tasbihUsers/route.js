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
        const tasbihCount = body.tasbihCount;
        // New variable: weeklyCounts stores the tasbih count for weekly tracking
        // If caller provides weeklyCounts use it, otherwise default to tasbihCount (number) or 0
        const weeklyCounts =
            typeof body.weeklyCounts === "number"
                ? body.weeklyCounts
                : typeof tasbihCount === "number"
                ? tasbihCount
                : 0;

        // Only validate mobile number if fullName and address are not provided
        if (!fullName && !address) {
            if (!mobileNumber || typeof mobileNumber !== "string") {
                return NextResponse.json(
                    {
                        ok: false,
                        error: "Mobile number is required and must be a string.",
                    },
                    { status: 400 }
                );
            }
        }

        // Validate all fields if fullName and address are provided
        const errors = [];
        if (fullName && (!fullName || typeof fullName !== "string"))
            errors.push("Full Name is required and must be a string.");
        if (address && (!address || typeof address !== "string"))
            errors.push("Address is required and must be a string.");
        if (errors.length) {
            return NextResponse.json({ ok: false, errors }, { status: 400 });
        }

        // Check if mobile number already exists
        const existingUser = await prisma.tasbihUser.findFirst({
            where: { mobileNumber },
        });

        // Get user count
        const count =
            typeof tasbihCount === "number"
                ? tasbihCount
                : await prisma.tasbihUser.count();

        let newItem;
        if (!existingUser && fullName && address && mobileNumber) {
            newItem = await prisma.tasbihUser.create({
                data: {
                    fullName,
                    address,
                    mobileNumber,
                    // keep existing `count` behavior (store tasbihCount there as before)
                    count: tasbihCount,
                    // additionally store weekly count in `weeklyCounts`
                    weeklyCounts: weeklyCounts,
                },
            });
        }
        if (!existingUser && !fullName && !address) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "NOT_REGISTERED",
                    message: "Its new user",
                    count: tasbihCount,
                },
                { status: 200 }
            );
        }

        // If user exists, increment their count
        if (existingUser) {
            const updatedUser = await prisma.tasbihUser.update({
                where: { id: existingUser.id },
                data: {
                    // preserve existing count increment behavior
                    count:
                        existingUser.count +
                        (typeof tasbihCount === "number" ? tasbihCount : 0),
                    // update weeklyCounts by adding the incoming weeklyCounts value
                    weeklyCounts:
                        existingUser.weeklyCounts +
                        (typeof weeklyCounts === "number" ? weeklyCounts : 0),
                },
            });
            return NextResponse.json(
                {
                    ok: true,
                    error: "REGISTERED_USER",
                    message:
                        "You are already registered. Durood count incremented.",
                    data: updatedUser,
                },
                { status: 200 }
            );
        }

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
        const count = await prisma.tasbihUser.count();
        const filtered = users.map((u) => ({
            "Full Name": u.fullName,
            Address: u.address,
            "mobile number": u.mobileNumber,
            // Life time counts
            "Tasbih Counts": u.count,
            // Weekly counts (note: key is lowercase to match admin UI expectation)
            "weekly counts": u.weeklyCounts,
        }));
        return NextResponse.json({ ok: true, data: filtered }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
