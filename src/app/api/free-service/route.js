import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET - Fetch all free service requests
export async function GET(req) {
    try {
        const freeServices = await prisma.freeService.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(
            {
                ok: true,
                data: freeServices,
            },
            { status: 200 }
        );
    } catch (err) {
        console.error('Error fetching free services:', err);
        return NextResponse.json(
            {
                ok: false,
                error: 'Failed to fetch free services',
                details: String(err)
            },
            { status: 500 }
        );
    }
}

// POST - Create a new free service request
export async function POST(req) {
    try {
        const body = await req.json();

        const mutuwalliName = body.fullName || body.mutuwalliName;
        const mobileNumber = body.mobileNumber;
        const masjidName = body.masjidName;
        const numberOfACs = body.numberOfACs;

        // Validate required fields
        if (!mutuwalliName || !mobileNumber || !masjidName || !numberOfACs) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "All fields are required: mutuwalliName, mobileNumber, masjidName, numberOfACs",
                },
                { status: 400 }
            );
        }

        // Validate mobile number
        if (!/^\d{10,15}$/.test(mobileNumber)) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Mobile number must be 10-15 digits",
                },
                { status: 400 }
            );
        }

        // Validate AC count (allow numeric strings or "5+")
        const acValue = String(numberOfACs).trim();
        const isValidAcCount = /^\d+$/.test(acValue) || acValue === "5+";
        if (!isValidAcCount) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Number of ACs must be a positive number or '5+'",
                },
                { status: 400 }
            );
        }

        // Create new free service request
        const newService = await prisma.freeService.create({
            data: {
                mutuwalliName,
                mobileNumber,
                masjidName,
                numberOfACs: acValue,
            },
        });

        return NextResponse.json(
            {
                ok: true,
                message: "Free service request created successfully",
                data: newService,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error('Error creating free service:', err);
        return NextResponse.json(
            {
                ok: false,
                error: 'Failed to create free service request',
                details: String(err)
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete a free service request
export async function DELETE(req) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Service ID is required",
                },
                { status: 400 }
            );
        }

        // Check if service exists
        const existingService = await prisma.freeService.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingService) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Service request not found",
                },
                { status: 404 }
            );
        }

        // Delete the service
        await prisma.freeService.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json(
            {
                ok: true,
                message: "Service request deleted successfully",
            },
            { status: 200 }
        );
    } catch (err) {
        console.error('Error deleting free service:', err);
        return NextResponse.json(
            {
                ok: false,
                error: 'Failed to delete service request',
                details: String(err)
            },
            { status: 500 }
        );
    }
}
