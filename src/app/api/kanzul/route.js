import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) {
            return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
        }

        const fileName = "kanzulImaan.pdf";
        const filePath = `Kanzul Imaan/${fileName}`;
        const encodedPath = encodeURI(filePath);
        const fileUrl = `${supabaseUrl}/storage/v1/object/public/${encodedPath}`;

        // Fetch the file server-side and stream it back so the client receives the correct
        // content-type (prevents attempts to parse HTML or PDF as JSON on the client).
        const upstream = await fetch(fileUrl);

        // If upstream returned non-ok (e.g. HTML error page), capture body and return JSON error
        if (!upstream.ok) {
            const bodyText = await upstream.text();
            return NextResponse.json(
                { error: 'Failed to fetch file', status: upstream.status, body: bodyText },
                { status: 502 }
            );
        }

        // If upstream returned a valid file (PDF), return the public file URL as JSON
        // so the client can safely call `resp.json()` and proxy the PDF separately.
        return NextResponse.json({ success: true, fileName, fileUrl });
    } catch (err) {
        return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
    }
}

