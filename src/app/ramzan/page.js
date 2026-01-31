"use client";

import Link from "next/link";
import { Calendar, Calculator, Heart } from "lucide-react";
import { FaAngleLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const ramzanSections = [
    {
        name: "Ramzan Time Table",
        href: "ramzan/time-table",
        icon: <Calendar className="w-10 h-10 lg:w-16 lg:h-16" />,
        description: "View Sehri & Iftar timings",
        gradient: "from-purple-500 to-pink-500",
        bgHover: "hover:bg-purple-600",
    },
    {
        name: "Zakat Calculator",
        href: "/ramzan/zakatCalc",
        icon: <Calculator className="w-10 h-10 lg:w-16 lg:h-16" />,
        description: "Calculate your Zakat amount",
        gradient: "from-green-500 to-teal-500",
        bgHover: "hover:bg-green-600",
    },
    {
        name: "Free Services",
        href: "/ramzan/freeService",
        icon: <Heart className="w-10 h-10 lg:w-16 lg:h-16" />,
        description: "Community support & services",
        gradient: "from-blue-500 to-cyan-500",
        bgHover: "hover:bg-blue-600",
    },
];

export default function RamzanPage() {
    const router = useRouter();

    return (
        <main
            className="flex min-h-screen flex-col items-start justify-start bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24 sm:pb-28 "
            style={{
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
            }}
        >
            <button
                className="flex items-center gap-2 mb-6 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            <header className="text-center mb-8 ">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2  ">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-white ">
                        Ramzan Mubarak
                    </span>
                </h1>
                <p className="text-lg sm:text-xl text-white-400 max-w-2xl mx-auto">
                    Special services for the blessed month
                </p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-6xl">
                {ramzanSections.map((section) => (
                    <Link
                        key={section.name}
                        href={section.href}
                        className={`group relative flex flex-col items-center justify-center gap-2 p-4 bg-[#243447] rounded-xl shadow-lg border border-[#2d3f54] hover:shadow-2xl transform transition-all duration-300 hover:scale-105 ${section.bgHover} active:scale-95 min-h-[160px]`}
                    >
                        {/* Icon with gradient background */}
                        <div className={`flex-shrink-0 p-2 rounded-full bg-gradient-to-r ${section.gradient}`}>
                            {section.icon}
                        </div>

                        {/* Title */}
                        <h2 className="text-base sm:text-xl font-bold text-center text-white transition-colors">
                            {section.name}
                        </h2>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-gray-300 text-center opacity-80 leading-tight">
                            {section.description}
                        </p>

                        {/* Decorative gradient line */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${section.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </Link>
                ))}
            </div>


        </main>
    );
}
