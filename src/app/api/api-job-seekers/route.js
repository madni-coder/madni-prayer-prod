import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

// GET - Fetch all job seekers or a single seeker by ID
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            // Fetch single job seeker
            const seeker = await prisma.jobSeeker.findUnique({
                where: { id: parseInt(id) },
            });

            if (!seeker) {
                return NextResponse.json(
                    { error: "Job seeker not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json(seeker);
        }

        // Fetch all job seekers
        const seekers = await prisma.jobSeeker.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(seekers);
    } catch (error) {
        console.error("Error fetching job seekers:", error);
        return NextResponse.json(
            { error: "Failed to fetch job seekers" },
            { status: 500 }
        );
    }
}

// POST - Create a new job seeker
export async function POST(request) {
    try {
        const body = await request.json();
        const {
            fullName,
            email,
            password,
            mobile,
            jobCategory,
            otherCategory,
            expectedSalary,
            experience,
            skills,
            address,
            city,
        } = body;

        // Validation
        if (!fullName || !email || !password || !jobCategory || !expectedSalary || !experience || !skills || !address || !city) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.jobSeeker.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email already exists" },
                { status: 400 }
            );
        }

        const newSeeker = await prisma.jobSeeker.create({
            data: {
                fullName,
                email,
                password,
                mobile,
                jobCategory,
                otherCategory: otherCategory || null,
                expectedSalary,
                experience,
                skills,
                address,
                city,
            },
        });

        // Return without password
        const { password: _, ...seekerWithoutPassword } = newSeeker;
        return NextResponse.json(seekerWithoutPassword, { status: 201 });
    } catch (error) {
        console.error("Error creating job seeker:", error);
        return NextResponse.json(
            { error: "Failed to create job seeker" },
            { status: 500 }
        );
    }
}

// PUT - Update an existing job seeker
export async function PUT(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Job seeker ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            fullName,
            email,
            mobile,
            jobCategory,
            otherCategory,
            expectedSalary,
            experience,
            skills,
            address,
            city,
        } = body;

        const updatedSeeker = await prisma.jobSeeker.update({
            where: { id: parseInt(id) },
            data: {
                ...(fullName && { fullName }),
                ...(email && { email }),
                ...(mobile && { mobile }),
                ...(jobCategory && { jobCategory }),
                ...(otherCategory !== undefined && { otherCategory }),
                ...(expectedSalary && { expectedSalary }),
                ...(experience && { experience }),
                ...(skills && { skills }),
                ...(address && { address }),
                ...(city && { city }),
            },
        });

        return NextResponse.json(updatedSeeker);
    } catch (error) {
        console.error("Error updating job seeker:", error);
        return NextResponse.json(
            { error: "Failed to update job seeker" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a job seeker
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Job seeker ID is required" },
                { status: 400 }
            );
        }

        await prisma.jobSeeker.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Job seeker deleted successfully" });
    } catch (error) {
        console.error("Error deleting job seeker:", error);
        return NextResponse.json(
            { error: "Failed to delete job seeker" },
            { status: 500 }
        );
    }
}

// PATCH - Partially update a job seeker
export async function PATCH(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Job seeker ID is required" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const {
            fullName,
            email,
            password,
            mobile,
            jobCategory,
            otherCategory,
            expectedSalary,
            experience,
            skills,
            address,
            city,
        } = body;

        // Build update object only with provided fields
        const updateData = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (email !== undefined) updateData.email = email;
        if (password !== undefined) updateData.password = password;
        if (mobile !== undefined) updateData.mobile = mobile;
        if (jobCategory !== undefined) updateData.jobCategory = jobCategory;
        if (otherCategory !== undefined) updateData.otherCategory = otherCategory;
        if (expectedSalary !== undefined) updateData.expectedSalary = expectedSalary;
        if (experience !== undefined) updateData.experience = experience;
        if (skills !== undefined) updateData.skills = skills;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;

        const updatedSeeker = await prisma.jobSeeker.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(updatedSeeker);
    } catch (error) {
        console.error("Error updating job seeker:", error);
        return NextResponse.json(
            { error: "Failed to update job seeker" },
            { status: 500 }
        );
    }
}
