"use client";

import Link from "next/link";
import {
    FaQuran,
    FaCog,
    FaPeopleArrows,
    FaClock,
    FaRegCompass,
    FaGift,
    FaMicrophone,
    FaUsers,
} from "react-icons/fa";
import Image from "next/image";

const sections = [
    {
        name: "Jamat Times",
        href: "/jamat-times",
        icon: <FaPeopleArrows className="text-4xl text-pink-500" />,
        desc: "View local mosque prayer schedules.",
    },
    {
        name: "Qibla Finder",
        href: "/qibla",
        icon: <FaRegCompass className="text-4xl text-blue-400" />,
        desc: "Find the direction of the Qibla.",
    },
    {
        name: "Quran",
        href: "/quran",
        icon: <FaQuran className="text-4xl text-green-400" />,
        desc: "Read, listen, and search the Holy Quran.",
    },
    {
        name: "Prayer Times",
        href: "/prayer-times",
        icon: <FaClock className="text-4xl text-yellow-500" />,
        desc: "Get accurate daily prayer times.",
    },

    {
        name: "Tasbih Counter",
        href: "/tasbih",
        icon: (
            <Image
                src="/tasbih.png"
                alt="Tasbih Counter"
                width={40}
                height={40}
                className="w-10 h-10 object-cover"
            />
        ),
        desc: "A digital tasbih to track your dhikr.",
    },

    {
        name: "Rewards",
        href: "/rewards",
        icon: <FaGift className="text-4xl text-pink-500" />,
        desc: "Track your spiritual achievements and milestones.",
    },
    {
        name: "Aelaan Naama",
        href: "/notice",
        icon: <FaMicrophone className="text-4xl text-blue-400" />,
        desc: "View important updates and announcements.",
    },
    {
        name: "Contact Us",
        href: "/contactUs",
        icon: <span className="text-4xl">📞</span>,
        desc: "Get in touch with our support team.",
    },
];

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#09152a] text-gray-200 p-4 sm:p-6">
            <header className="text-center mb-10 mt-10">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600">
                        RAAH-E-HIDAYAT{" "}
                    </span>{" "}
                </h1>
                <p className="mt-2 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                    Your essential companion for daily Islamic practices.
                </p>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
                {sections.map((section) => (
                    <Link
                        key={section.name}
                        href={section.href}
                        className="group relative flex flex-col items-center gap-3 p-6 bg-[#243447] rounded-2xl shadow-lg border border-[#2d3f54] hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-green-600 dark:hover:bg-green-700 active:bg-green-600 dark:active:bg-green-800 focus:bg-green-600 dark:focus:bg-green-800"
                    >
                        <div className="flex-shrink-0 p-3 rounded-full bg-[#1e2f3f] mb-2">
                            {section.icon}
                        </div>
                        <h2 className="text-xl font-semibold mb-1 text-center text-white group-hover:text-white-400 group-active:text-white-400 group-focus:text-white-400 transition-colors">
                            {section.name}
                        </h2>
                        <p className="text-sm text-gray-400 text-center">
                            {section.desc}
                        </p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
