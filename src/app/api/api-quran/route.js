import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const surahName = searchParams.get("surah");

        // If surah parameter is provided, handle surah PDF request
        if (surahName) {
            // Use hardcoded Supabase storage URL
            const fileUrl = `${supabaseUrl}/storage/v1/object/public/Quran/${surahName}.pdf`;

            return NextResponse.json({
                success: true,
                fileUrl: fileUrl,
                fileName: `${surahName}.pdf`,
                test: true
            });
        }

        // Default behavior: return para files from database
        const data = await prisma.fileTable.findMany();
        console.log('[api-quran] Found para files from database:', data.length);
        
        if (data.length > 0) {
            console.log('[api-quran] Sample fileUrl from DB:', data[0]?.fileUrl);
        }
        
        const files = data.map((file) => {
            let fullUrl = file.fileUrl;
            
            // If fileUrl doesn't start with http, construct full URL
            if (!fullUrl.startsWith('http')) {
                // Remove leading slash if present
                const cleanPath = fullUrl.startsWith('/') ? fullUrl.slice(1) : fullUrl;
                // Check if it already contains storage/v1/object/public
                if (cleanPath.includes('storage/v1/object/public')) {
                    fullUrl = `${supabaseUrl}/${cleanPath}`;
                } else {
                    // Assume it's just the bucket path
                    fullUrl = `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
                }
            }
            
            return {
                ...file,
                fileUrl: fullUrl,
            };
        });
        
        console.log('[api-quran] Returning para files:', files.length);
        if (files.length > 0) {
            console.log('[api-quran] Sample constructed URL:', files[0]?.fileUrl);
        }
        
        return NextResponse.json({ files }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, {
            status: 500,
        });
    }
}
