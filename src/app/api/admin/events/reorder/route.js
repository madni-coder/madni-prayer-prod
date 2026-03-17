import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const { order } = await request.json();
        if (!Array.isArray(order)) {
            return NextResponse.json({ error: "Invalid payload, expected order array" }, { status: 400 });
        }

        // Build updates for transaction
        const updates = order.map(item => {
            return prisma.eventPage.update({
                where: { slug: item.slug },
                data: { position: item.position }
            });
        });

        await prisma.$transaction(updates);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Failed to persist event order:", err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
