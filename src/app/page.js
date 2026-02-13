"use client";

import { useState } from "react";
import CardLink from "../components/CardLink.client";
import AnimatedLooader from "../components/animatedLooader";
import {
    FaQuran,
    FaPeopleArrows,
    FaClock,
    FaRegCompass,
    FaGift,
    FaMicrophone,
    FaPhoneSquare,
    FaHandPointRight, FaUser, FaStore, FaBriefcase,
} from "react-icons/fa";
import { Megaphone } from "lucide-react";
import Image from "next/image";
import TasbihSvgIcon from "../components/TasbihSvgIcon";

const sections = [
    {
        name: "Jama'at Times",
        href: "/jamat-times",
        icon: <FaPeopleArrows className="text-2xl lg:text-5xl text-pink-500" />,
    },
    {
        name: "Qibla Finder",
        href: "/qibla",
        icon: <FaRegCompass className="text-2xl lg:text-5xl text-blue-400" />,
    },
    {
        name: "Quran",
        href: "/quran",
        icon: <FaQuran className="text-2xl lg:text-5xl text-green-400" />,
    },
    {
        name: "Prayer Times",
        href: "/prayer-times",
        icon: <FaClock className="text-2xl lg:text-5xl text-yellow-500" />,
    },

    {
        name: "Tasbih Counter",
        href: "/tasbih",
        icon: <TasbihSvgIcon className="w-12 h-12 lg:w-24 lg:h-24" />,
    },
    {
        name: "Zikr",
        href: "/zikr",
        icon: (
            <img src="/iconZikr.png" alt="Zikr" className="w-10 h-10 object-contain bg-white rounded-full p-0.5" />
        ),
    },
    {
        name: "Rewards",
        href: "/rewards",
        icon: <FaGift className="text-2xl lg:text-5xl text-pink-500" />,
    },
    {
        name: "Aelaan Naama",
        href: "/notice",
        icon: <Megaphone className="text-3xl lg:text-6xl text-blue-400" />,
    },
    {
        name: "Contact Us",
        href: "/contactUs",
        icon: (
            <FaPhoneSquare className="text-3xl lg:text-6xl text-orange-400" />
        ),
    },


    {
        name: "My Profile",
        href: "/myProfile",
        icon: (
            <FaUser className="text-3xl lg:text-6xl text-cyan-500" />
        ),
    },
    {
        name: "Olmaa's Stores",
        href: "/local-stores",
        icon: (
            <FaStore className="text-3xl lg:text-6xl text-emerald-400" />
        ),
    },
    {
        name: "Job Portal",
        href: "/jobPortal/viewJobs",
        icon: (
            <FaBriefcase className="text-3xl lg:text-6xl text-purple-400" />
        ),
    },

];

export default function Home() {
    const [showLoader, setShowLoader] = useState(false);

    return (
        <main
            className="flex min-h-screen flex-col items-center justify-center bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24 sm:pb28"
            style={{
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
            }}
        >
            <header className="text-center mb-10 ">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600">
                        RAAH-E-HIDAYAT{" "}
                    </span>{" "}
                </h1>
                <CardLink
                    href="/ramzan"
                    className="mt-2 text-lg sm:text-xl max-w-2xl mx-auto inline-block font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white shadow-sm hover:shadow-md transform transition-all duration-200 hover:scale-105 cursor-pointer"
                    onDelayedShow={setShowLoader}
                >
                    <span className="inline-flex items-center">
                        <FaHandPointRight className="mr-2 text-xl lg:text-2xl" />
                        Ramzan Special
                    </span>
                </CardLink>
            </header>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl ">
                {sections.map((section) => (
                    <CardLink
                        key={section.name}
                        href={section.href}
                        className="group relative flex flex-col items-center justify-center gap-3 p-6 bg-[#243447] rounded-2xl shadow-lg border border-[#2d3f54] hover:shadow-xl transform transition-all duration-300 hover:scale-105 hover:bg-green-600 dark:hover:bg-green-700 active:bg-green-600 dark:active:bg-green-800 focus:bg-green-600 dark:focus:bg-green-800 min-h-[140px] aspect-square"
                        onDelayedShow={setShowLoader}
                    >
                        <div className="flex-shrink-0 p-1 rounded-full bg-[#1e2f3f] mb-1">
                            {section.icon}
                        </div>
                        <h2 className="text-base font-semibold text-center text-white transition-colors">
                            {section.name}
                        </h2>
                    </CardLink>
                ))}
            </div>
            {showLoader && <AnimatedLooader message="Please wait..." />}
        </main>
    );
}
