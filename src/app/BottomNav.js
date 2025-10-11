"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    { name: "Jamat Times", href: "/jamat-times", icon: FaPeopleArrows },
    { name: "Elan Nama", href: "/notice", icon: FaMicrophone },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Hide on admin pages
    if (pathname.startsWith("/admin")) return null;

    return (
        <nav
            className="md:hidden sticky bottom-0 inset-x-0 z-50 flex px-2 py-2 h-16 bg-white/95 dark:bg-neutral-900/95 border-t border-gray-200 dark:border-gray-700 backdrop-blur-lg shadow-lg"
            role="navigation"
            aria-label="Bottom Navigation"
            style={{ position: "sticky", bottom: 0 }}
        >
            {items.map((item) => {
                const ActiveIcon = item.icon;
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col justify-center items-center flex-1 text-xs font-medium gap-1 py-1 px-1 rounded-lg transition-all duration-200 ${
                            active
                                ? "text-primary bg-primary/10 scale-95"
                                : "text-gray-600 dark:text-gray-400 hover:text-primary active:scale-95"
                        }`}
                        aria-label={item.name}
                    >
                        <ActiveIcon
                            className={`text-xl transition-all duration-200 ${
                                active ? "scale-110 text-primary" : "scale-100"
                            }`}
                        />
                        <span
                            className={`leading-none text-[10px] font-medium truncate transition-all duration-200 ${
                                active ? "text-primary" : ""
                            }`}
                        >
                            {item.name}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
