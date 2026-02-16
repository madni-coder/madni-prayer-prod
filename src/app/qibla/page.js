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

            <div className="glass-card p-6 max-w-2xl mx-8 text-center text-base-content">
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
                            overflow: "visible",
                        }}
                    >
                        {/* Compass outer ring (golden/brass) */}
                        <div
                            style={{
                                position: "relative",
                                width: 350,
                                height: 350,
                                borderRadius: "50%",
                                background: "linear-gradient(145deg, #d4af37, #c9a961, #d4af37)",
                                boxShadow:
                                    "0 20px 40px rgba(0,0,0,0.3), inset 0 2px 5px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.3)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            {/* Inner golden ring */}
                            <div
                                style={{
                                    position: "relative",
                                    width: 330,
                                    height: 330,
                                    borderRadius: "50%",
                                    background: "linear-gradient(145deg, #c9a961, #d4af37)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                {/* Compass face */}
                                <div
                                    className="compass-face"
                                    style={{
                                        position: "relative",
                                        width: 310,
                                        height: 310,
                                        borderRadius: "50%",
                                        background: "radial-gradient(circle, #f5f0e8, #e8dcc8)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        transform: deviceHeading
                                            ? `rotate(${-deviceHeading}deg)`
                                            : "rotate(0deg)",
                                        transition: "transform 180ms ease-out",
                                        boxShadow: "inset 0 0 20px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {/* Degree tick marks around the edge */}
                                    {[...Array(360)].map((_, i) => {
                                        const angle = i; // Each degree
                                        const isMajor = angle % 30 === 0; // Major marks every 30 degrees
                                        const isMinor = angle % 5 === 0; // Minor marks every 5 degrees

                                        if (!isMinor) return null; // Only show every 5 degrees

                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    position: "absolute",
                                                    width: isMajor ? 2.5 : 1.5,
                                                    height: isMajor ? 18 : 10,
                                                    background: "#8B4513",
                                                    transformOrigin: "center",
                                                    transform: `rotate(${angle}deg) translateY(-147px)`,
                                                }}
                                            />
                                        );
                                    })}

                                    {/* North - Red */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 20,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            color: "#dc2626",
                                            fontWeight: "bold",
                                            fontSize: 28,
                                            fontFamily: "serif",
                                        }}
                                    >
                                        N
                                    </div>

                                    {/* East - Blackish Gray */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            right: 20,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#374151",
                                            fontWeight: "bold",
                                            fontSize: 24,
                                            fontFamily: "serif",
                                        }}
                                    >
                                        E
                                    </div>

                                    {/* South - Blackish Gray */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 20,
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            color: "#374151",
                                            fontWeight: "bold",
                                            fontSize: 24,
                                            fontFamily: "serif",
                                        }}
                                    >
                                        S
                                    </div>

                                    {/* West - Blackish Gray */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 20,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "#374151",
                                            fontWeight: "bold",
                                            fontSize: 24,
                                            fontFamily: "serif",
                                        }}
                                    >
                                        W
                                    </div>

                                    {/* Compass needle */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            top: "50%",
                                            width: 0,
                                            height: 0,
                                            transformOrigin: "center",
                                            transform: qiblaDirection !== null
                                                ? `translate(-50%, -50%) rotate(${qiblaDirection}deg)`
                                                : "translate(-50%, -50%) rotate(0deg)",
                                            zIndex: 10,
                                        }}
                                    >
                                        {/* Red half of needle (pointing up/north) */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: -4,
                                                top: -100,
                                                width: 0,
                                                height: 0,
                                                borderLeft: "8px solid transparent",
                                                borderRight: "8px solid transparent",
                                                borderBottom: "100px solid #ef4444",
                                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                            }}
                                        />

                                        {/* Blackish gray half of needle (pointing down/south) */}
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: -4,
                                                top: 0,
                                                width: 0,
                                                height: 0,
                                                borderLeft: "8px solid transparent",
                                                borderRight: "8px solid transparent",
                                                borderTop: "100px solid #1c1a1a",
                                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                            }}
                                        />
                                    </div>

                                    {/* Center golden circle */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            width: 30,
                                            height: 30,
                                            background: "radial-gradient(circle, #d4af37, #b8942c)",
                                            borderRadius: "50%",
                                            boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)",
                                            zIndex: 11,
                                            left: "50%",
                                            top: "50%",
                                            transform: "translate(-50%, -50%)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calibration guide */}
                    <div className="mt-4 flex flex-col items-center">
                        <div
                            className="border-4 border-primary"
                            style={{
                                padding: "0",
                                borderRadius: "12px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src="/eight.gif"
                                alt="Calibration guide"
                                style={{
                                    width: "160px",
                                    height: "160px",
                                    display: "block",
                                }}
                            />
                        </div>
                        <p className="mt-2 text-xs font-bold text-base-content opacity-80 text-center max-w-xs">
                            Move your device in a figure-8 motion to set Direction
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
