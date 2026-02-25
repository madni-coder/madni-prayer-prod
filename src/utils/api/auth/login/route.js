import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";
import { supabase } from "../../../../../lib/supabase";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check if Supabase is configured
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase authentication is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file' },
                { status: 500 }
            );
        }

        // Login with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Get user data from database
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found in database' },
                { status: 404 }
            );
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: 'Login successful',
                user: userWithoutPassword,
                session: authData.session
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json(
            { error: 'Failed to login' },
            { status: 500 }
        );
    }
}
