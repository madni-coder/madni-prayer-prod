import { NextResponse } from "next/server";
import prisma from "../../../../../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(request, { params }) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.slice("Bearer ".length).trim();

        if (!process.env.ADMIN_API_TOKEN || token !== process.env.ADMIN_API_TOKEN) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { slug } = params;
        
        const data = await prisma.eventSubmission.findMany({
            where: { eventSlug: slug },
            orderBy: { submittedAt: 'desc' }
        });

        const formatted = data.map(sub => ({
            ...sub,
            event_slug: sub.eventSlug,
            submitted_data: sub.submittedData,
            submitted_at: sub.submittedAt
        }));

        return NextResponse.json({ submissions: formatted });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
