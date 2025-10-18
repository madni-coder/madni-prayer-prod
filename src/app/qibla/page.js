"use client";
import React, { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Qibla() {
    const router = useRouter();
    const [deviceHeading, setDeviceHeading] = useState(null);
    const normalize = (n) => ((n % 360) + 360) % 360;
    useEffect(() => {
        let mounted = true;
        const handleOrientation = (e) => {
            let heading = null;
            if (typeof e.webkitCompassHeading === "number") {
                heading = e.webkitCompassHeading;
            } else if (typeof e.alpha === "number") {
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
                        }
                    })
                    .catch(() => {});
            } else {
                const evtName =
                    "ondeviceorientationabsolute" in window
                        ? "deviceorientationabsolute"
                        : "deviceorientation";
                window.addEventListener(evtName, handleOrientation, true);
            }
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
    }, []);

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
                                        transform: "rotate(270deg)",
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
