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
        <main className="min-h-screen flex flex-col items-center justify-center bg-base-100 font-mono">
            <h1 className="text-5xl font-extrabold mb-10 text-primary tracking-widest retro-title">
                Madni Prayer Times
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl px-4">
                {sections.map((section) => (
                    <Link
                        key={section.name}
                        href={"/" + section.href.replace(/^\//, "")}
                        className="group bg-base-200 border-4 border-primary rounded-lg shadow-lg p-8 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:bg-base-300 cursor-pointer retro-card"
                    >
                        <span className="text-5xl mb-3 text-secondary drop-shadow-sm">
                            {section.icon}
                        </span>
                        <span className="text-2xl font-bold mb-2 text-base-content group-hover:text-primary transition-colors retro-label">
                            {section.name}
                        </span>
                        <span className="text-base-content text-base text-center retro-desc">
                            {section.desc}
                        </span>
                    </Link>
                ))}
            </div>
            <style jsx global>{`
                .retro-title {
                    font-family: "Courier New", Courier, monospace;
                    letter-spacing: 0.15em;
                    text-shadow: 2px 2px 0 #ffd180, 4px 4px 0 #8d6e63;
                }
                .retro-card {
                    box-shadow: 0 4px 0 #8d6e63, 0 8px 0 #ffd180;
                }
                .retro-label {
                    font-family: "Courier New", Courier, monospace;
                }
                .retro-desc {
                    font-family: "Courier New", Courier, monospace;
                }
            `}</style>
        </main>
    );
}
