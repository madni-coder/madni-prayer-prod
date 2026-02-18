import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET - list local stores or single by ?id=
export async function GET(req) {
    try {
        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        // Cache headers for faster loading on slow connections
        const cacheHeaders = {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        };

        if (id) {
            const store = await prisma.localStore.findUnique({ where: { id: parseInt(id) } });
            if (!store) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
            return NextResponse.json({ ok: true, data: store }, { status: 200, headers: cacheHeaders });
        }

        const stores = await prisma.localStore.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json({ ok: true, data: stores }, { status: 200, headers: cacheHeaders });
    } catch (err) {
        console.error("GET /api/local-stores error", err);
        return NextResponse.json({ ok: false, error: "Failed to fetch stores", details: String(err) }, { status: 500 });
    }
}

// POST - create local store
export async function POST(req) {
    try {
        const body = await req.json();
        const { fullName, mobile, shopName, shopAddress, workType, description, imageName, imageSrc, imageSrcPortrait } = body;

        if (!fullName || !shopName) {
            return NextResponse.json({ ok: false, error: "fullName and shopName are required" }, { status: 400 });
        }

        const created = await prisma.localStore.create({
            data: {
                fullName,
                mobile: mobile || null,
                shopName,
                shopAddress: shopAddress || null,
                workType: workType || null,
                description: description || null,
                imageName: imageName || null,
                imageSrc: imageSrc || null,
                imageSrcPortrait: imageSrcPortrait || null,
            },
        });

        return NextResponse.json({ ok: true, data: created, message: "Store created" }, { status: 201 });
    } catch (err) {
        console.error("POST /api/local-stores error", err);
        return NextResponse.json({ ok: false, error: "Failed to create store", details: String(err) }, { status: 500 });
    }
}

// DELETE - delete by id
export async function DELETE(req) {
    try {
        const body = await req.json();
        const { id } = body;
        if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

        const existing = await prisma.localStore.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });

        await prisma.localStore.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ ok: true, message: "Deleted" }, { status: 200 });
    } catch (err) {
        console.error("DELETE /api/local-stores error", err);
        return NextResponse.json({ ok: false, error: "Failed to delete", details: String(err) }, { status: 500 });
    }
}

// PATCH - update a local store
export async function PATCH(req) {
    try {
        const body = await req.json();
        const { id, fullName, mobile, shopName, shopAddress, workType, description, imageName, imageSrc, imageSrcPortrait } = body;

        if (!id) return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });

        const existing = await prisma.localStore.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });

        const updated = await prisma.localStore.update({
            where: { id: parseInt(id) },
            data: {
                fullName: fullName !== undefined ? fullName : existing.fullName,
                mobile: mobile !== undefined ? mobile : existing.mobile,
                shopName: shopName !== undefined ? shopName : existing.shopName,
                shopAddress: shopAddress !== undefined ? shopAddress : existing.shopAddress,
                workType: workType !== undefined ? workType : existing.workType,
                description: description !== undefined ? description : existing.description,
                // allow explicit null to clear image fields
                imageName: imageName !== undefined ? imageName : existing.imageName,
                imageSrc: imageSrc !== undefined ? imageSrc : existing.imageSrc,
                imageSrcPortrait: imageSrcPortrait !== undefined ? imageSrcPortrait : existing.imageSrcPortrait,
            },
        });

        return NextResponse.json({ ok: true, data: updated, message: "Store updated" }, { status: 200 });
    } catch (err) {
        console.error("PATCH /api/local-stores error", err);
        return NextResponse.json({ ok: false, error: "Failed to update store", details: String(err) }, { status: 500 });
    }
}
