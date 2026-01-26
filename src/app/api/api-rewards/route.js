import prisma from "../../../../lib/prisma";

export async function POST(request) {
    const body = await request.json();
    // Accept either a single object or a payload with { items: [...] }
    // Client will send { items: [ { fullName, address, areaMasjid, position, counts }, ... ] }
    const payload = Array.isArray(body) ? body : body.items || body;

    if (!payload) {
        return new Response(JSON.stringify({ error: "Missing payload" }), {
            status: 400,
        });
    }

    // Insert into database using Prisma
    try {
        // If payload is an array, perform a bulk insert using createMany with only allowed fields.
        if (Array.isArray(payload)) {
            const dataToInsert = payload.map((item) => {
                const {
                    fullName,
                    address,
                    areaMasjid,
                    position,
                    counts,
                    weeklyCounts,
                    from,
                    to,
                } = item || {};
                return {
                    fullName: fullName || "",
                    address: address || "",
                    areaMasjid: areaMasjid || "",
                    from: from || "",
                    to: to || "",
                    position: position !== undefined ? Number(position) : 0,
                    counts: counts !== undefined ? Number(counts) : 0,
                    weeklyCounts:
                        weeklyCounts !== undefined
                            ? BigInt(weeklyCounts)
                            : BigInt(0),
                };
            });

            // Basic validation: ensure required fields are present on at least one item
            if (
                dataToInsert.some(
                    (d) => !d.fullName || !d.address || !d.areaMasjid
                )
            ) {
                return new Response(
                    JSON.stringify({
                        error: "One or more items missing required fields",
                    }),
                    { status: 400 }
                );
            }

            const result = await prisma.reward.createMany({
                data: dataToInsert,
            });
            return new Response(
                JSON.stringify({ success: true, inserted: result.count }),
                { status: 201 }
            );
        }

        // Otherwise assume single object
        const {
            fullName,
            address,
            areaMasjid,
            position,
            counts,
            weeklyCounts,
            from,
            to,
        } = payload || {};
        if (!fullName || !address || !areaMasjid || position === undefined) {
            return new Response(JSON.stringify({ error: "Missing fields" }), {
                status: 400,
            });
        }

        const created = await prisma.reward.create({
            data: {
                fullName,
                address,
                areaMasjid,
                from: from || "",
                to: to || "",
                position: Number(position),
                counts: counts !== undefined ? Number(counts) : 0,
                weeklyCounts:
                    weeklyCounts !== undefined
                        ? BigInt(weeklyCounts)
                        : BigInt(0),
            },
        });
        return new Response(JSON.stringify({ success: true, data: created }), {
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
        const rewards = await prisma.reward.findMany();

        // Remove any dollar signs from 'from' and 'to' fields before returning
        const cleaned = rewards.map((r) => ({
            ...r,
            from:
                typeof r.from === "string" ? r.from.replace(/\$/g, "") : r.from,
            to: typeof r.to === "string" ? r.to.replace(/\$/g, "") : r.to,
        }));

        // Serialize BigInt values to string
        const safeJson = JSON.stringify(cleaned, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        );
        return new Response(safeJson, { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}

export async function DELETE() {
    try {
        await prisma.reward.deleteMany({});
        return new Response(
            JSON.stringify({
                success: true,
                message: "All Winners list deleted.",
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
}
