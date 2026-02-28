import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";

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

export async function DELETE(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return corsResponse({ error: 'Email is required' }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return corsResponse({ error: 'User not found' }, { status: 404 });
        }

        // Delete related tasbih users and zikr history where they match user's mobile or fullName
        const deleteConditions = [];
        if (user.mobile) deleteConditions.push({ mobileNumber: user.mobile });
        if (user.fullName) deleteConditions.push({ fullName: user.fullName });

        // Build zikr delete conditions (model fields: mobile, fullName)
        const zikrDeleteConditions = [];
        if (user.mobile) zikrDeleteConditions.push({ mobile: user.mobile });
        if (user.fullName) zikrDeleteConditions.push({ fullName: user.fullName });

        // Run deletes in a transaction: delete tasbih users, delete zikr rows, then delete user
        await prisma.$transaction([
            prisma.tasbihUser.deleteMany({ where: deleteConditions.length ? { OR: deleteConditions } : {} }),
            prisma.zikr.deleteMany({ where: zikrDeleteConditions.length ? { OR: zikrDeleteConditions } : {} }),
            prisma.user.delete({ where: { email } })
        ]);

        return corsResponse({ message: 'User deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return corsResponse({ error: 'Failed to delete user' }, { status: 500 });
    }
}
