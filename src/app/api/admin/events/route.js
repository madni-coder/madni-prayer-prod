import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const events = await prisma.eventPage.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                themeColor: true,
                isActive: true,
                position: true,
                updatedAt: true,
                schemaFields: true,
                _count: {
                    select: { submissions: true }
                }
            },
            orderBy: [
                { position: "asc" },
                { updatedAt: "desc" }
            ],
        });

        // Map keys back to what frontend expects for easy drop-in
        const formattedEvents = events.map(ev => ({
            ...ev,
            id: ev.id,
            color: ev.themeColor,
            isActive: ev.isActive,
            position: ev.position || 0,
            fieldsCount: Array.isArray(ev.schemaFields) ? ev.schemaFields.length : 0,
            submissionsCount: ev._count?.submissions || 0,
            updatedAt: ev.updatedAt.toISOString().split("T")[0] // Just the date
        }));

        return NextResponse.json({ events: formattedEvents });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { schema } = await request.json();

        if (!schema || !schema.page_slug) {
            return NextResponse.json({ error: "Schema and page_slug are required" }, { status: 400 });
        }

        // place new page at the end by default
        const agg = await prisma.eventPage.aggregate({ _max: { position: true } });
        const nextPos = (agg._max?.position || 0) + 1;

        const data = await prisma.eventPage.create({
            data: {
                title: schema.page_title,
                slug: schema.page_slug,
                description: schema.description,
                themeColor: schema.color,
                submitLabel: schema.submit_label,
                isActive: schema.isActive,
                schemaFields: schema.fields,
                position: nextPos
            }
        });

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
