import prisma from "../../../../lib/prisma";

export async function GET() {
    try {
        const data = await prisma.fileTable.findMany();
        const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const files = data.map((file) => ({
            ...file,
            fileUrl: `${SUPABASE_URL}/${file.fileUrl}`,
        }));
        return new Response(JSON.stringify({ files }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
