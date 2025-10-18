"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Qibla() {
    const router = useRouter();
    const needleRef = useRef(null);
    const [angle, setAngle] = useState(270); // Fixed to west
    const [deviceHeading, setDeviceHeading] = useState(null);
    const [bearing, setBearing] = useState(null);
    const [isSensorAvailable, setIsSensorAvailable] = useState(false);
    const [useManual, setUseManual] = useState(false);

    const normalize = useCallback((n) => ((n % 360) + 360) % 360, []);

    const computeBearing = useCallback(
        (lat1, lon1, lat2, lon2) => {
            const toRad = (d) => (d * Math.PI) / 180;
            const toDeg = (r) => (r * 180) / Math.PI;
            const φ1 = toRad(lat1);
            const φ2 = toRad(lat2);
            const λ1 = toRad(lon1);
            const λ2 = toRad(lon2);
            const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
            const x =
                Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
            return normalize(toDeg(Math.atan2(y, x)));
        },
        [normalize]
    );

    useEffect(() => {
        const kaaba = { lat: 21.422487, lon: 39.826206 };
        if (navigator.geolocation && !bearing) {
            const onSuccess = (pos) => {
                const { latitude, longitude } = pos.coords;
                const b = computeBearing(
                    latitude,
                    longitude,
                    kaaba.lat,
                    kaaba.lon
                );
                setBearing(b);
            };
            const onError = () => setBearing(0);
            navigator.geolocation.getCurrentPosition(onSuccess, onError, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 60000,
            });
        } else if (!bearing) {
            setBearing(0);
        }
    }, [bearing, computeBearing]);

    // Add device orientation listener to update deviceHeading
    useEffect(() => {
        let mounted = true;
        const handleOrientation = (e) => {
            let heading = null;
            // iOS Safari provides webkitCompassHeading
            if (typeof e.webkitCompassHeading === "number") {
                heading = e.webkitCompassHeading;
            } else if (typeof e.alpha === "number") {
                // e.alpha may be relative; adjust by screen orientation angle if available
                const screenAngle =
                    (window.screen &&
                        window.screen.orientation &&
                        window.screen.orientation.angle) ||
                    window.orientation ||
                    0;
                heading = e.alpha - screenAngle;
            }
            if (heading != null && mounted) {
                setIsSensorAvailable(true);
                setDeviceHeading(normalize(heading));
            }
        };

        // feature detection + iOS permission flow
        if (typeof DeviceOrientationEvent !== "undefined") {
            if (
                typeof DeviceOrientationEvent.requestPermission === "function"
            ) {
                DeviceOrientationEvent.requestPermission()
                    .then((perm) => {
                        if (perm === "granted") {
                            window.addEventListener(
                                "deviceorientation",
                                handleOrientation,
                                true
                            );
                        } else {
                            setIsSensorAvailable(false);
                        }
                    })
                    .catch(() => setIsSensorAvailable(false));
            } else {
                // prefer absolute event if available
                const evtName =
                    "ondeviceorientationabsolute" in window
                        ? "deviceorientationabsolute"
                        : "deviceorientation";
                window.addEventListener(evtName, handleOrientation, true);
            }
        } else {
            setIsSensorAvailable(false);
        }

        return () => {
            mounted = false;
            window.removeEventListener(
                "deviceorientation",
                handleOrientation,
                true
            );
            window.removeEventListener(
                "deviceorientationabsolute",
                handleOrientation,
                true
            );
        };
    }, [normalize]);

    return (
        <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-in bg-base-100">
            <button
                className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                Qibla Direction
            </h2>
            <div className="glass-card p-6 max-w-2xl  text-center text-base-content">
                <div className="flex flex-col items-center mb-6">
                    <div
                        className="compass-container"
                        style={{
                            position: "relative",
                            width: 400,
                            height: 400,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <div
                            className="compass-base"
                            style={{
                                position: "relative",
                                width: 350,
                                height: 350,
                                borderRadius: "50%",
                                background:
                                    "radial-gradient(circle, #2c3e50, #1a1a2e)",
                                boxShadow:
                                    "0 0 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                border: "8px solid #d4af37",
                            }}
                        >
                            <div
                                className="compass-face"
                                style={{
                                    position: "relative",
                                    width: 320,
                                    height: 320,
                                    borderRadius: "50%",
                                    background:
                                        "radial-gradient(circle, #3a506b, #1c2541)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    // rotate the outer face opposite to device heading so N/E/S/W move with the phone
                                    transform: deviceHeading
                                        ? `rotate(${-deviceHeading}deg)`
                                        : "rotate(0deg)",
                                    transition: "transform 180ms ease-out",
                                    boxShadow: "inset 0 0 30px rgba(0,0,0,0.7)",
                                }}
                            >
                                {/* Decoration Circles */}
                                <div
                                    style={{
                                        position: "absolute",
                                        width: 280,
                                        height: 280,
                                        border: "2px solid rgba(212, 175, 55, 0.3)",
                                        borderRadius: "50%",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        width: 240,
                                        height: 240,
                                        border: "2px solid rgba(212, 175, 55, 0.3)",
                                        borderRadius: "50%",
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        width: 200,
                                        height: 200,
                                        border: "2px solid rgba(212, 175, 55, 0.3)",
                                        borderRadius: "50%",
                                    }}
                                />
                                {/* Directions */}
                                <div
                                    className="direction north"
                                    style={{
                                        position: "absolute",
                                        top: 15,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        color: "#ff4d4d",
                                        fontWeight: "bold",
                                        fontSize: 20,
                                        textShadow:
                                            "0 0 10px rgba(212,175,55,0.8)",
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    N
                                </div>
                                <div
                                    className="direction east"
                                    style={{
                                        position: "absolute",
                                        right: 15,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: 20,
                                        textShadow:
                                            "0 0 10px rgba(212,175,55,0.8)",
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    E
                                </div>
                                <div
                                    className="direction south"
                                    style={{
                                        position: "absolute",
                                        bottom: 15,
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: 20,
                                        textShadow:
                                            "0 0 10px rgba(212,175,55,0.8)",
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    S
                                </div>
                                <div
                                    className="direction west"
                                    style={{
                                        position: "absolute",
                                        left: 15,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#fff",
                                        fontWeight: "bold",
                                        fontSize: 20,
                                        textShadow:
                                            "0 0 10px rgba(212,175,55,0.8)",
                                        width: 40,
                                        height: 40,
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    W
                                    <span
                                        style={{
                                            marginLeft: 4,
                                            fontSize: 28,
                                            verticalAlign: "middle",
                                            filter: "drop-shadow(0 0 6px #ffd700cc)",
                                        }}
                                        aria-label="Kaaba"
                                        title="Kaaba"
                                    >
                                        🕋
                                    </span>
                                </div>
                                {/* Needle fixed to point west (270°) */}
                                <div
                                    ref={needleRef}
                                    className="needle"
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "50%",
                                        width: 0,
                                        height: 0,
                                        transformOrigin: "bottom center",
                                        zIndex: 5,
                                        pointerEvents: "none",
                                        transform: "rotate(270deg)", // Fixed to west
                                    }}
                                >
                                    {/* Arrow shaft */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: -4,
                                            top: -90, // reduced length
                                            width: 10,
                                            height: 90, // reduced from 130 to 90
                                            background:
                                                "linear-gradient(90deg, #ff4d4d 60%, #d4af37 100%)",
                                            borderRadius: 7,
                                            boxShadow: "0 0 16px #ff4d4d88",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    />
                                    {/* Arrow head */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: -8,
                                            top: -105, // move arrow head accordingly
                                            width: 0,
                                            height: 0,
                                            borderLeft: "18px solid #ff4d4d",
                                            borderTop: "12px solid transparent",
                                            borderBottom:
                                                "12px solid transparent",
                                            transform: "rotate(-90deg)",
                                            transformOrigin: "center",
                                        }}
                                    />
                                </div>
                                {/* Center Point */}
                                <div
                                    className="center-point"
                                    style={{
                                        position: "absolute",
                                        width: 25,
                                        height: 25,
                                        background: "#d4af37",
                                        borderRadius: "50%",
                                        boxShadow:
                                            "0 0 15px rgba(212,175,55,0.8)",
                                        zIndex: 6,
                                        border: "3px solid #8B4513",
                                        left: "50%",
                                        top: "50%",
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="degree-display"
                    style={{
                        display: "inline-block",
                        margin: "0 auto 12px auto",
                        color: "#fff",
                        fontSize: 24,
                        fontWeight: "bold",
                        background: "rgba(60,60,60,0.7)",
                        padding: "6px 24px",
                        borderRadius: 18,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
                        position: "relative",
                        top: 0,
                    }}
                >
                    270° {/* Fixed to show west direction */}
                </div>
            </div>
        </section>
    );
}
