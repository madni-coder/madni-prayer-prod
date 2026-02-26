import { NextResponse } from "next/server";
// Importing Supabase client library and prefer server runtime
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing for committee route:", {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
}

export async function POST(request) {
    try {
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 });
        }

        const formData = await request.formData();
        const imageFile = formData.get("image");

        if (!imageFile) {
            return NextResponse.json({ error: "Image file is required" }, { status: 400 });
        }

        const fileExtension = imageFile.name ? imageFile.name.split(".").pop() : "jpg";
        const fileName = `committee_${Date.now()}.${fileExtension}`;

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageFile.type;

        const { data, error } = await supabase.storage
            .from("committee")
            .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: publicUrlData } = supabase.storage.from("committee").getPublicUrl(fileName);
        const imageSrc = publicUrlData?.publicUrl || null;
        const imageSrcPortrait = imageSrc ? `${imageSrc}?width=900&height=1600&fit=crop` : null;

        try {
            const { data: listData } = await supabase.storage.from("committee").list();
            const newTotal = listData?.length ?? 0;
            await supabase.channel("committee-updates").send({
                type: "broadcast",
                event: "new-committee-image",
                payload: { total: newTotal },
            });
        } catch (_) {
            // non-fatal
        }

        return NextResponse.json({ fileName, imageSrc, imageSrcPortrait, count: 1 });
    } catch (err) {
        console.error("/api/masjid-committee-event POST error", err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}

export async function GET() {
    try {
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({ error: "Missing Supabase environment variables" }, { status: 500 });
        }

        const { data, error } = await supabase.storage.from("committee").list();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ images: [] });
        }

        const images = data.map((file) => {
            const publicUrlData = supabase.storage.from("committee").getPublicUrl(file.name).data;
            const publicUrl = publicUrlData?.publicUrl || null;
            const imageSrcPortrait = publicUrl ? `${publicUrl}?width=900&height=1600&fit=crop` : null;

            return {
                id: file.name,
                imageName: file.name,
                imageSrc: publicUrl,
                imageSrcPortrait,
            };
        });

        return NextResponse.json({ images });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}
