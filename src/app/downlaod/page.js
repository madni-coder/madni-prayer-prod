"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    FaAngleLeft,
    FaGooglePlay,
    FaApple,
    FaClock,
    FaCompass,
    FaBookOpen,
    FaStar,
} from "react-icons/fa";
import { GiPrayerBeads } from "react-icons/gi";

const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.prayer.madni";
const IOS_URL = "https://apps.apple.com/in/app/raahe-hidayat/id6758713059";

const FEATURES = [
    { icon: FaClock, label: "Prayer & Jamat Times" },
    { icon: FaCompass, label: "Qibla Finder" },
    { icon: FaBookOpen, label: "Read Quran" },
    { icon: GiPrayerBeads, label: "Tasbih Counter" },
];

export default function DownloadPage() {
    const router = useRouter();

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />

            <div className="relative container mx-auto px-4 py-10 max-w-4xl">
                <div className="mb-4 flex items-center">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-primary/80 font-semibold"
                        onClick={() => router.push("/")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>
                </div>

                {/* Hero */}
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="relative inline-flex items-center justify-center mb-7">
                        <div className="absolute inset-0 rounded-[28px] bg-primary/40 blur-2xl animate-dl-glow" />
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-[28px] overflow-hidden ring-2 ring-primary/40 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-dl-float">
                            <Image
                                src="/mosqueLogo.png"
                                alt="Raahe Hidayat"
                                width={112}
                                height={112}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1 mb-5 ring-1 ring-primary/20">
                        <FaStar className="text-[10px]" /> Official App
                    </span>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-primary mb-5">
                        Download Our App
                    </h1>

                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                        Get the <span className="text-foreground font-semibold">Raahe Hidayat</span> app for faster
                        access, offline features, and prayer time notifications right on your phone.
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-8 w-full max-w-sm">
                        {FEATURES.map(({ icon: Icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 rounded-xl bg-card ring-1 ring-primary/15 px-3 py-2.5 text-xs sm:text-sm font-medium text-card-foreground shadow-sm"
                            >
                                <Icon className="text-primary shrink-0" />
                                <span className="truncate">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <a
                        href={ANDROID_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-2xl p-[1.5px] bg-gradient-to-br from-primary/60 via-primary/10 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="rounded-2xl bg-card h-full p-6 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                    <FaGooglePlay />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-primary">Android Users</h2>
                                <p className="text-sm text-muted-foreground mt-1">Download from Google Play</p>
                            </div>
                            <div className="relative mt-1 w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 border border-white/10 group-hover:border-primary/40 transition-colors">
                                <span className="absolute inset-y-0 left-0 w-1/3 bg-white/10 animate-dl-shine" />
                                <FaGooglePlay className="text-white shrink-0" size={18} />
                                <span className="flex flex-col items-start leading-tight">
                                    <span className="text-[9px] text-white/70 tracking-wide">GET IT ON</span>
                                    <span className="text-sm font-bold text-white">Google Play</span>
                                </span>
                            </div>
                        </div>
                    </a>

                    <a
                        href={IOS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-2xl p-[1.5px] bg-gradient-to-br from-primary/60 via-primary/10 to-transparent shadow-[0_10px_30px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="rounded-2xl bg-card h-full p-6 flex flex-col items-center text-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                                    <FaApple />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg md:text-xl font-bold text-primary">iPhone Users</h2>
                                <p className="text-sm text-muted-foreground mt-1">Download from the App Store</p>
                            </div>
                            <div className="relative mt-1 w-full overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 border border-white/10 group-hover:border-primary/40 transition-colors">
                                <span className="absolute inset-y-0 left-0 w-1/3 bg-white/10 animate-dl-shine" />
                                <FaApple className="text-white shrink-0" size={20} />
                                <span className="flex flex-col items-start leading-tight">
                                    <span className="text-[9px] text-white/70 tracking-wide">Download on the</span>
                                    <span className="text-sm font-bold text-white">App Store</span>
                                </span>
                            </div>
                        </div>
                    </a>
                </div>

                <div className="my-10" />

                <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-card to-primary/10 ring-1 ring-primary/15 shadow-sm">
                    <div className="p-6 text-center">
                        <p className="text-muted-foreground">
                            Need help? <Link href="/contactUs" className="text-primary hover:underline font-semibold">Contact Us</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
