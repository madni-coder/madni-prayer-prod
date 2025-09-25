import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tasbihUsers.json");

async function ensureDataFile() {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
        await fs.access(DATA_FILE);
    } catch (err) {
        await fs.writeFile(DATA_FILE, "[]", "utf8");
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        // Validate fields
        // Remove title and count validation
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

        await ensureDataFile();

        // Read existing
        const raw = await fs.readFile(DATA_FILE, "utf8");
        let users = [];
        try {
            users = JSON.parse(raw || "[]");
        } catch (e) {
            users = [];
        }

        const newItem = {
            id: Date.now().toString(),
            "Full Name": fullName,
            Address: address,
            "mobile number": mobileNumber,
            createdAt: new Date().toISOString(),
        };

        users.push(newItem);
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf8");

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
        await ensureDataFile();
        const raw = await fs.readFile(DATA_FILE, "utf8");
        let users = [];
        try {
            users = JSON.parse(raw || "[]");
        } catch (e) {
            users = [];
        }
        // Map to only required fields
        const filtered = users.map((u) => ({
            "Full Name": u["Full Name"],
            Address: u.Address,
            "mobile number": u["mobile number"],
        }));
        return NextResponse.json({ ok: true, data: filtered }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { ok: false, error: String(err) },
            { status: 500 }
        );
    }
}
