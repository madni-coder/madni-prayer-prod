"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Clock,
    Megaphone,
    Gift,
    Users,
    BookOpen,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
    {
        title: "Jamat Times",
        description: "Manage prayer schedules",
        icon: Clock,
        href: "/admin/jamat",
        color: "bg-blue-500",
        viewAllText: "View all",
    },
    {
        title: "Notice",
        description: "Manage announcements",
        icon: Megaphone,
        href: "/admin/notice",
        color: "bg-green-500",
        viewAllText: "View all",
    },
    {
        title: "Rewards",
        description: "Manage user rewards",
        icon: Gift,
        href: "/admin/rewards",
        color: "bg-purple-500",
        viewAllText: "View all",
    },
];

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication on client side
        const checkAuth = () => {
            const isAuthenticated =
                localStorage.getItem("isAuthenticated") === "true";
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            setLoading(false);
        };

        checkAuth();
    }, [router]);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome to the admin panel. Select an option from the
                    sidebar to get started.
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickActions.map((action, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-center mb-4">
                            <div className={`p-3 rounded-lg ${action.color}`}>
                                <action.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {action.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={action.href}
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            {action.viewAllText}
                            <svg
                                className="ml-1 w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Total Users
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                00
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <BookOpen className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Active Mosques
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                00
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <TrendingUp className="w-8 h-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">
                                Monthly Growth
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                0%
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
