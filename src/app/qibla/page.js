"use client";
import React, { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Qibla() {
    const router = useRouter();
    const [deviceHeading, setDeviceHeading] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    const [needsPermission, setNeedsPermission] = useState(false);
    const [qiblaDirection, setQiblaDirection] = useState(null);
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const normalize = (n) => ((n % 360) + 360) % 360;

    // Get user's location and fetch Qibla direction
    useEffect(() => {
        const getLocationAndQibla = async () => {
            if (!navigator.geolocation) {
                setLocationError("Geolocation is not supported by your browser");
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });

                    try {
                        // Fetch Qibla direction from Aladhan API
                        const response = await fetch(
                            `https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`
                        );
                        const data = await response.json();

                        if (data.code === 200 && data.data && data.data.direction) {
                            setQiblaDirection(data.data.direction);
                        } else {
                            setLocationError("Failed to get Qibla direction");
                        }
                    } catch (error) {
                        console.error("Error fetching Qibla direction:", error);
                        setLocationError("Failed to fetch Qibla direction");
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocationError("Failed to get your location. Please enable location services.");
                }
            );
        };

        getLocationAndQibla();
    }, []);

    useEffect(() => {
        let mounted = true;

        const handleOrientation = (e) => {
            let heading = null;

            // iOS devices with webkitCompassHeading
            if (typeof e.webkitCompassHeading === "number") {
                heading = e.webkitCompassHeading;
            }
            // Other devices using alpha
            else if (typeof e.alpha === "number" && e.alpha !== null) {
                const screenAngle =
                    (window.screen &&
                        window.screen.orientation &&
                        typeof window.screen.orientation.angle === "number"
                        ? window.screen.orientation.angle
                        : window.orientation) || 0;
                const alpha = e.alpha || 0;
                heading = 360 - (alpha + screenAngle);
            }

            if (heading != null && mounted) {
                setDeviceHeading(normalize(heading));
            }
        };

        const initCompass = async () => {
            // Check if permission was previously granted
            const previouslyGranted = localStorage.getItem('qiblaCompassPermission') === 'granted';

            if (typeof DeviceOrientationEvent !== "undefined") {
                if (typeof DeviceOrientationEvent.requestPermission === "function") {
                    // iOS 13+ - check if we already have permission
                    if (previouslyGranted) {
                        try {
                            const permission = await DeviceOrientationEvent.requestPermission();
                            if (permission === "granted") {
                                setPermissionGranted(true);
                                setNeedsPermission(false);
                                if ("ondeviceorientationabsolute" in window) {
                                    window.addEventListener("deviceorientationabsolute", handleOrientation, true);
                                } else {
                                    window.addEventListener("deviceorientation", handleOrientation, true);
                                }
                            } else {
                                setNeedsPermission(true);
                            }
                        } catch (error) {
                            // Permission request requires user gesture
                            setNeedsPermission(true);
                        }
                    } else {
                        // First time - needs user gesture
                        setNeedsPermission(true);
                    }
                } else {
                    // Non-iOS or older iOS - no permission needed
                    setPermissionGranted(true);
                    localStorage.setItem('qiblaCompassPermission', 'granted');
                    if ("ondeviceorientationabsolute" in window) {
                        window.addEventListener("deviceorientationabsolute", handleOrientation, true);
                    } else {
                        window.addEventListener("deviceorientation", handleOrientation, true);
                    }
                }
            }
        };

        initCompass();

        return () => {
            mounted = false;
            window.removeEventListener("deviceorientation", handleOrientation, true);
            window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
        };
    }, []);

    const requestPermissionAndStartListening = async () => {
        try {
            if (typeof DeviceOrientationEvent !== "undefined" &&
                typeof DeviceOrientationEvent.requestPermission === "function") {
                // iOS 13+ requires user gesture to request permission
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === "granted") {
                    setPermissionGranted(true);
                    setNeedsPermission(false);
                    setPermissionError(null);
                    localStorage.setItem('qiblaCompassPermission', 'granted');

                    // Start listening to orientation events
                    const handleOrientation = (e) => {
                        let heading = null;

                        if (typeof e.webkitCompassHeading === "number") {
                            heading = e.webkitCompassHeading;
                        } else if (typeof e.alpha === "number" && e.alpha !== null) {
                            const screenAngle =
                                (window.screen &&
                                    window.screen.orientation &&
                                    typeof window.screen.orientation.angle === "number"
                                    ? window.screen.orientation.angle
                                    : window.orientation) || 0;
                            const alpha = e.alpha || 0;
                            heading = 360 - (alpha + screenAngle);
                        }

                        if (heading != null) {
                            setDeviceHeading(normalize(heading));
                        }
                    };

                    if ("ondeviceorientationabsolute" in window) {
                        window.addEventListener("deviceorientationabsolute", handleOrientation, true);
                    } else {
                        window.addEventListener("deviceorientation", handleOrientation, true);
                    }
                } else {
                    setPermissionError("Permission denied. Please enable motion sensors in Settings > Privacy > Motion & Fitness.");
                    localStorage.setItem('qiblaCompassPermission', 'denied');
                }
            }
        } catch (error) {
            console.error("Error requesting device orientation permission:", error);
            setPermissionError("Failed to request permission. Please try again.");
        }
    };

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

            <style>{`.compass-container::-webkit-scrollbar{display:none} .compass-container{scrollbar-width:none;-ms-overflow-style:none}`}</style>

            {permissionError && (
                <div className="alert alert-warning mb-4 max-w-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{permissionError}</span>
                </div>
            )}

            {locationError && (
                <div className="alert alert-error mb-4 max-w-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{locationError}</span>
                </div>
            )}

            {needsPermission && !permissionGranted && (
                <div className="mb-4 text-center">
                    <button
                        onClick={requestPermissionAndStartListening}
                        className="btn btn-primary btn-lg"
                    >
                        🧭 Enable Compass
                    </button>
                    <p className="text-sm mt-2 opacity-70">Tap the button above to activate the Qibla compass</p>
                </div>
            )}

            <div className="glass-card p-6 max-w-2xl  text-center text-base-content">
                <div className="flex flex-col items-center mb-6">
                    <div
                        className="compass-container overflow-hidden"
                        style={{
                            position: "relative",
                            width: 400,
                            height: 400,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                            msOverflowStyle: "none",
                            scrollbarWidth: "none",
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
                                    transform: deviceHeading
                                        ? `rotate(${-deviceHeading}deg)`
                                        : "rotate(0deg)",
                                    transition: "transform 180ms ease-out",
                                    boxShadow: "inset 0 0 30px rgba(0,0,0,0.7)",
                                }}
                            >
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
                                        left: qiblaDirection !== null
                                            ? `${50 + 45 * Math.sin((qiblaDirection * Math.PI) / 180)}%`
                                            : 15,
                                        top: qiblaDirection !== null
                                            ? `${50 - 45 * Math.cos((qiblaDirection * Math.PI) / 180)}%`
                                            : "50%",
                                        transform: qiblaDirection !== null
                                            ? "translate(-50%, -50%)"
                                            : "translateY(-50%)",
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
                                    {qiblaDirection === null ? "W" : ""}
                                    <span
                                        style={{
                                            marginLeft: qiblaDirection === null ? 4 : 0,
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
                                <div
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
                                        transform: qiblaDirection !== null
                                            ? `rotate(${qiblaDirection}deg)`
                                            : "rotate(270deg)",
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: -4,
                                            top: -90,
                                            width: 10,
                                            height: 90,
                                            background:
                                                "linear-gradient(90deg, #ff4d4d 60%, #d4af37 100%)",
                                            borderRadius: 7,
                                            boxShadow: "0 0 16px #ff4d4d88",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: -8,
                                            top: -105,
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
            </div>
        </section>
    );
}
