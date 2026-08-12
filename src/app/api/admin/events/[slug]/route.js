import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { sendTopicPush, PUSH_TOPICS } from "../../../../../../lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function truncate(text, max) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        const data = await prisma.eventPage.findUnique({
            where: { slug }
        });

        if (!data) return NextResponse.json({ event: null }, { status: 404 });

        const formattedEvent = {
            ...data,
            gender: data.gender,
            theme_color: data.themeColor,
            submit_label: data.submitLabel,
            is_active: data.isActive,
            allow_multiple_registrations: data.allowMultipleRegistrations,
            position: data.position || 0,
            schema_fields: data.schemaFields
        };

        return NextResponse.json({ event: formattedEvent });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { slug } = await params;
        const { schema } = await request.json();

        // prefer explicit create/update so we can set a default position for new pages
        const existing = await prisma.eventPage.findUnique({ where: { slug } });
        let data;
        if (existing) {
            data = await prisma.eventPage.update({
                where: { slug },
                data: {
                    title: schema.page_title,
                    description: schema.description || "",
                    gender: schema.gender || "Both",
                    themeColor: schema.color || "#7c3aed",
                    submitLabel: schema.submit_label || "Submit",
                    isActive: schema.isActive || false,
                    allowMultipleRegistrations: schema.allowMultipleRegistrations || false,
                    schemaFields: schema.fields || [],
                    updatedAt: new Date()
                }
            });
        } else {
            const agg = await prisma.eventPage.aggregate({ _max: { position: true } });
            const nextPos = (agg._max?.position || 0) + 1;
            data = await prisma.eventPage.create({
                data: {
                    slug: slug,
                    title: schema.page_title,
                    description: schema.description || "",
                    gender: schema.gender || "Both",
                    themeColor: schema.color || "#7c3aed",
                    submitLabel: schema.submit_label || "Submit",
                    isActive: schema.isActive || false,
                    allowMultipleRegistrations: schema.allowMultipleRegistrations || false,
                    schemaFields: schema.fields || [],
                    position: nextPos
                }
            });
        }

        // Notify only when the page actually goes live (false/absent -> true),
        // not on every unrelated edit to an already-published page.
        const wasActive = existing?.isActive || false;
        if (!wasActive && data.isActive) {
            await sendTopicPush({
                topic: PUSH_TOPICS.EVENTS_PROGRAMS,
                title: data.title || "New Event/Program",
                body: data.description
                    ? truncate(data.description, 100)
                    : "New event/program added — tap to view.",
                data: { type: "event_page", slug: data.slug },
            });
        }

        return NextResponse.json({ success: true, event: data });
    } catch (err) {
        console.error("PUT API error:", err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { slug } = await params;

        await prisma.eventPage.delete({
            where: { slug }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
