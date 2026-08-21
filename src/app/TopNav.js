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
    FaStore,
    FaBriefcase,
    FaUsers,
    FaStarAndCrescent,
    FaFileAlt,
    FaMosque

} from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { CalendarRange } from "lucide-react";
import TasbihSvgIcon from "../components/TasbihSvgIcon";

const navLinks = [
    { name: "Home", href: "/", icon: <FaHome className="text-lg text-white" /> },
    {
        name: "Jama'at Times",
        href: "/jamat-times",
        icon: <FaPeopleArrows className="text-lg text-pink-500" />,
    },
    {
        name: "Events & Programs",
        href: "/events",
        icon: <CalendarRange className="text-lg text-rose-500" />,
    },
    {
        name: "Prayer Times",
        href: "/prayer-times",
        icon: <FaClock className="text-lg text-yellow-500" />,
    },
    {
        name: "Qibla",
        href: "/qibla",
        icon: <FaRegCompass className="text-lg text-blue-400" />,
    },
    { name: "Quran", href: "/quran", icon: <FaQuran className="text-lg text-green-400" /> },
    {
        name: "Tasbih",
        href: "/tasbih",
        icon: <TasbihSvgIcon className="w-6 h-6" />,
    },
    { name: "Zikr", href: "/zikr", icon: <img src="/iconZikr.png" alt="Zikr" className="w-6 h-6 object-contain bg-white rounded-full p-0.5" /> },
    { name: "Rewards", href: "/rewards", icon: <FaGift className="text-lg text-red-400" /> },
    {
        name: "Aelaan Naama",
        href: "/notice",
        icon: <FaMicrophone className="text-lg text-sky-400" />,
    },
    {
        name: "Raahe Tijarat",
        href: "/local-stores",
        icon: <FaStore className="text-lg text-emerald-400" />,
    },
    { name: "Job Portal", href: "/jobPortal/jobLists", icon: <FaBriefcase className="text-lg text-purple-400" /> },
    {
        name: "Masjid Committee",
        href: "/committee",
        icon: <FaUserGroup className="text-lg text-indigo-400" />,
    },
    {
        name: "All Masjids",
        href: "/masjidLists",
        icon: <FaMosque className="text-lg text-teal-400" />,
    },
    {
        name: "Contact Us",
        href: "/contactUs",
        icon: <FaRegIdBadge className="text-lg text-amber-400" />,
    },
    {
        name: "Privacy Policy",
        href: "/privacy",
        icon: <FaFileAlt className="text-lg text-slate-400" />,
    },
    {
        name: "My Profile",
        href: "/myProfile",
        icon: <FaUser className="text-lg text-cyan-500" />,
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

    // Desktop nav: collapsed = single scrollable row, expanded = wraps to show all items
    const [navExpanded, setNavExpanded] = React.useState(false);

    // Close mobile nav when route changes
    React.useEffect(() => {
        setMobileOpen(false);
        setNavExpanded(false);
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
                } bg-base-100 backdrop-blur border-b border-base-300 shadow-sm rounded-2xl`}
        >
            <div className="w-full px-4 lg:px-8 py-2 mt-6 flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <img
                        src="/logo.png"
                        alt="Raah-e-Hidayat Logo"
                        className="w-10 h-10 object-contain"
                    />
                    <span className="hidden lg:inline text-sm font-semibold tracking-wide text-base-content whitespace-nowrap">
                        Raah-e-Hidayat
                    </span>
                </Link>

                <ul
                    id="desktop-nav-list"
                    className={`hidden md:flex items-center gap-1.5 flex-1 min-w-0 py-1 ${navExpanded
                            ? "flex-wrap"
                            : "flex-nowrap overflow-x-auto no-scrollbar"
                        }`}
                >
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.name} className="relative group list-none flex-shrink-0">
                                <a
                                    href={link.href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md
                                        ${isActive
                                            ? "bg-primary text-primary-content border-primary shadow-md"
                                            : "bg-base-200/60 text-base-content border-base-300 hover:bg-primary hover:text-primary-content hover:border-primary"
                                        }
                                    `}
                                >
                                    <span
                                        className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${isActive
                                                ? "bg-primary-content/20"
                                                : "bg-base-100 group-hover:bg-primary-content/20"
                                            }`}
                                    >
                                        {link.icon}
                                    </span>
                                    <span>{link.name}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>

                <button
                    type="button"
                    aria-expanded={navExpanded}
                    aria-controls="desktop-nav-list"
                    onClick={() => setNavExpanded((s) => !s)}
                    title={navExpanded ? "Collapse menu" : "Expand menu"}
                    className="hidden md:flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 border border-base-300 bg-base-200/60 text-base-content hover:bg-primary hover:text-primary-content hover:border-primary transition-all duration-200"
                >
                    <svg
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        className={`transition-transform duration-300 ${navExpanded ? "rotate-180" : ""}`}
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </button>

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
                        className="fixed top-12 right-0 w-54 bg-base-100 shadow-2xl z-50 h-screen-100 flex flex-col rounded-2xl overflow-hidden"
                        style={{
                            // use preserve-3d/backface-visibility and a short transform transition
                            transformStyle: "preserve-3d",
                            backfaceVisibility: "hidden",
                            transition: "transform .35s",
                            // dynamic open/closed states
                            transform: mobileOpen
                                ? "translateX(0)"
                                : "translateX(100%)",
                            opacity: mobileOpen ? 1 : 0,
                            pointerEvents: mobileOpen ? "auto" : "none",
                        }}
                    >
                        {/* Menu items */}
                        <ul className="menu p-3 flex-1 overflow-y-auto">
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

                    {/* Backdrop overlay */}
                    {mobileOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40"
                            onClick={() => setMobileOpen(false)}
                            style={{
                                transition: "opacity .35s",
                            }}
                        />
                    )}
                </div>
            </div>
        </nav>
    );
}
