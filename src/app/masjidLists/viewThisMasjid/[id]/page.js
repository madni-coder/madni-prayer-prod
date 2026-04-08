"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAllMasjidContext } from "../../../../context/AllMasjidContext";
import AnimatedLooader from "../../../../components/animatedLooader";
import { FaMapMarkerAlt, FaPhoneAlt, FaUserTie, FaShareAlt, FaMapMarkedAlt, FaChevronLeft, FaCity } from "react-icons/fa";

export default function ViewThisMasjidPage({ params }) {
    const router = useRouter();
    // Unwrap the route params promise using 'use()'
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const { getById, masjids, fetchAll, loading } = useAllMasjidContext();
    const [masjid, setMasjid] = useState(null);
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLocalLoading(true);
            let found = getById(id);
            if (!found && masjids.length === 0) {
                // if we land directly on this page, fetch from api using context
                await fetchAll();
                // have to find it again after fetch
                found = getById(id);
            }
            if (found) {
                setMasjid(found);
            }
            setLocalLoading(false);
        }
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, masjids]);

    // Update masjid if it's found later in the context
    useEffect(() => {
        if (!masjid && !loading) {
            const found = getById(id);
            if (found) setMasjid(found);
        }
    }, [getById, id, loading, masjid]);

    if (loading || localLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-100">
                <AnimatedLooader message="Loading Masjid Details..." />
            </div>
        );
    }

    if (!masjid) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 text-base-content p-4">
                <h1 className="text-2xl font-bold text-base-content/80">Masjid Not Found</h1>
                <p className="text-neutral-500 mt-2 mb-6 text-center max-w-md">The masjid you are looking for does not exist or has been removed.</p>
                <button 
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-primary/20 text-primary rounded-xl border border-primary/50 hover:bg-primary/30 transition-all font-semibold flex items-center gap-2"
                >
                    <FaChevronLeft /> Go Back
                </button>
            </div>
        );
    }

    const mapUrl = masjid.pasteMapUrl || "";

    return (
        <main className="flex min-h-screen flex-col bg-base-100 text-base-content relative overflow-hidden" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
            
            {/* Soft decorative background glow top-right */}
            <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-[#1a3842] rounded-full blur-[120px] pointer-events-none opacity-40 translate-x-1/3 -translate-y-1/3" />

            {/* Main Content Container (Full Width) */}
            <div className="w-full px-4 sm:px-6 z-10 flex flex-col gap-6 pt-4">
                
                {/* Back Button */}
                <div style={{ alignSelf: "flex-start" }}>
                    <button
                        className="flex items-center gap-2 mb-2 mt-[-5] text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.back()}
                        aria-label="Go Back"
                    >
                        <FaChevronLeft className="text-sm" /> Back
                    </button>
                </div>

                {/* Top Area (Header) */}
                <div className="flex flex-col mt-[-30] text-center">
                    <h1 className="text-4xl font-extrabold text-primary mb-4 tracking-tight drop-shadow-sm break-words leading-tight">
                        {masjid.masjidName}
                    </h1>
                    <div className="flex flex-col gap-2">
                        {masjid.colony && (
                            <span className="inline-flex items-center gap-2 bg-base-200 px-3.5 py-1.5 rounded-md border border-base-300 text-sm text-base-content/80 shadow-sm self-start">
                                <FaMapMarkerAlt className="text-primary" /> 
                                {masjid.colony}
                                {masjid.city && `, ${masjid.city}`}
                            </span>
                        )}
                        {masjid.city && (
                            <span className="inline-flex items-center gap-2 bg-base-200 px-3.5 py-1.5 rounded-md border border-base-300 text-sm text-base-content/80 shadow-sm self-start">
                                <FaCity className="text-primary" /> {masjid.city}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2b3a40] to-transparent opacity-80" />

            {/* Details Content Container (Full Width) */}
            <div className="w-full px-6 sm:px-10 py-8 z-10 flex flex-col gap-10 pb-20">
                
                {/* LOCATION DATA */}
                <section>
                    <h2 className="text-[#64748b] text-[11px] font-bold tracking-[0.2em] uppercase mb-4 pl-1">
                        Location Data
                    </h2>
                    <div className="h-px w-full bg-[#1e2936] mb-5"></div>
                    
                    <div className="flex flex-col gap-5">
                        <div className="flex items-start gap-4 p-1">
                            <div className="mt-0.5 p-2.5 bg-[#1e2936] rounded-xl text-[#94a3b8] flex-shrink-0">
                                <FaMapMarkerAlt />
                            </div>
                            <div className="flex flex-col pt-0.5">
                                <span className="text-[#64748b] text-xs font-semibold mb-1">Full Address</span>
                                <span className="text-[#cbd5e1] text-sm leading-relaxed">
                                    {masjid.locality ? `${masjid.locality}, ` : ''}
                                    {masjid.colony}
                                    {masjid.city ? `, ${masjid.city}` : ''}
                                </span>
                            </div>
                        </div>

                        {mapUrl && (
                            <div className="flex items-start gap-4 p-1">
                                <div className="mt-0.5 p-2.5 bg-[#1e2936] rounded-xl text-[#60a5fa] flex-shrink-0">
                                    <FaMapMarkedAlt />
                                </div>
                                <div className="flex flex-col pt-0.5">
                                    <span className="text-[#64748b] text-xs font-semibold mb-1.5">Google Maps</span>
                                    <a 
                                        href={mapUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#60a5fa] hover:text-[#3b82f6] underline underline-offset-4 decoration-[#60a5fa]/40 transition-colors"
                                    >
                                        View on Map <FaShareAlt className="text-[10px] ml-0.5 mt-0.5" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* REPRESENTATIVE */}
                <section>
                    <h2 className="text-[#64748b] text-[11px] font-bold tracking-[0.2em] uppercase mb-4 pl-1">
                        Representative
                    </h2>
                    <div className="h-px w-full bg-[#1e2936] mb-5"></div>
                    
                    <div className="flex flex-col gap-5">
                        {!masjid.name && !masjid.mobile ? (
                            <p className="text-sm text-[#64748b] italic p-1">No representative contact info provided.</p>
                        ) : (
                            <>
                                {masjid.name && (
                                    <div className="flex items-start gap-4 p-1">
                                        <div className="mt-0.5 p-2.5 bg-[#1e2936] rounded-xl text-[#fbbf24] flex-shrink-0">
                                            <FaUserTie />
                                        </div>
                                        <div className="flex flex-col pt-0.5">
                                            <span className="text-[#64748b] text-xs font-semibold mb-1">Name</span>
                                            <span className="text-[#cbd5e1] text-sm">{masjid.name}</span>
                                            {masjid.role && <span className="text-[#64748b] text-xs mt-1">Role: {masjid.role}</span>}
                                        </div>
                                    </div>
                                )}
                                {masjid.mobile && (
                                    <div className="flex items-start gap-4 p-1">
                                        <div className="mt-0.5 p-2.5 bg-[#1e2936] rounded-xl text-[#34d399] flex-shrink-0">
                                            <FaPhoneAlt />
                                        </div>
                                        <div className="flex flex-col pt-0.5">
                                            <span className="text-[#64748b] text-xs font-semibold mb-1.5">Contact Number</span>
                                            <a href={`tel:${masjid.mobile}`} className="text-[#34d399] text-sm font-medium hover:underline underline-offset-4 decoration-[#34d399]/40 transition-all w-max py-0.5 px-0">
                                                {masjid.mobile}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* COMMITTEE MEMBERS */}
                {masjid.memberNames && masjid.memberNames.length > 0 && (
                    <section>
                        <h2 className="text-[#64748b] text-[11px] font-bold tracking-[0.2em] uppercase mb-4 pl-1">
                            Committee Members
                        </h2>
                        
                        <div className="flex flex-col gap-3">
                            {masjid.memberNames.map((memberName, idx) => {
                                const memberMobile = (masjid.mobileNumbers && masjid.mobileNumbers[idx]) || null;
                                return (
                                    <div key={idx} className="bg-[#172027]/80 rounded-[14px] p-4 flex flex-col sm:flex-row sm:items-center justify-between border border-[#1e2936]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
                                            <span className="text-sm font-semibold text-[#e2e8f0]">{memberName}</span>
                                        </div>
                                        {memberMobile && (
                                            <a href={`tel:${memberMobile}`} className="flex items-center gap-2 text-[#10b981] hover:text-[#059669] transition-colors ml-[18px] sm:ml-0 text-xs font-medium bg-[#10b981]/10 px-2.5 py-1.5 rounded-lg border border-[#10b981]/20 w-fit">
                                                <FaPhoneAlt className="text-[10px]" /> {memberMobile}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>

           
        </main>
    );
}
