import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// POST: Update all masjid committees with event image(s)
export async function POST(request) {
    try {
        // If multipart/form-data, accept uploaded image(s) and store in `committee` bucket
        const contentType = request.headers.get("content-type") || "";
        let images = [];

        if (contentType.includes("multipart/form-data")) {
            // Uploads to Supabase storage require the service role key.
            if (!supabaseServiceKey) {
                return NextResponse.json({ error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is required to upload files to storage. Please set it in your environment." }, { status: 500 });
            }
            const formData = await request.formData();
            // Accept single `image` or multiple `images[]`
            const single = formData.get("image");
            const multiple = formData.getAll("images");

            const files = multiple && multiple.length ? multiple : single ? [single] : [];

            for (const file of files) {
                if (!file) continue;
                const fileExt = file.name ? file.name.split(".").pop() : "jpg";
                const fileName = `committee_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const mimeType = file.type || "image/jpeg";

                // Try upload, and if bucket is missing attempt to create it (requires service role key)
                let uploadErr = null;
                for (let attempt = 0; attempt < 2; attempt++) {
                    const res = await supabase.storage.from("committee").upload(fileName, buffer, {
                        contentType: mimeType,
                        upsert: false,
                    });
                    uploadErr = res.error;
                    if (!uploadErr) break;

                    const msg = String(uploadErr.message || uploadErr).toLowerCase();
                    // If bucket not found, try to create it once (only when using service role key)
                    if (msg.includes("bucket") && supabaseServiceKey && attempt === 0) {
                        try {
                            const { error: createErr } = await supabase.storage.createBucket("committee", { public: true });
                            if (createErr) {
                                console.error("Failed to create 'committee' bucket", createErr);
                                return NextResponse.json({ error: "Supabase storage error: failed to create bucket 'committee'. Ensure the service role key has permissions or create the bucket manually in Supabase." }, { status: 500 });
                            }
                            // bucket created, retry upload
                            continue;
                        } catch (e) {
                            console.error("Error creating bucket 'committee'", e);
                            return NextResponse.json({ error: "Supabase storage error: failed to create bucket 'committee'. Ensure the service role key has permissions or create the bucket manually in Supabase." }, { status: 500 });
                        }
                    }

                    // Permission denied
                    if (uploadErr.status === 403 || msg.includes("permission")) {
                        console.error("Supabase upload error", uploadErr);
                        return NextResponse.json({ error: "Supabase storage error: permission denied. Ensure SUPABASE_SERVICE_ROLE_KEY is set and has storage permissions." }, { status: 500 });
                    }

                    // Other upload error: break and return
                    console.error("Supabase upload error", uploadErr);
                    return NextResponse.json({ error: uploadErr.message || String(uploadErr) }, { status: 500 });
                }

                if (uploadErr) {
                    // If after retries there's still an error, it's handled above; this is a safeguard
                    console.error("Supabase upload unrecoverable error", uploadErr);
                    return NextResponse.json({ error: uploadErr.message || String(uploadErr) }, { status: 500 });
                }

                const publicUrlResp = supabase.storage.from("committee").getPublicUrl(fileName);
                const publicUrlData = publicUrlResp?.data || publicUrlResp;
                const publicUrl = publicUrlData?.publicUrl || publicUrlData?.publicURL || null;
                if (publicUrl) images.push(publicUrl);
            }
        } else {
            // JSON body: accept `images` array or single `imageUrl`
            const body = await request.json();
            if (Array.isArray(body.images) && body.images.length) images = body.images.filter(Boolean);
            else if (body.imageUrl) images = [body.imageUrl];
        }

        if (!images.length) {
            return NextResponse.json({ error: "At least one image URL or file is required" }, { status: 400 });
        }

        // Merge new images with existing committeeImages for each record (preserve previously posted images)
        const committees = await prisma.masjidCommittee.findMany({ select: { id: true, committeeImages: true } });
        let updatedCount = 0;
        for (const c of committees) {
            const existing = Array.isArray(c.committeeImages) ? c.committeeImages : [];
            const merged = Array.from(new Set([...existing, ...images]));
            // Only update when merged changes to avoid unnecessary writes
            const needsUpdate = merged.length !== existing.length || merged.some((v, i) => v !== existing[i]);
            if (needsUpdate) {
                await prisma.masjidCommittee.update({ where: { id: c.id }, data: { committeeImages: merged } });
                updatedCount += 1;
            }
        }

        return NextResponse.json({
            message: "Event image(s) posted to masjid committees",
            count: updatedCount,
            images,
        }, { status: 200 });
    } catch (err) {
        console.error("POST /api/masjid-committee-event error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE: remove an image URL from committeeImages on all masjid committee records
export async function DELETE(request) {
    try {
        const body = await request.json();
        const { imageUrl, removeFromStorage } = body || {};
        if (!imageUrl) {
            return NextResponse.json({ error: "Missing required field: imageUrl" }, { status: 400 });
        }

        const committees = await prisma.masjidCommittee.findMany({ where: { committeeImages: { has: imageUrl } }, select: { id: true, committeeImages: true } });
        let updatedCount = 0;
        for (const c of committees) {
            const existing = Array.isArray(c.committeeImages) ? c.committeeImages : [];
            const filtered = existing.filter((u) => u !== imageUrl);
            if (filtered.length !== existing.length) {
                await prisma.masjidCommittee.update({ where: { id: c.id }, data: { committeeImages: filtered } });
                updatedCount += 1;
            }
        }

        // Optionally remove the file from Supabase storage (best-effort)
        if (removeFromStorage && supabaseServiceKey) {
            try {
                const parts = imageUrl.split("/");
                const fileName = parts[parts.length - 1].split("?")[0];
                const { error: removeErr } = await supabase.storage.from("committee").remove([fileName]);
                if (removeErr) console.warn("Supabase remove error", removeErr);
            } catch (e) {
                console.warn("Failed to remove file from storage", e);
            }
        }

        return NextResponse.json({ message: "Deleted", count: updatedCount }, { status: 200 });
    } catch (err) {
        console.error("DELETE /api/masjid-committee-event error", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
