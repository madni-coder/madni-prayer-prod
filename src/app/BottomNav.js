"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
    FaQuran,
    FaRegCompass,
    FaClock,
    FaGift,
    FaMicrophone,
    FaHome,
    FaPray,
    FaCog,
    FaPeopleArrows,
    FaSpinner,
    FaNewspaper,
} from "react-icons/fa";

// Define the main 5 nav items for the bottom bar
const items = [
    { name: "Home", href: "/", icon: FaHome },
    { name: "Prayer Times", href: "/prayer-times", icon: FaClock },
    { name: "Tasbih", href: "/tasbih", icon: FaSpinner },
    { name: "Jama'at Times", href: "/jamat-times", icon: FaPeopleArrows },
    { name: "Elan Nama", href: "/notice", icon: FaMicrophone },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [activeRipple, setActiveRipple] = useState(null);
    const [forceHidden, setForceHidden] = useState(false);

    // Hide nav when the Quran reader modal marks the body
    useEffect(() => {
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

    const handleItemClick = (itemName) => {
        setActiveRipple(itemName);
        setTimeout(() => setActiveRipple(null), 600);
    };

    const isActive = (href) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    // Hide on admin pages
    if (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/pdf-viewer") ||
        forceHidden
    )
        return null;

    return (
        <nav
            data-app-bottom-nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex px-2 py-2 h-16 bg-neutral-900/95 border-t border-gray-700 backdrop-blur-lg shadow-lg"
            role="navigation"
            aria-label="Bottom Navigation"
            style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        >
            {items.map((item) => {
                const ActiveIcon = item.icon;
                const active = isActive(item.href);
                const hasRipple = activeRipple === item.name;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => handleItemClick(item.name)}
                        className={`relative overflow-hidden flex flex-col justify-center items-center flex-1 text-xs font-medium gap-1 py-1 px-1 rounded-lg transition-all duration-300 ${active
                                ? "text-green-400 bg-green-400/10 scale-95 shadow-lg"
                                : "text-gray-200 hover:text-green-400 hover:bg-green-400/5 active:scale-95 hover:shadow-md"
                            } ${hasRipple ? "animate-pulse" : ""}`}
                        aria-label={item.name}
                    >
                        {/* Ripple Effect */}
                        {hasRipple && (
                            <div className="absolute inset-0 bg-green-400/20 rounded-lg animate-ping" />
                        )}

                        <ActiveIcon
                            className={`text-xl transition-all duration-300 transform ${active
                                    ? "scale-110 text-green-400 drop-shadow-sm"
                                    : "scale-100 hover:scale-105 hover:text-green-400"
                                } ${hasRipple ? "animate-bounce" : ""}`}
                        />
                        <span
                            className={`leading-none text-[10px] font-medium truncate transition-all duration-300 ${active
                                    ? "text-green-400 font-semibold"
                                    : "text-gray-200 hover:text-green-400"
                                } ${hasRipple ? "animate-pulse" : ""}`}
                        >
                            {item.name}
                        </span>

                        {/* Active indicator */}
                        {active && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-green-400 rounded-full animate-fadeIn" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
