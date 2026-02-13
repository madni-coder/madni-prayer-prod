import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET - Fetch all job lists or a single job by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            // Fetch single job
            const job = await prisma.jobList.findUnique({
                where: { id: parseInt(id) },
            });

            if (!job) {
                return NextResponse.json(
                    { error: "Job not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(job);
        }

        // Fetch all jobs
        const jobs = await prisma.jobList.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}

// POST - Create a new job
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            title,
            company,
            location,
            type,
            salary,
            postedDate,
            description,
            requirements,
            responsibilities,
        } = body;

        // Validation
        if (!title || !company || !location || !type || !salary || !description) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const newJob = await prisma.jobList.create({
            data: {
                title,
                company,
                location,
                type,
                salary,
                postedDate: postedDate || new Date().toISOString(),
                description,
                requirements: requirements || [],
                responsibilities: responsibilities || [],
            },
        });

        return NextResponse.json(newJob, { status: 201 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        );
    }
}

// PUT - Update an existing job
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Job ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            title,
            company,
            location,
            type,
            salary,
            postedDate,
            description,
            requirements,
            responsibilities,
        } = body;

        const updatedJob = await prisma.jobList.update({
            where: { id: parseInt(id) },
            data: {
                ...(title && { title }),
                ...(company && { company }),
                ...(location && { location }),
                ...(type && { type }),
                ...(salary && { salary }),
                ...(postedDate && { postedDate }),
                ...(description && { description }),
                ...(requirements && { requirements }),
                ...(responsibilities && { responsibilities }),
            },
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json(
            { error: "Failed to update job" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a job
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Job ID is required" },
                { status: 400 }
            );
        }

        await prisma.jobList.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json(
            { error: "Failed to delete job" },
            { status: 500 }
        );
    }
}
