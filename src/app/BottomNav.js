// filepath: /Volumes/Office Work/prayer/my-next-app/src/app/BottomNav.js
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
} from "react-icons/fa";

// Define the nav items you want in the bottom bar (keep it concise for mobile)
const items = [
    { name: "Home", href: "/", icon: FaHome },
    { name: "Jamat Times", href: "/jamat-times", icon: FaPeopleArrows },
    { name: "Quran", href: "/quran", icon: FaQuran },
    { name: "Prayer Times", href: "/prayer-times", icon: FaClock },
    { name: "Qibla", href: "/qibla", icon: FaRegCompass },
    { name: "Tasbih", href: "/tasbih", icon: FaSpinner },
    { name: "Rewards", href: "/rewards", icon: FaGift },
    { name: "Aelaan Naama", href: "/notice", icon: FaMicrophone },
    { name: "Settings", href: "/settings", icon: FaCog },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Hide on admin pages
    if (pathname.startsWith("/admin")) return null;

    return (
        <nav
            className="md:hidden sticky bottom-0 inset-x-0 z-50 flex px-4 py-2 h-16 overflow-x-auto no-scrollbar gap-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 bg-white/30 dark:bg-neutral-900/25 border-t border-white/30 dark:border-white/10 shadow-[0_-2px_18px_-4px_rgba(0,0,0,0.45)] relative w-full"
            role="navigation"
            aria-label="Bottom Navigation"
        >
            <span className="pointer-events-none absolute -top-px inset-x-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />
            {items.map((item) => {
                const ActiveIcon = item.icon;
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex flex-col justify-center items-center min-w-[68px] flex-1 text-[11px] font-medium gap-1 rounded-xl transition-all relative focus:outline-none focus-visible:ring focus-visible:ring-primary/40 ${
                            active
                                ? "text-primary bg-white/40 dark:bg-white/10 shadow-inner ring-1 ring-white/50 dark:ring-white/20 backdrop-blur-md"
                                : "text-base-content/70 hover:text-primary hover:bg-white/20 hover:backdrop-blur-sm"
                        }`}
                        aria-label={item.name}
                    >
                        <ActiveIcon
                            className={`text-lg transition-transform drop-shadow-sm ${
                                active ? "scale-110" : "scale-100"
                            }`}
                        />
                        <span className="leading-none text-[10px] truncate max-w-[72px] px-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                            {item.name}
                        </span>
                        {active && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary/90 shadow ring-2 ring-white/60 dark:ring-white/20 rounded-full animate-pulse" />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
