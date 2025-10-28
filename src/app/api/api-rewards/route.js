import prisma from "../../../../lib/prisma";

export async function POST(request) {
    const body = await request.json();
    const { fullName, address, areaMasjid, position } = body;

    if (!fullName || !address || !areaMasjid || position === undefined) {
        return new Response(JSON.stringify({ error: "Missing fields" }), {
            status: 400,
        });
    }

    // Validate position is one of 1, 2, 3
    if (![1, 2, 3].includes(Number(position))) {
        return new Response(JSON.stringify({ error: "Invalid position" }), {
            status: 400,
        });
    }

    const reward = {
        fullName,
        address,
        areaMasjid,
        position: Number(position),
    };

    // Insert into database using Prisma
    try {
        const data = await prisma.Reward.create({
            data: reward,
        });
        return new Response(JSON.stringify({ success: true, data }), {
            status: 201,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

export async function GET() {
    try {
        const rewards = await prisma.rewards.findMany();
        return new Response(JSON.stringify(rewards), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
