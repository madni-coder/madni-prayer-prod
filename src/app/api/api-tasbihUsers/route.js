export async function DELETE(req) {
    try {
        const body = await req.json();
        const mobileNumber =
            body["mobile number"] ?? body.mobileNumber ?? body.mobile;
        if (!mobileNumber || typeof mobileNumber !== "string") {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Mobile number is required and must be a string.",
                },
                { status: 400 }
            );
        }
        const existingUser = await prisma.tasbihUser.findFirst({
            where: { mobileNumber },
        });
        if (!existingUser) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "User not found.",
                },
                { status: 404 }
            );
        }
        const updatedUser = await prisma.tasbihUser.update({
            where: { id: existingUser.id },
            data: { weeklyCounts: 0 },
        });
        // Convert BigInt fields to Number before returning
        const safeUser = {
            ...updatedUser,
            count:
                typeof updatedUser.count === "bigint"
                    ? Number(updatedUser.count)
                    : updatedUser.count,
            weeklyCounts:
                typeof updatedUser.weeklyCounts === "bigint"
                    ? Number(updatedUser.weeklyCounts)
                    : updatedUser.weeklyCounts,
        };
        return NextResponse.json(
            {
                ok: true,
                message: "Weekly counts erased.",
                data: safeUser,
            },
            { status: 200 }
        );
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
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
            // Convert BigInt to Number if needed
            const prevCount =
                typeof existingUser.count === "bigint"
                    ? Number(existingUser.count)
                    : existingUser.count;
            const prevWeeklyCounts =
                typeof existingUser.weeklyCounts === "bigint"
                    ? Number(existingUser.weeklyCounts)
                    : existingUser.weeklyCounts;
            const updatedUser = await prisma.tasbihUser.update({
                where: { id: existingUser.id },
                data: {
                    count:
                        prevCount +
                        (typeof tasbihCount === "number" ? tasbihCount : 0),
                    weeklyCounts:
                        prevWeeklyCounts +
                        (typeof weeklyCounts === "number" ? weeklyCounts : 0),
                },
            });
            // Convert BigInt fields to Number before returning
            const safeUser = {
                ...updatedUser,
                count:
                    typeof updatedUser.count === "bigint"
                        ? Number(updatedUser.count)
                        : updatedUser.count,
                weeklyCounts:
                    typeof updatedUser.weeklyCounts === "bigint"
                        ? Number(updatedUser.weeklyCounts)
                        : updatedUser.weeklyCounts,
            };
            return NextResponse.json(
                {
                    ok: true,
                    error: "REGISTERED_USER",
                    message:
                        "You are already registered. Durood count incremented.",
                    data: safeUser,
                },
                { status: 200 }
            );
        }

        // Convert BigInt fields to Number before returning
        const safeNewItem = newItem
            ? {
                  ...newItem,
                  count:
                      typeof newItem.count === "bigint"
                          ? Number(newItem.count)
                          : newItem.count,
                  weeklyCounts:
                      typeof newItem.weeklyCounts === "bigint"
                          ? Number(newItem.weeklyCounts)
                          : newItem.weeklyCounts,
              }
            : null;
        return NextResponse.json(
            { ok: true, data: safeNewItem },
            { status: 201 }
        );
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
            "Tasbih Counts":
                typeof u.count === "bigint" ? Number(u.count) : u.count,
            // Weekly counts (note: key is lowercase to match admin UI expectation)
            "weekly counts":
                typeof u.weeklyCounts === "bigint"
                    ? Number(u.weeklyCounts)
                    : u.weeklyCounts,
        }));
        return NextResponse.json({ ok: true, data: filtered }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
