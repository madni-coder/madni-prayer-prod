import { NextResponse } from 'next/server';
import prisma from "../../../../../lib/prisma";
import { supabase } from "../../../../../lib/supabase";

export async function DELETE(request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Verify user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
            // delete from tasbih_users
            prisma.tasbihUser.deleteMany({ where: deleteConditions.length ? { OR: deleteConditions } : {} }),
            // delete from zikr
            prisma.zikr.deleteMany({ where: zikrDeleteConditions.length ? { OR: zikrDeleteConditions } : {} }),
            // delete user
            prisma.user.delete({ where: { email } })
        ]);

        // Optionally delete user from Supabase Auth if admin privileges are available
        // (This requires a service_role key and admin client; keep commented if not configured)
        // try {
        //     await supabase.auth.admin.deleteUser(user.id);
        // } catch (e) {
        //     // ignore supabase delete errors if not configured
        // }

        return NextResponse.json({ message: 'User deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
