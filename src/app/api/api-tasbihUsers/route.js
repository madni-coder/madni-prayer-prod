import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function DELETE(req) {
    try {
        const body = await req.json();
        const mobileNumber =
            body["mobile number"] ?? body.mobileNumber ?? body.mobile;
        const addWeeklyToCount = body.addWeeklyToCount === true;
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
        let updatedUser;
        if (addWeeklyToCount) {
            // Add weeklyCounts to count, then reset weeklyCounts
            const prevCount =
                typeof existingUser.count === "bigint"
                    ? Number(existingUser.count)
                    : existingUser.count;
            const prevWeeklyCounts =
                typeof existingUser.weeklyCounts === "bigint"
                    ? Number(existingUser.weeklyCounts)
                    : existingUser.weeklyCounts;
            updatedUser = await prisma.tasbihUser.update({
                where: { id: existingUser.id },
                data: {
                    count: prevCount + prevWeeklyCounts,
                    weeklyCounts: 0,
                },
            });
        } else {
            // Just reset weeklyCounts
            updatedUser = await prisma.tasbihUser.update({
                where: { id: existingUser.id },
                data: { weeklyCounts: 0 },
            });
        }
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
                message: addWeeklyToCount
                    ? "Weekly counts added to lifetime and erased."
                    : "Weekly counts erased.",
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

export async function POST(req) {
    try {
        console.log(req.headers.get('content-length'));
        const body = await req.json();

        const fullName = body["Full Name"] ?? body.fullName ?? body.fullname;
        const address = body.Address ?? body.address;
        // Accept email as an identifier too. If email is provided and mobile is missing,
        // treat the email as the mobileIdentifier so it can be stored in mobileNumber field.
        const email = body.email ?? body.Email ?? null;
        const mobileNumber =
            body["mobile number"] ?? body.mobileNumber ?? body.mobile ?? email;
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
                    // keep original email value in response only; DB doesn't have an email column
                    // keep existing `count` behavior (store tasbihCount there as before)
                    count: tasbihCount,
                    // additionally store weekly count in `weeklyCounts`
                    weeklyCounts: weeklyCounts,
                },
            });
        } else if (!existingUser && !fullName && !address) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "NOT_REGISTERED",
                    message: "User details (fullName, address) are required for new users. Please complete your profile.",
                    count: tasbihCount,
                },
                { status: 400 }
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
        // If caller provided an email, include it in the response object for convenience
        const responseData = safeNewItem
            ? { ...safeNewItem, Email: email || null }
            : null;
        return NextResponse.json(
            { ok: true, message: "Durood Sharif registered successfully!", data: responseData },
            { status: 201 }
        );
    } catch (err) {
        console.log('error: ', err);
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
        // Resolve Email where possible: if mobileNumber looks like an email use it,
        // otherwise try to find a matching `User` record by mobile or email.
        const filtered = await Promise.all(
            users.map(async (u) => {
                let resolvedEmail = null;
                if (u.mobileNumber && u.mobileNumber.includes("@")) {
                    resolvedEmail = u.mobileNumber;
                } else if (u.mobileNumber) {
                    const matched = await prisma.user.findFirst({
                        where: {
                            OR: [{ mobile: u.mobileNumber }, { email: u.mobileNumber }],
                        },
                    });
                    if (matched) resolvedEmail = matched.email;
                }
                return {
                    "Full Name": u.fullName,
                    Address: u.address,
                    "mobile number": u.mobileNumber,
                    Email: resolvedEmail,
                    // Life time counts
                    "Tasbih Counts":
                        typeof u.count === "bigint" ? Number(u.count) : u.count,
                    // Weekly counts (note: key is lowercase to match admin UI expectation)
                    "weekly counts":
                        typeof u.weeklyCounts === "bigint"
                            ? Number(u.weeklyCounts)
                            : u.weeklyCounts,
                };
            })
        );
        return NextResponse.json({ ok: true, data: filtered }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
