import { NextResponse } from "next/server";
// Importing Supabase client library
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request) {
    try {
        const formData = await request.formData();
        const imageFile = formData.get("image");
        const imageName = formData.get("imageName");

        if (!imageFile || !imageName) {
            return NextResponse.json(
                { error: "Image and image name are required" },
                { status: 400 }
            );
        }

        // Read the image file as ArrayBuffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageFile.type;

        // Upload to Supabase storage bucket 'notice'
        const { data, error } = await supabase.storage
            .from("notice")
            .upload(imageName, buffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from("notice")
            .getPublicUrl(imageName);
        const imageSrc = publicUrlData?.publicUrl || null;

        return NextResponse.json({ imageName, imageSrc });
    } catch (err) {
        return NextResponse.json(
            { error: err.message || String(err) },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Validate env vars
        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: "Missing Supabase environment variables" },
                { status: 500 }
            );
        }

        // List all images in the 'notice' bucket
        const { data, error } = await supabase.storage.from("notice").list();
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ images: [] });
        }

        const images = data.map((file) => {
            const publicUrlData = supabase.storage
                .from("notice")
                .getPublicUrl(file.name).data;

            const publicUrl = publicUrlData?.publicUrl || null;
            return { imageName: file.name, imageSrc: publicUrl };
        });

        return NextResponse.json({ images });
    } catch (err) {
        return NextResponse.json(
            { error: err.message || String(err) },
            { status: 500 }
        );
    }
}
