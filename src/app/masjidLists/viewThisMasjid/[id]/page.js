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

    const excludedFields = ['password', 'createdAt', 'updatedAt', 'created_at', 'updated_at', 'id', 'committeeImage', 'committeeImages'];

    const renderField = (label, value) => {
        if (!value) return null;
        return (
            <div className="py-3 px-4 bg-slate-800/30 rounded-lg">
                <div className="text-xs text-emerald-400 uppercase tracking-wider mb-1 break-words">{label}</div>
                <div className="text-white font-medium break-words whitespace-pre-wrap">{String(value)}</div>
            </div>
        );
    };

    return (
        <main className="flex min-h-screen flex-col bg-[#0f172a] text-white relative overflow-hidden" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
            
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
                   
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2b3a40] to-transparent opacity-80" />

            {/* Details Content Container (Full Width) */}
            <div className="w-full px-4 sm:px-6 py-8 z-10 flex flex-col pb-20">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderField("Colony", masjid.colony)}
                        {renderField("City", masjid.city)}
                        {renderField("Imam Name", masjid.imaamName)}
                        {renderField("Moizzan Name", masjid.moizzanName)}
                        {renderField("Mutawalli Name", masjid.mutwalliName || masjid.name || (masjid.memberNames && masjid.memberNames.length > 0 ? masjid.memberNames[0] : null))}
                        {renderField("Mobile Number", masjid.mobile || "—")}
                        {renderField("Committee Members", masjid.memberNames && Array.isArray(masjid.memberNames) && masjid.memberNames.length > 0 ? masjid.memberNames.join(', ') : masjid.committeeMembers)}
                        {renderField("Committee Mobile Numbers", masjid.mobileNumbers && Array.isArray(masjid.mobileNumbers) && masjid.mobileNumbers.length > 0 ? masjid.mobileNumbers.join(', ') : (masjid.phone || masjid.contactNumber))}

                        {/* Show any remaining fields that aren't in excluded list */}
                        {Object.keys(masjid).filter(k => 
                            !excludedFields.includes(k) && 
                            !['masjidName', 'name', 'mobileNumbers', 'mobile', 'phone', 'contactNumber', 
                              'fullAddress', 'address', 'city', 'colony', 'locality', 'mutwalliName', 'committeeMembers', 'memberNames', 
                              'imaamName', 'moizzanName', 'masjidId', 'loginId', 'committeeImage',
                              'fazar', 'zuhar', 'asar', 'maghrib', 'isha', 'juma', 
                              'role', 'pasteMapUrl'].includes(k) &&
                            masjid[k] !== undefined && 
                            masjid[k] !== null &&
                            masjid[k] !== "" &&
                            !(Array.isArray(masjid[k]) && masjid[k].length === 0)
                        ).map(key => 
                            renderField(
                                key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), 
                                masjid[key]
                            )
                        )}
                    </div>
                </div>

                {mapUrl && (
                    <div className="mt-6 flex justify-center">
                        <button 
                            onClick={async (e) => {
                                e.preventDefault();
                                if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
                                    try {
                                        const { open } = await import('@tauri-apps/plugin-shell');
                                        await open(mapUrl);
                                        return;
                                    } catch (err) {
                                        console.error("Failed to open URL using Tauri:", err);
                                    }
                                }
                                window.open(mapUrl, '_blank', 'noopener,noreferrer');
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-warning/80 text-white rounded-xl border border-blue-500/30 hover:bg-blue-600/30 transition-all font-semibold cursor-pointer"
                        >
                            <FaMapMarkedAlt /> See Location Of This Masjid
                        </button>
                    </div>
                )}
            </div>

           
        </main>
    );
}
