"use client";

import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Mobile menu button - positioned fixed for mobile */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white shadow-md bg-white"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Page content */}
                <main className="p-4 lg:p-6 pt-16 lg:pt-6">{children}</main>
            </div>

            {/* Hide TopNav only within admin pages (style is scoped to admin layout render) */}
            <style jsx global>{`
                nav.sticky {
                    display: none !important;
                }
            `}</style>
        </div>
    );
}
