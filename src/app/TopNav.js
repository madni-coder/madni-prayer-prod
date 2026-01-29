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
    FaUser,
} from "react-icons/fa";
import TasbihSvgIcon from "../components/TasbihSvgIcon";

const navLinks = [
    { name: "Home", href: "/", icon: <FaHome className="text-lg" /> },
    {
        name: "Jama'at Times",
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
        icon: <TasbihSvgIcon className="w-6 h-6" />,
    },
    { name: "Zikr", href: "/zikr", icon: <img src="/iconZikr.png" alt="Zikr" className="w-6 h-6 object-contain bg-white rounded-full p-0.5" /> },
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
    const pathname = usePathname() || "";
    const [forceHidden, setForceHidden] = React.useState(false);

    // Hide nav when the Quran reader modal marks the body
    React.useEffect(() => {
        if (typeof document === "undefined") return;
        const update = () =>
            setForceHidden(
                document.body?.classList?.contains("bottom-nav-hidden")
            );
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    // New: control mobile nav open state for 3D animation
    const [mobileOpen, setMobileOpen] = React.useState(false);

    // Close mobile nav when route changes
    React.useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Close on Escape
    React.useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") setMobileOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    // Hide only on admin pages and login page
    const isAdmin = pathname.startsWith("/admin");
    const isLogin = pathname === "/login" || pathname.startsWith("/login/");
    const isNotice = pathname.startsWith("/notice");
    const isPdfViewer = pathname.startsWith("/pdf-viewer");
    if (isAdmin || isLogin || isPdfViewer || forceHidden) return null;

    return (
        <nav
            data-app-top-nav
            className={`${isNotice ? "relative w-full z-50" : "sticky top-0 z-50"
                } bg-base-100 backdrop-blur border-b border-base-300 shadow-sm`}
        >
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2 mt-10">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <img
                            src="/logo.png"
                            alt="Raah-e-Hidayat Logo"
                            className="w-30 h-auto object-contain"
                        />
                    </Link>
                </div>

                <ul className="hidden lg:flex items-center gap-1 xl:gap-2">
                    {navLinks.map((link) => (
                        <li key={link.name} className="relative group">
                            <a
                                href={link.href}
                                className={`flex items-center gap-1 xl:gap-2 px-2 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium text-base-content hover:bg-primary hover:text-primary-content transition-all duration-200 transform hover:scale-105
                                    ${pathname === link.href
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

                {/* Mobile dropdown - replaced with controlled 3D animated menu */}
                <div
                    className="md:hidden relative"
                    // perspective for 3D effect
                    style={{ perspective: 1000 }}
                >
                    <button
                        type="button"
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-nav"
                        onClick={() => setMobileOpen((s) => !s)}
                        className="btn btn-circle btn-ghost hover:bg-primary hover:text-primary-content transition-all duration-300 transform"
                    >
                        <svg
                            width="24"
                            height="24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            className={`transition-transform duration-500 transform ${mobileOpen ? "rotate-180 scale-110" : ""
                                }`}
                        >
                            <path d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Animated menu panel */}
                    <div
                        id="mobile-nav"
                        role="menu"
                        className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl border border-base-300 bg-base-100 shadow-2xl z-40 overflow-hidden"
                        style={{
                            // use preserve-3d/backface-visibility and a short transform transition
                            transformStyle: "preserve-3d",
                            backfaceVisibility: "hidden",
                            transition: "transform .35s",
                            // dynamic open/closed states
                            transform: mobileOpen
                                ? "rotateX(0deg) translateY(0) translateZ(0) scale(1)"
                                : "rotateX(-18deg) translateY(-8px) translateZ(-30px) scale(0.98)",
                            opacity: mobileOpen ? 1 : 0,
                            pointerEvents: mobileOpen ? "auto" : "none",
                        }}
                    >
                        <ul className="menu p-3 max-h-[calc(100vh-200px)]">
                            {navLinks.map((link, index) => (
                                <li
                                    key={link.name}
                                    className="relative group"
                                    style={{
                                        // subtle stagger using transitionDelay per item
                                        transition:
                                            "transform 360ms ease, opacity 300ms ease",
                                        transform: mobileOpen
                                            ? "translateZ(0) translateX(0)"
                                            : "translateZ(-20px) translateX(-6px)",
                                        opacity: mobileOpen ? 1 : 0,
                                        transitionDelay: `${index * 40}ms`,
                                    }}
                                >
                                    <a
                                        href={link.href}
                                        className={`text-base-content hover:bg-primary hover:text-primary-content transition-all duration-300 transform hover:scale-105 hover:translate-x-2 rounded-xl py-3 px-4 mb-1 relative overflow-hidden
                                            ${pathname === link.href
                                                ? "bg-primary text-primary-content font-bold shadow-md"
                                                : ""
                                            }`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            {link.icon}
                                            {link.name}
                                        </span>
                                        {/* Animated background effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}
