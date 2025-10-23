"use client";

import Link from "next/link";
import {
    FaQuran,
    FaPeopleArrows,
    FaClock,
    FaRegCompass,
    FaGift,
    FaMicrophone,
    FaPhoneSquare,
} from "react-icons/fa";
import { Megaphone } from "lucide-react";
import Image from "next/image";

const sections = [
    {
        name: "Jama'at Times",
        href: "/jamat-times",
        icon: <FaPeopleArrows className="text-2xl text-pink-500" />,
    },
    {
        name: "Qibla Finder",
        href: "/qibla",
        icon: <FaRegCompass className="text-2xl text-blue-400" />,
    },
    {
        name: "Quran",
        href: "/quran",
        icon: <FaQuran className="text-2xl text-green-400" />,
    },
    {
        name: "Prayer Times",
        href: "/prayer-times",
        icon: <FaClock className="text-2xl text-yellow-500" />,
    },

    {
        name: "Tasbih Counter",
        href: "/tasbih",
        icon: (
            <Image
                src="/tasbih.png"
                alt="Tasbih Counter"
                width={24}
                height={24}
                className="w- h-8 object-cover"
            />
        ),
    },

    {
        name: "Rewards",
        href: "/rewards",
        icon: <FaGift className="text-2xl text-pink-500" />,
    },
    {
        name: "Aelaan Naama",
        href: "/notice",
        icon: <Megaphone className="text-3xl text-blue-400" />,
    },
    {
        name: "Contact Us",
        href: "/contactUs",
        icon: <FaPhoneSquare className="text-3xl text-orange-400" />,
    },
];

export default function Home() {
    return (
        <main
            className="flex min-h-screen flex-col items-center justify-center bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24 sm:pb-28"
            style={{
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6rem)",
            }}
        >
            <header className="text-center mb-10 ">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600">
                        RAAH-E-HIDAYAT{" "}
                    </span>{" "}
                </h1>
                <p className="mt-2 text-lg sm:text-xl text-white-400 max-w-2xl mx-auto">
                    Your essential companion for daily Islamic practices.
                </p>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl ">
                {sections.map((section) => (
                    <Link
                        key={section.name}
                        href={section.href}
                        className="group relative flex flex-col items-center justify-center gap-3 p-6 bg-[#243447] rounded-2xl shadow-lg border border-[#2d3f54] hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-green-600 dark:hover:bg-green-700 active:bg-green-600 dark:active:bg-green-800 focus:bg-green-600 dark:focus:bg-green-800 min-h-[140px] aspect-square"
                    >
                        <div className="flex-shrink-0 p-1 rounded-full bg-[#1e2f3f] mb-1">
                            {section.icon}
                        </div>
                        <h2 className="text-base font-semibold text-center text-white transition-colors">
                            {section.name}
                        </h2>
                    </Link>
                ))}
            </div>
        </main>
    );
}
