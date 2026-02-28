import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";
import { supabase } from "../../../../../lib/supabase";

// ─── CORS helpers ─────────────────────────────────────────────────────────────
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function corsResponse(body, init = {}) {
    const { status = 200, headers = {} } = init;
    return NextResponse.json(body, {
        status,
        headers: { ...CORS_HEADERS, ...headers },
    });
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
}
// ──────────────────────────────────────────────────────────────────────────────

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return corsResponse({ error: 'Email and password are required' }, { status: 400 });
        }

        // Check if Supabase is configured
        if (!supabase) {
            return corsResponse(
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
            return corsResponse({ error: 'Invalid email or password' }, { status: 401 });
        }

        // Get user data from database
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return corsResponse({ error: 'User not found in database' }, { status: 404 });
        }

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        return corsResponse(
            {
                message: 'Login successful',
                user: userWithoutPassword,
                session: authData.session
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error logging in:', error);
        return corsResponse({ error: 'Failed to login' }, { status: 500 });
    }
}
