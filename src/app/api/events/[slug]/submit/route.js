import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export const runtime = "nodejs";

// Handle user submission
export async function POST(request, { params }) {
    try {
        const { slug } = await params;
        const { formData } = await request.json();

        if (!formData) {
            return NextResponse.json({ error: "No form data provided" }, { status: 400 });
        }

        // Validate that the event exists (and is active) before creating a submission
        const event = await prisma.eventPage.findUnique({
            where: { slug },
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (Object.prototype.hasOwnProperty.call(event, "isActive") && event.isActive === false) {
            return NextResponse.json({ error: "Event is inactive" }, { status: 400 });
        }

        const data = await prisma.eventSubmission.create({
            data: {
                eventSlug: slug,
                submittedData: formData
            }
        });

        return NextResponse.json({ success: true, submissionId: data.id });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
