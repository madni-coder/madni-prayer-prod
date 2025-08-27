"use client";

import Link from "next/link";

const sections = [
    {
        name: "Quran",
        href: "/quran",
        icon: "📖",
        desc: "Read, listen, and search Quran.",
    },
    {
        name: "Prayer Times",
        href: "/prayer-times",
        icon: "🕋",
        desc: "View daily prayer times.",
    },
    {
        name: "Qibla",
        href: "/qibla",
        icon: "🧭",
        desc: "Find Qibla direction.",
    },
    {
        name: "Azan Alerts",
        href: "/azan-alerts",
        icon: "🔔",
        desc: "Set up Azan notifications.",
    },
    {
        name: "Tasbih",
        href: "/tasbih",
        icon: "🔢",
        desc: "Digital Tasbih counter.",
    },
    {
        name: "Settings",
        href: "/settings",
        icon: "⚙️",
        desc: "App preferences.",
    },
];

export default function Home() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <h1 className="text-4xl font-bold mb-6 text-center">
                Madni Prayer Times
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl px-4">
                {sections.map((section) => (
                    <Link
                        key={section.name}
                        href={"/" + section.href.replace(/^\//, "")}
                        className="group bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                        <span className="text-4xl mb-2">{section.icon}</span>
                        <span className="text-xl font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {section.name}
                        </span>
                        <span className="text-gray-500 text-sm text-center">
                            {section.desc}
                        </span>
                    </Link>
                ))}
            </div>
        </main>
    );
}
