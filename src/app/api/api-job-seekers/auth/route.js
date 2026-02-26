import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

// POST - Authenticate job seeker (Sign In)
export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Find user by email
        const user = await prisma.jobSeeker.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check password (simple comparison - in production, use bcrypt)
        if (user.password !== password) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
        });
    } catch (error) {
        console.error("Authentication error:", error);
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}
