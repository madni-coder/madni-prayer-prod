"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Qibla() {
    const router = useRouter();
    const needleRef = useRef(null);
    const [angle, setAngle] = useState(270);
    const [deviceHeading, setDeviceHeading] = useState(0);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSensorAvailable, setIsSensorAvailable] = useState(false);
    const [useManual, setUseManual] = useState(false);

    useEffect(() => {
        let raf;
        let currentAngle = angle;
        let targetAngle = 270;

        function animate() {
            currentAngle += (targetAngle - currentAngle) * 0.05;
            setAngle(currentAngle);
            if (needleRef.current) {
                needleRef.current.style.transform = `rotate(${currentAngle}deg)`;
            }
            raf = requestAnimationFrame(animate);
        }

        let interval = setInterval(() => {
            targetAngle = 270 + (Math.random() * 20 - 10);
        }, 3000);

        animate();

        return () => {
            clearInterval(interval);
            cancelAnimationFrame(raf);
        };
    }, [angle]);

    useEffect(() => {
        let seenEvent = false;
        const handleOrientation = (event) => {
            if (typeof event.alpha === "number") {
                seenEvent = true;
                setIsSensorAvailable(true);
                setDeviceHeading(event.alpha || 0);
            }
        };

        // Listen briefly to detect if a sensor exists and emits events
        window.addEventListener("deviceorientationabsolute", handleOrientation);
        window.addEventListener("deviceorientation", handleOrientation);

        const fallbackTimer = setTimeout(() => {
            if (!seenEvent) {
                setIsSensorAvailable(false);
                setUseManual(true);
            }
        }, 2500);

        return () => {
            window.removeEventListener(
                "deviceorientationabsolute",
                handleOrientation
            );
            window.removeEventListener("deviceorientation", handleOrientation);
            clearTimeout(fallbackTimer);
        };
    }, []);

    function handleCompassClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        let newTarget = (Math.atan2(y, x) * 180) / Math.PI + 90;
        if (newTarget < 0) newTarget += 360;
        setAngle(newTarget);
        if (needleRef.current) {
            needleRef.current.style.transform = `rotate(${newTarget}deg)`;
        }
    }

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
            <div className="glass-card p-6 max-w-2xl w-full text-center bg-base-200 text-base-content">
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
                                cursor: "pointer",
                            }}
                            onClick={handleCompassClick}
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
                                {/* Needle as a clock-like arrow from center */}
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
                                        transform: `rotate(${angle}deg)`,
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
                                {/* Qibla label */}

                                <style>{`
                                    @keyframes pulse {
                                        0% { transform: translateY(-50%) scale(1);}
                                        50% { transform: translateY(-50%) scale(1.05);}
                                        100% { transform: translateY(-50%) scale(1);}
                                    }
                                `}</style>
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
                    {`${Math.round(angle % 360)}°`}
                </div>
                {/* Manual fallback for desktops/laptops without sensors */}
                {useManual && (
                    <div className="mt-4 text-center">
                        <p className="text-sm mb-2">
                            Device orientation not available — use the slider to
                            simulate heading
                        </p>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 12,
                            }}
                        >
                            <input
                                type="range"
                                min={0}
                                max={359}
                                value={Math.round(deviceHeading)}
                                onChange={(e) =>
                                    setDeviceHeading(Number(e.target.value))
                                }
                                style={{ width: 240 }}
                            />
                            <input
                                type="number"
                                min={0}
                                max={359}
                                value={Math.round(deviceHeading)}
                                onChange={(e) => {
                                    let v = Number(e.target.value);
                                    if (isNaN(v)) v = 0;
                                    v = ((v % 360) + 360) % 360;
                                    setDeviceHeading(v);
                                }}
                                style={{
                                    width: 72,
                                    padding: 6,
                                    borderRadius: 6,
                                }}
                            />
                        </div>
                        <button
                            className="btn btn-ghost btn-sm mt-3"
                            onClick={() => setUseManual(false)}
                        >
                            Try enabling device orientation again
                        </button>
                    </div>
                )}
                <div>
                    <p className="text-lg mb-2">
                        Compass-based Qibla, GPS, and prayer duas.
                    </p>
                </div>
                <p className="text-sm text-base-content/60">
                    (Feature coming soon)
                </p>
            </div>
        </section>
    );
}
