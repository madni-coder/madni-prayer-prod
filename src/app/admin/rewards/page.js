"use client";
import { useState, useEffect } from "react";

export default function RewardsPage() {
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [areaMasjid, setAreaMasjid] = useState("");
    const [position, setPosition] = useState("");
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [submissions, setSubmissions] = useState([]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        setError("");
        try {
            const res = await fetch("/api/api-rewards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    address,
                    areaMasjid,
                    position,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                setSubmissions([
                    ...submissions,
                    { fullName, address, areaMasjid, position },
                ]);
                setSelectedPositions([...selectedPositions, position]);
                setFullName("");
                setAddress("");
                setAreaMasjid("");
                setPosition("");
            } else {
                setError(data.error || "Submission failed");
            }
        } catch (err) {
            setError("Network error");
        }
    };

    return (
        <>
            <style jsx global>{`
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `}</style>
            <div
                style={{
                    maxWidth: 400,
                    margin: "3rem auto",
                    padding: "2rem",
                    border: "1px solid #e0e0e0",
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "2rem",
                        color: "#205c3b",
                        fontWeight: 700,
                        fontSize: "1.5rem",
                    }}
                >
                    Announce Winner of This Week
                </h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="fullName"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: "#205c3b",
                                fontWeight: 500,
                                fontSize: "1rem",
                            }}
                        >
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            placeholder="Enter full name"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                fontSize: "1rem",
                                border: "1px solid #b7e4c7",
                                borderRadius: 6,
                                outline: "none",
                                color: "#000", // Make input text black
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#205c3b")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = "#b7e4c7")
                            }
                        />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="address"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: "#205c3b",
                                fontWeight: 500,
                                fontSize: "1rem",
                            }}
                        >
                            Address
                        </label>
                        <input
                            id="address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            placeholder="Enter address"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                fontSize: "1rem",
                                border: "1px solid #b7e4c7",
                                borderRadius: 6,
                                outline: "none",
                                color: "#000", // Make input text black
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#205c3b")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = "#b7e4c7")
                            }
                        />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="areaMasjid"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: "#205c3b",
                                fontWeight: 500,
                                fontSize: "1rem",
                            }}
                        >
                            Area Masjid Name
                        </label>
                        <input
                            id="areaMasjid"
                            type="text"
                            value={areaMasjid}
                            onChange={(e) => setAreaMasjid(e.target.value)}
                            required
                            placeholder="Enter area masjid"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                fontSize: "1rem",
                                border: "1px solid #b7e4c7",
                                borderRadius: 6,
                                outline: "none",
                                color: "#000", // Make input text black
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#205c3b")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = "#b7e4c7")
                            }
                        />
                    </div>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="position"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: "#205c3b",
                                fontWeight: 500,
                                fontSize: "1rem",
                            }}
                        >
                            Position
                        </label>
                        <select
                            id="position"
                            value={position}
                            onChange={(e) =>
                                setPosition(Number(e.target.value))
                            }
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                fontSize: "1rem",
                                border: "1px solid #b7e4c7",
                                borderRadius: 6,
                                outline: "none",
                                color: "#000",
                                background: "#fff",
                            }}
                            onFocus={(e) =>
                                (e.target.style.borderColor = "#205c3b")
                            }
                            onBlur={(e) =>
                                (e.target.style.borderColor = "#b7e4c7")
                            }
                        >
                            <option value="">Select position</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                                .filter(
                                    (pos) =>
                                        !selectedPositions.includes(
                                            String(pos)
                                        ) && !selectedPositions.includes(pos)
                                )
                                .map((pos) => (
                                    <option key={pos} value={pos}>
                                        {pos}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "0.9rem",
                            background: "#205c3b",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                        onMouseOver={(e) =>
                            (e.target.style.background = "purple")
                        }
                        onMouseOut={(e) =>
                            (e.target.style.background = "green")
                        }
                    >
                        Submit
                    </button>
                    {success && (
                        <div
                            style={{
                                position: "fixed",
                                top: "20px",
                                right: "20px",
                                background: "#205c3b",
                                color: "white",
                                padding: "1rem 2rem",
                                borderRadius: "8px",
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                zIndex: 1000,
                                animation: "slideIn 0.3s ease-out",
                            }}
                        >
                            Submission successful!
                        </div>
                    )}
                    {error && (
                        <div
                            style={{
                                marginTop: "1.5rem",
                                color: "red",
                                textAlign: "center",
                                fontWeight: 500,
                            }}
                        >
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}
