import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";
import { supabase } from "../../../../../lib/supabase";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, gender, fullName, address, areaMasjid, mobile } = body;

        // Validate required fields (address, areaMasjid and gender are optional)
        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Email, password and fullName are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
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

        // Register user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        // Save additional user data to database
        const newUser = await prisma.user.create({
            data: {
                email,
                password, // Save password in DB as well
                gender: gender || "",
                fullName,
                address: address || null,
                areaMasjid: areaMasjid || null,
                mobile: mobile || null,
            },
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: userWithoutPassword,
                session: authData.session
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        // Use server-side Prisma to read users (bypasses Supabase RLS/anon role issues)
        const users = await prisma.user.findMany();
        return NextResponse.json({ users }, { status: 200 });
    } catch (err) {
        console.error('Error fetching users from Supabase:', err);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        // Identify user by id or email
        const { id, email, fullName, gender, address, areaMasjid, mobile, password } = body;

        if (!id && !email) {
            return NextResponse.json({ error: 'Missing id or email to identify user' }, { status: 400 });
        }

        const where = id ? { id } : { email };

        // Build update payload but DO NOT allow changing email
        const data = {};
        if (fullName !== undefined) data.fullName = fullName;
        if (gender !== undefined) data.gender = gender;
        if (address !== undefined) data.address = address;
        if (areaMasjid !== undefined) data.areaMasjid = areaMasjid;
        if (mobile !== undefined) data.mobile = mobile;
        if (password !== undefined) data.password = password;

        const updated = await prisma.user.update({ where, data });
        const { password: _pwd, ...userWithoutPassword } = updated;

        return NextResponse.json({ message: 'User updated successfully', user: userWithoutPassword }, { status: 200 });
    } catch (err) {
        console.error('Error updating user:', err);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
