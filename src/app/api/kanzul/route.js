import { NextResponse } from "next/server";
// Build Kanzul Imaan public URL using NEXT_PUBLIC_SUPABASE_URL (matches api-quran pattern)

export const runtime = "nodejs";

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
        }

        // Use same pattern as api-quran route - direct URL construction
        const fileName = "kanzulImaan.pdf";
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/Kanzul%20Imaan/${fileName}`;

        return NextResponse.json({
            success: true,
            fileName,
            fileUrl
        });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}

