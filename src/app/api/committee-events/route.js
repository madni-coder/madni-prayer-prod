import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Supabase client (file storage only) ──────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/** Upload a File to Supabase storage bucket "committee" and return its public URL */
async function uploadFile(file, folder) {
    const ext = file.name ? file.name.split(".").pop() : "bin";
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
        .from("committee")
        .upload(fileName, buffer, { contentType: file.type, upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("committee").getPublicUrl(fileName);
    return data?.publicUrl ?? null;
}

// ── POST /api/committee-events ────────────────────────────────────────────────
// Accepts multipart/form-data: title, description, buttons (JSON), images[], pdfs[]
export async function POST(request) {
    try {
        const fd = await request.formData();
        const title = (fd.get("title") || "").trim();
        const description = (fd.get("description") || "").trim();
        let buttons = [];
        try { buttons = JSON.parse(fd.get("buttons") || "[]"); } catch { /* keep [] */ }

        // Upload images
        const imageUrls = [];
        for (const img of fd.getAll("images")) {
            if (img?.size > 0) {
                const url = await uploadFile(img, "committee-events/images");
                if (url) imageUrls.push(url);
            }
        }

        // Upload PDFs
        const pdfAttachments = [];
        for (const pdf of fd.getAll("pdfs")) {
            if (pdf?.size > 0) {
                const url = await uploadFile(pdf, "committee-events/pdfs");
                if (url) pdfAttachments.push({ name: pdf.name, url });
            }
        }

        const event = await prisma.committeeEvent.create({
            data: { title, description, buttons, imageUrls, pdfAttachments, isActive: true },
        });

        return NextResponse.json({ success: true, event });
    } catch (err) {
        console.error("/api/committee-events POST", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}

// ── GET /api/committee-events ─────────────────────────────────────────────────
// Returns all active events, newest first, with snake_case field names for the frontend.
export async function GET() {
    try {
        const rows = await prisma.committeeEvent.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
        });

        const events = rows.map((e) => ({
            id:              e.id,
            title:           e.title,
            description:     e.description,
            buttons:         e.buttons,
            image_urls:      e.imageUrls,
            pdf_attachments: e.pdfAttachments,
            is_active:       e.isActive,
            created_at:      e.createdAt,
            updated_at:      e.updatedAt,
        }));

        return NextResponse.json({ events });
    } catch (err) {
        console.error("/api/committee-events GET", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}

// ── DELETE /api/committee-events?id=<uuid> ────────────────────────────────────
// Soft-deletes an event (sets isActive = false).
export async function DELETE(request) {
    try {
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

        await prisma.committeeEvent.update({ where: { id }, data: { isActive: false } });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("/api/committee-events DELETE", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}

// ── PATCH /api/committee-events?id=<uuid> ────────────────────────────────────
// Updates title, description, buttons. Accepts new images/pdfs via FormData.
// Pass keepImageUrls and keepPdfAttachments (JSON arrays) to retain existing files.
export async function PATCH(request) {
    try {
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

        const fd = await request.formData();
        const title       = (fd.get("title")       || "").trim();
        const description = (fd.get("description") || "").trim();

        let buttons;
        const rawButtons = fd.get("buttons");
        if (rawButtons) {
            try { buttons = JSON.parse(rawButtons); } catch { buttons = []; }
        }

        // Existing files the client wants to KEEP
        let keepImageUrls = [];
        let keepPdfs      = [];
        try { keepImageUrls = JSON.parse(fd.get("keepImageUrls")      || "[]"); } catch { /**/ }
        try { keepPdfs      = JSON.parse(fd.get("keepPdfAttachments") || "[]"); } catch { /**/ }

        // Upload NEW images
        const newImageUrls = [];
        for (const img of fd.getAll("images")) {
            if (img?.size > 0) {
                const url = await uploadFile(img, "committee-events/images");
                if (url) newImageUrls.push(url);
            }
        }

        // Upload NEW PDFs
        const newPdfs = [];
        for (const pdf of fd.getAll("pdfs")) {
            if (pdf?.size > 0) {
                const url = await uploadFile(pdf, "committee-events/pdfs");
                if (url) newPdfs.push({ name: pdf.name, url });
            }
        }

        const updateData = {
            ...(title       && { title }),
            ...(description !== undefined && { description }),
            ...(buttons !== undefined     && { buttons }),
            imageUrls:      [...keepImageUrls, ...newImageUrls],
            pdfAttachments: [...keepPdfs, ...newPdfs],
        };

        const event = await prisma.committeeEvent.update({ where: { id }, data: updateData });
        return NextResponse.json({ success: true, event });
    } catch (err) {
        console.error("/api/committee-events PATCH", err);
        return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
    }
}
