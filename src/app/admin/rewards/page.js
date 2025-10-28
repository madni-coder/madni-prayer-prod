"use client";
import { useState, useEffect } from "react";
import fetchFromApi from "../../../utils/fetchFromApi";

export default function RewardsPage() {
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [areaMasjid, setAreaMasjid] = useState("");
    const [position, setPosition] = useState("");
    const [winnersCount, setWinnersCount] = useState(0);
    const [winners, setWinners] = useState([]); // array of { fullName,address,areaMasjid,position }
    const [allTasbihUsers, setAllTasbihUsers] = useState([]);
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

    // Fetch tasbih users once on mount so we can autofill winners
    useEffect(() => {
        async function loadUsers() {
            try {
                const res = await fetchFromApi("/api/api-tasbihUsers");
                const json = await res.json();
                if (json.ok && Array.isArray(json.data)) {
                    // sort desc by Tasbih Counts
                    const sorted = [...json.data].sort((a, b) => {
                        const aCount = Number(a["Tasbih Counts"] || 0);
                        const bCount = Number(b["Tasbih Counts"] || 0);
                        return bCount - aCount;
                    });
                    setAllTasbihUsers(sorted);
                }
            } catch (e) {
                // ignore, keep users empty
                setAllTasbihUsers([]);
            }
        }
        loadUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess(false);
        setError("");
        try {
            // If winners array is present (autofill), submit them all
            if (winners && winners.length > 0) {
                const results = [];
                for (const w of winners) {
                    const res = await fetch("/api/api-rewards", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            fullName: w.fullName,
                            address: w.address,
                            areaMasjid: w.areaMasjid,
                            position: w.position,
                        }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                        throw new Error(
                            data.error || "One of the submissions failed"
                        );
                    }
                    results.push({ ...w });
                }
                // all succeeded
                setSuccess(true);
                setSubmissions([...submissions, ...results]);
                setSelectedPositions([
                    ...selectedPositions,
                    ...results.map((r) => r.position),
                ]);
                // clear form and winners
                setFullName("");
                setAddress("");
                setAreaMasjid("");
                setPosition("");
                setWinners([]);
                setWinnersCount(0);
            } else {
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
            }
        } catch (err) {
            setError(err.message || "Network error");
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
                    {/* New dropdown: number of winners to autofill */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <label
                            htmlFor="winnersCount"
                            style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                color: "#205c3b",
                                fontWeight: 500,
                                fontSize: "1rem",
                            }}
                        >
                            Number of winners to autofill
                        </label>
                        <select
                            id="winnersCount"
                            value={winnersCount}
                            onChange={(e) => {
                                const n = Number(e.target.value);
                                setWinnersCount(n);
                                // take top n users and map to winner entries
                                if (n > 0 && allTasbihUsers.length > 0) {
                                    const top = allTasbihUsers
                                        .slice(0, n)
                                        .map((u, i) => ({
                                            fullName: u["Full Name"] || "",
                                            address: u["Address"] || "",
                                            areaMasjid: u["Area Masjid"] || "",
                                            position: i + 1,
                                        }));
                                    setWinners(top);
                                } else {
                                    setWinners([]);
                                }
                            }}
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
                            <option value={0}>No autofill</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Render one or more autofilled winner entries when winnersCount > 0 */}
                    {winners.length > 0 && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <h3 style={{ color: "#205c3b", marginBottom: 8 }}>
                                Autofilled winners (editable)
                            </h3>
                            {winners.map((w, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        marginBottom: 12,
                                        padding: 12,
                                        border: "1px solid #f0f0f0",
                                        borderRadius: 8,
                                    }}
                                >
                                    <div style={{ marginBottom: 8 }}>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#205c3b",
                                                fontSize: 14,
                                            }}
                                        >
                                            Full Name
                                        </label>
                                        <input
                                            value={w.fullName}
                                            onChange={(e) => {
                                                const copy = [...winners];
                                                copy[idx] = {
                                                    ...copy[idx],
                                                    fullName: e.target.value,
                                                };
                                                setWinners(copy);
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: 8,
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#205c3b",
                                                fontSize: 14,
                                            }}
                                        >
                                            Address
                                        </label>
                                        <input
                                            value={w.address}
                                            onChange={(e) => {
                                                const copy = [...winners];
                                                copy[idx] = {
                                                    ...copy[idx],
                                                    address: e.target.value,
                                                };
                                                setWinners(copy);
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: 8,
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#205c3b",
                                                fontSize: 14,
                                            }}
                                        >
                                            Area Masjid Name
                                        </label>
                                        <input
                                            value={w.areaMasjid}
                                            onChange={(e) => {
                                                const copy = [...winners];
                                                copy[idx] = {
                                                    ...copy[idx],
                                                    areaMasjid: e.target.value,
                                                };
                                                setWinners(copy);
                                            }}
                                            style={{
                                                width: "100%",
                                                padding: 8,
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                display: "block",
                                                color: "#205c3b",
                                                fontSize: 14,
                                            }}
                                        >
                                            Position
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={w.position}
                                            onChange={(e) => {
                                                const copy = [...winners];
                                                copy[idx] = {
                                                    ...copy[idx],
                                                    position: Number(
                                                        e.target.value
                                                    ),
                                                };
                                                setWinners(copy);
                                            }}
                                            style={{ width: 120, padding: 8 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
