import { Users, CalendarDays, Calendar } from "lucide-react";
import prisma from "../../../lib/prisma";

function formatNumber(n) {
    return Intl.NumberFormat("en-US").format(n);
}

export default async function AdminDashboard() {
    const now = new Date();

    // Use UTC-based period starts to avoid local timezone drift when comparing
    // against `createdAt` (which may be stored in UTC in the DB).
    // Start of ISO week (Monday) in UTC
    const utcDay = now.getUTCDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = (utcDay + 6) % 7; // days since Monday
    const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // Start of month in UTC
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    startOfMonth.setUTCHours(0, 0, 0, 0);

    const [totalUsers, weekUsers, monthUsers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
        prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Overview of user registrations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalUsers)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <CalendarDays className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">This Week Registered</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(weekUsers)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <Calendar className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">This Month Registered</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(monthUsers)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
