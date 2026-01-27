import { NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma";

// Required for static export when `output: "export"` is enabled
export const dynamic = "force-static";

// GET endpoint - Fetch all zikr records
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // If id is provided, fetch single record
        if (id) {
            const zikr = await prisma.zikr.findUnique({
                where: { id: parseInt(id) },
            });

            if (!zikr) {
                return NextResponse.json(
                    { error: 'Zikr not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json(zikr, { status: 200 });
        }

        // Fetch all zikr records
        const zikrList = await prisma.zikr.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(zikrList, { status: 200 });
    } catch (error) {
        console.error('Error fetching zikr:', error);
        return NextResponse.json(
            { error: 'Failed to fetch zikr records' },
            { status: 500 }
        );
    }
}

// POST endpoint - Create new zikr record
export async function POST(request) {
    try {
        const body = await request.json();
        const { zikrType, zikrCounts } = body;

        // Validate required fields
        if (!zikrType || zikrCounts === undefined) {
            return NextResponse.json(
                { error: 'zikrType and zikrCounts are required' },
                { status: 400 }
            );
        }

        // Validate zikrCounts is a number
        const counts = parseInt(zikrCounts);
        if (isNaN(counts)) {
            return NextResponse.json(
                { error: 'zikrCounts must be a valid number' },
                { status: 400 }
            );
        }

        // Create new zikr record
        const newZikr = await prisma.zikr.create({
            data: {
                zikrType,
                zikrCounts: counts,
            },
        });

        return NextResponse.json(newZikr, { status: 201 });
    } catch (error) {
        console.error('Error creating zikr:', error);
        return NextResponse.json(
            { error: 'Failed to create zikr record' },
            { status: 500 }
        );
    }
}
