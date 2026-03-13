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
