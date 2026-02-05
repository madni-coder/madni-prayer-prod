import { NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma";

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
        const { gender, fullName, address, areaMasjid, mobile, zikrTypes, zikrType, zikrCounts } = body;

        // Handle backward compatibility: accept single `zikrType` string
        let types = zikrTypes;
        if (!types && zikrType) {
            types = [zikrType];
        }

        // Validate required fields
        if (!gender || !fullName || !address || !areaMasjid || !types || zikrCounts === undefined) {
            return NextResponse.json(
                { error: 'gender, fullName, address, areaMasjid, zikrTypes and zikrCounts are required' },
                { status: 400 }
            );
        }

        // Ensure types is an array of strings
        if (!Array.isArray(types)) {
            return NextResponse.json(
                { error: 'zikrTypes must be an array of strings' },
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
                gender,
                fullName,
                address,
                areaMasjid,
                mobile: mobile || null,
                zikrTypes: types,
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
