"use client";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    FaHome,
    FaPeopleArrows,
    FaQuran,
    FaClock,
    FaRegCompass,
    FaGift,
    FaMicrophone,
    FaRegIdBadge,
} from "react-icons/fa";

const navLinks = [

   

    { name: "Home", href: "/", icon: <FaHome className="text-lg" /> },
    {
        name: "Jamat Times",
        href: "/jamat-times",
        icon: <FaPeopleArrows className="text-lg" />,
    },
    { name: "Quran", href: "/quran", icon: <FaQuran className="text-lg" /> },
    {
        name: "Prayer Times",
        href: "/prayer-times",
        icon: <FaClock className="text-lg" />,
    },
    {
        name: "Qibla",
        href: "/qibla",
        icon: <FaRegCompass className="text-lg" />,
    },
    {
        name: "Tasbih",
        href: "/tasbih",
        icon: (
            <Image
                src="/tasbih.png"
                alt="Tasbih"
                width={18}
                height={18}
                className="w-4 h-4 object-cover"
            />
        ),
    },
    { name: "Rewards", href: "/rewards", icon: <FaGift className="text-lg" /> },
    {
        name: "Aelaan Naama",
        href: "/notice",
        icon: <FaMicrophone className="text-lg" />,
    },
    {
        name: "Contact Us",
        href: "/contactUs",
        icon: <FaRegIdBadge className="text-lg" />,
    },

];

export default function TopNav() {
    const pathname = usePathname();
    // Hide only on admin pages and login page
    const isAdmin = pathname.startsWith("/admin");
    const isLogin = pathname === "/login" || pathname.startsWith("/login/");
    const isNotice = pathname.startsWith("/notice");
    if (isAdmin || isLogin) return null;

    return (
        <nav
            className={`${
                isNotice ? "relative w-full" : "sticky top-0 z-50"
            } bg-base-100 backdrop-blur border-b border-base-300 shadow-sm`}
        >
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <span className="font-bold text-xl text-primary tracking-wide cursor-pointer">
                            RAAH-E-HIDAYAT{" "}
                        </span>
                    </Link>
                    <Image
                        src="/logo.png"
                        alt="Raah-e-Hidayat Logo"
                        width={40}
                        height={40}
                        className="w-auto h-auto object-contain"
                        priority
                    />
                </div>
                <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {navLinks.map((link) => (
                        <li key={link.name} className="relative group">
                            <a
                                href={link.href}
                                className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium text-base-content hover:bg-primary hover:text-primary-content transition-all duration-200 transform hover:scale-105
                                    ${
                                        pathname === link.href
                                            ? "bg-primary text-primary-content shadow-md"
                                            : ""
                                    }
                                `}
                            >
                                <span className="flex-shrink-0 text-sm xl:text-base">
                                    {link.icon}
                                </span>
                                <span className="whitespace-nowrap hidden xl:inline">
                                    {link.name}
                                </span>
                                <span className="whitespace-nowrap xl:hidden text-xs">
                                    {link.name.split(" ")[0]}
                                </span>
                            </a>
                            {/* Tooltip removed */}
                        </li>
                    ))}
                </ul>
                {/* Mobile dropdown */}
                <div className="md:hidden dropdown dropdown-end">
                    <label
                        tabIndex={0}
                        className="btn btn-circle btn-ghost hover:bg-primary hover:text-primary-content transition-all duration-300 transform hover:scale-110 hover:rotate-180"
                    >
                        <svg
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            className="transition-transform duration-300"
                        >
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-3 shadow-2xl bg-base-100 rounded-2xl w-52 mt-2 border border-base-300 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300 max-h-[calc(100vh-200px)] z-40"
                    >
                        {navLinks.map((link, index) => (
                            <li
                                key={link.name}
                                className="relative group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <a
                                    href={link.href}
                                    className={`text-base-content hover:bg-primary hover:text-primary-content transition-all duration-300 transform hover:scale-105 hover:translate-x-2 rounded-xl py-3 px-4 mb-1 relative overflow-hidden
                                        ${
                                            pathname === link.href
                                                ? "bg-primary text-primary-content font-bold shadow-md"
                                                : ""
                                        }
                                        animate-in slide-in-from-left-2 duration-300
                                    `}
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        {link.icon}
                                        {link.name}
                                    </span>
                                    {/* Animated background effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                </a>
                                {/* Mobile hover label */}
                                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-primary text-primary-content px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-lg scale-95 group-hover:scale-100">
                                    {link.name}
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-primary rotate-45"></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
