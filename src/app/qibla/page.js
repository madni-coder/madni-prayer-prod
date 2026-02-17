"use client";
import React, { useEffect, useRef, useState } from "react";
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

    const [compassAccuracy, setCompassAccuracy] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const orientationListenerRef = useRef(null);
    const orientationEventNameRef = useRef(null);
    const normalize = (n) => ((n % 360) + 360) % 360;

    const isIOSDevice = () =>
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const computeQiblaDirectionFromLocation = (latitude, longitude) => {
        const toRad = (deg) => (deg * Math.PI) / 180;
        const toDeg = (rad) => (rad * 180) / Math.PI;

        const kaabaLat = 21.4225;
        const kaabaLng = 39.8262;

        const phi1 = toRad(latitude);
        const phi2 = toRad(kaabaLat);
        const deltaLambda = toRad(kaabaLng - longitude);

        const y = Math.sin(deltaLambda);
        const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

        return normalize(toDeg(Math.atan2(y, x)));
    };

    const getHeadingFromEvent = (e, prefersIOSHeading = false) => {
        if (prefersIOSHeading && typeof e.webkitCompassHeading === "number") {
            if (typeof e.webkitCompassAccuracy === "number") {
                setCompassAccuracy(e.webkitCompassAccuracy);
            }
            return normalize(e.webkitCompassHeading);
        }

        if (typeof e.webkitCompassHeading === "number") {
            if (typeof e.webkitCompassAccuracy === "number") {
                setCompassAccuracy(e.webkitCompassAccuracy);
            }
            return normalize(e.webkitCompassHeading);
        }

        if (typeof e.alpha === "number" && e.alpha !== null) {
            if (prefersIOSHeading) {
                return normalize(360 - e.alpha);
            }

            const screenAngle =
                (window.screen &&
                    window.screen.orientation &&
                    typeof window.screen.orientation.angle === "number"
                    ? window.screen.orientation.angle
                    : window.orientation) || 0;
            return normalize(360 - (e.alpha + screenAngle));
        }

        return null;
    };

    const attachOrientationListener = (handler, prefersIOSHeading = false) => {
        const eventName = prefersIOSHeading
            ? "deviceorientation"
            : ("ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation");

        window.addEventListener(eventName, handler, true);
        orientationListenerRef.current = handler;
        orientationEventNameRef.current = eventName;
    };

    const detachOrientationListener = () => {
        if (orientationListenerRef.current && orientationEventNameRef.current) {
            window.removeEventListener(orientationEventNameRef.current, orientationListenerRef.current, true);
        }
        window.removeEventListener("deviceorientation", orientationListenerRef.current, true);
        window.removeEventListener("deviceorientationabsolute", orientationListenerRef.current, true);
        orientationListenerRef.current = null;
        orientationEventNameRef.current = null;
    };

    // Detect iOS
    useEffect(() => {
        const checkIOS = () => {
            const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            setIsIOS(isIOSDevice);
        };
        checkIOS();
    }, []);

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
                            const computedDirection = computeQiblaDirectionFromLocation(latitude, longitude);
                            setQiblaDirection(computedDirection);
                        }
                    } catch (error) {
                        console.error("Error fetching Qibla direction:", error);
                        const computedDirection = computeQiblaDirectionFromLocation(latitude, longitude);
                        setQiblaDirection(computedDirection);
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
        const prefersIOSHeading = isIOSDevice();

        const handleOrientation = (e) => {
            if (!mounted) return;
            const heading = getHeadingFromEvent(e, prefersIOSHeading);

            if (heading != null) {
                setDeviceHeading(heading);
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
                                detachOrientationListener();
                                attachOrientationListener(handleOrientation, prefersIOSHeading);
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
                    detachOrientationListener();
                    attachOrientationListener(handleOrientation, prefersIOSHeading);
                }
            }
        };

        initCompass();

        return () => {
            mounted = false;
            detachOrientationListener();
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
                    const prefersIOSHeading = isIOSDevice();

                    // Define the orientation handler for iOS
                    const handleOrientation = (e) => {
                        const heading = getHeadingFromEvent(e, prefersIOSHeading);

                        if (heading != null) {
                            setDeviceHeading(heading);
                        }
                    };

                    detachOrientationListener();
                    attachOrientationListener(handleOrientation, prefersIOSHeading);

                    // Force a check to see if events are firing
                    console.log("iOS compass permission granted, listeners attached");
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
                            marginLeft: "40px",
                            marginRight: "40px",
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
                                transform: deviceHeading
                                    ? `rotate(${-deviceHeading}deg)`
                                    : "rotate(0deg)",
                                transition: "transform 180ms ease-out",
                            }}
                        >
                            {/* North - Red - Fixed on golden ring */}
                            <div
                                style={{
                                    position: "absolute",
                                    top: -7,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    color: "#dc2626",
                                    fontWeight: "bold",
                                    fontSize: 22,
                                    fontFamily: "serif",
                                    zIndex: 15,
                                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                            >
                                N
                            </div>

                            {/* East - Blackish Gray - Fixed on golden ring */}
                            <div
                                style={{
                                    position: "absolute",
                                    right: 2,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#374151",
                                    fontWeight: "bold",
                                    fontSize: 26,
                                    fontFamily: "serif",
                                    zIndex: 15,
                                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                            >
                                E
                            </div>

                            {/* South - Blackish Gray - Fixed on golden ring */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: -10,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    color: "#374151",
                                    fontWeight: "bold",
                                    fontSize: 26,
                                    fontFamily: "serif",
                                    zIndex: 15,
                                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                            >
                                S
                            </div>

                            {/* West - Blackish Gray - Fixed on golden ring */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: -1,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#374151",
                                    fontWeight: "bold",
                                    fontSize: 20,
                                    fontFamily: "serif",
                                    zIndex: 15,
                                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                                }}
                            >
                                W
                            </div>

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

                                    {/* Kaaba Icon - positioned at Qibla direction, always upright */}
                                    {qiblaDirection !== null && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                top: "50%",
                                                width: "40px",
                                                height: "40px",
                                                transformOrigin: "center",
                                                transform: `translate(-50%, -50%) rotate(${qiblaDirection}deg)`,
                                                zIndex: 9,
                                                pointerEvents: "none",
                                            }}
                                        >
                                            <img
                                                src="/kaabaIcon.png"
                                                alt="Kaaba"
                                                style={{
                                                    position: "absolute",
                                                    left: "50%",
                                                    top: -95,
                                                    width: "30px",
                                                    height: "30px",
                                                    display: "block",
                                                    transform: deviceHeading
                                                        ? `translate(-50%, -50%) rotate(${-qiblaDirection + deviceHeading}deg)`
                                                        : "translate(-50%, -50%) rotate(0deg)",
                                                    transition: "transform 180ms ease-out",
                                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Compass needle */}
                                    {(() => {
                                        return (
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
                                                        left: "50%",
                                                        top: -100,
                                                        width: 0,
                                                        height: 0,
                                                        transform: "translateX(-50%)",
                                                        borderLeft: "8px solid transparent",
                                                        borderRight: "8px solid transparent",
                                                        borderBottom: "100px solid #ef4444",
                                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                                        zIndex: 12,
                                                    }}
                                                />

                                                {/* Blackish gray half of needle (pointing down/south) */}
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        left: "50%",
                                                        top: 0,
                                                        width: 0,
                                                        height: 0,
                                                        transform: "translateX(-50%)",
                                                        borderLeft: "8px solid transparent",
                                                        borderRight: "8px solid transparent",
                                                        borderTop: "100px solid #1c1a1a",
                                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                                                        zIndex: 11,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })()}

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

                    {/* iOS Compass Accuracy Display */}
                    {isIOS && compassAccuracy !== null && (
                        <div className="mt-4 mb-2">
                            <div className="badge badge-lg"
                                style={{
                                    backgroundColor: compassAccuracy < 15 ? '#10b981' :
                                        compassAccuracy < 25 ? '#f59e0b' : '#ef4444',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}>
                                {compassAccuracy < 15 ? '✓ High' :
                                    compassAccuracy < 25 ? '⚠ Medium' : '⚠ Low'} Accuracy: {compassAccuracy.toFixed(0)}°
                            </div>
                        </div>
                    )}

                    {/* iOS Direction Indicator */}
                    {isIOS && qiblaDirection !== null && deviceHeading !== null && (
                        <div className="mt-2 mb-4">
                            {(() => {
                                const diff = Math.abs(normalize(deviceHeading - qiblaDirection));
                                const isAligned = diff < 15 || diff > 345;
                                return (
                                    <div className={`alert ${isAligned ? 'alert-success' : 'alert-info'} py-2 px-4`}>
                                        <span className="text-sm font-semibold">
                                            {isAligned ? '✓ Pointing at Qibla!' : `Turn ${diff < 180 ? 'right' : 'left'} ${Math.min(diff, 360 - diff).toFixed(0)}°`}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

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
