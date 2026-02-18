"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRef } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import apiClient from "../../../../lib/apiClient";

const prayers = [
    { name: "Fajr", defaultTime: "5:00 am" },
    { name: "Zuhar", defaultTime: "6:10 am" },
    { name: "Asr", defaultTime: "4:30 pm" },
    { name: "Maghrib", defaultTime: "7:15 pm" },
    { name: "Isha", defaultTime: "8:45 pm" },
    { name: "Taravih", defaultTime: "00:00" },
    { name: "Juma", defaultTime: "1:30 pm" },
];

export default function EditJamatTimePageWrapper() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white flex items-center justify-center">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            }
        >
            <EditJamatTimePage />
        </Suspense>
    );
}

function EditJamatTimePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const masjidId = searchParams.get("id");

    const [masjidName, setMasjidName] = useState("");
    const [colony, setColony] = useState("");
    const [locality, setLocality] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [pasteMapUrl, setPasteMapUrl] = useState("");
    const LOCAL_CITY_KEY = "masjid_city_isRaipur";
    const [isRaipur, setIsRaipur] = useState(false);
    const [times, setTimes] = useState(prayers.map((p) => p.defaultTime));
    const [editIdx, setEditIdx] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchMasjidData = useCallback(async () => {
        try {
            console.log("Fetching masjid data for ID:", masjidId);
            const { data } = await apiClient.get("/api/all-masjids", {
                params: { id: masjidId },
            });
            console.log("Response data:", data);

            if (data) {
                setMasjidName(data.masjidName || "");
                setColony(data.colony || "");
                setLocality(data.locality || "");
                setRole(data.role || "");
                setName(data.name || "");
                setMobile(data.mobile || "");
                setPasteMapUrl(data.pasteMapUrl || "");
                // Respect user's persisted toggle preference. If there is a
                // stored preference in localStorage, use that. Otherwise
                // fall back to the value from the server.
                try {
                    if (typeof window !== "undefined") {
                        const stored = localStorage.getItem(LOCAL_CITY_KEY);
                        if (stored === null) {
                            setIsRaipur((data.city || "Bilaspur") === "Raipur");
                        } else {
                            setIsRaipur(stored === "true");
                        }
                    } else {
                        setIsRaipur((data.city || "Bilaspur") === "Raipur");
                    }
                } catch (err) {
                    setIsRaipur((data.city || "Bilaspur") === "Raipur");
                }
                setTimes([
                    data.fazar || prayers[0].defaultTime,
                    data.zuhar || prayers[1].defaultTime,
                    data.asar || prayers[2].defaultTime,
                    data.maghrib || prayers[3].defaultTime,
                    data.isha || prayers[4].defaultTime,
                    data.taravih || prayers[5].defaultTime,
                    data.juma || prayers[6].defaultTime,
                ]);
            } else {
                setError(data?.error || "Failed to fetch masjid data");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err?.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    }, [masjidId]);

    // Keep a ref to ensure we only fetch once per mount lifecycle.
    // React Strict Mode in development can mount/unmount twice which may
    // trigger duplicate network calls; this guard prevents that.
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!masjidId) {
            setError("No masjid ID provided");
            setLoading(false);
            return;
        }

        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchMasjidData();
    }, [masjidId, fetchMasjidData]);

    // initialize isRaipur from localStorage (persist user preference)
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(LOCAL_CITY_KEY);
                if (stored !== null) setIsRaipur(stored === "true");
            }
        } catch (err) {
            console.warn("Could not read localStorage for city key", err);
        }
    }, []);

    const handleCityToggle = (checked) => {
        setIsRaipur(checked);
        try {
            if (typeof window !== "undefined") {
                localStorage.setItem(LOCAL_CITY_KEY, checked ? "true" : "false");
            }
        } catch (err) {
            console.warn("Could not write localStorage for city key", err);
        }
    };

    const handleTimeChange = (idx, value) => {
        setTimes((times) => times.map((t, i) => (i === idx ? value : t)));
    };

    const handleEdit = (idx) => {
        setEditIdx(idx);
        setEditValue(convertTo24(times[idx]));
    };

    const handleSave = (idx) => {
        setTimes((times) =>
            times.map((t, i) => (i === idx ? convertTo12(editValue) : t))
        );
        setEditIdx(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitting(true);
        try {
            const payload = {
                id: masjidId, // Required for PATCH API
                masjidName: masjidName.trim(),
                colony: colony.trim(),
                locality: locality.trim() || null,
                role: role,
                name: name.trim(),
                mobile: mobile,
                pasteMapUrl: pasteMapUrl.trim(),
                city: isRaipur ? 'Raipur' : 'Bilaspur',
                // map times
                fazar: times[0],
                zuhar: times[1],
                asar: times[2],
                maghrib: times[3],
                isha: times[4],
                taravih: times[5],
                juma: times[6],
            };

            const { data } = await apiClient.patch(
                "/api/all-masjids",
                payload
            );
            setSuccess("Masjid details updated successfully");
            // redirect after slight delay
            setTimeout(() => router.push("/admin/all-masjids"), 800);
        } catch (err) {
            setError(err?.response?.data?.error || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center py-8 px-2">
            <div className="w-full max-w-5xl flex items-center mb-4 px-4 sm:px-0">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white btn btn-sm mr-2 flex items-center gap-1"
                    onClick={() => router.push("/admin/all-masjids")}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl items-start px-4 sm:px-0">
                {/* Edit Masjid Form */}
                <div className="w-full md:w-1/2">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
                        Edit Masjid Details
                    </h1>
                    <div className={
                        `mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 rounded-md transition-colors ${isRaipur ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50 border border-gray-100'}`
                    }>
                        <label className={`flex items-center cursor-pointer select-none gap-2 ${isRaipur ? 'text-primary' : 'text-gray-700'}`}>
                            <input
                                type="checkbox"
                                className="toggle toggle-md sm:toggle-lg bg-error border-error checked:bg-primary checked:border-primary mr-1 sm:mr-2"
                                checked={isRaipur}
                                onChange={(e) => handleCityToggle(e.target.checked)}
                            />
                            <span className="font-medium text-sm sm:text-base">Is Raipur</span>
                        </label>
                        <div className={`text-xs sm:text-sm ${isRaipur ? 'text-primary' : 'text-gray-500'}`}>
                            Default city: <span className={`font-semibold ${isRaipur ? 'text-primary' : 'text-gray-700'}`}>{isRaipur ? 'Raipur' : 'Bilaspur'}</span>
                        </div>
                    </div>
                    <form
                        className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6"
                        onSubmit={handleSubmit}
                    >
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Masjid Name
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={masjidName}
                                onChange={(e) => setMasjidName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Colony
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={colony}
                                onChange={(e) => setColony(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Locality
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={locality}
                                onChange={(e) => setLocality(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="">Select Role</option>
                                <option value="mutawalli">Mutawalli</option>
                                <option value="moizzan">Moizzan</option>
                                <option value="imam">Imam</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Mobile Number
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                minLength={10}
                                maxLength={15}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Paste Map URL
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full py-2"
                                value={pasteMapUrl}
                                onChange={(e) => setPasteMapUrl(e.target.value)}
                                placeholder="Paste Google Map URL here"
                            />
                        </div>
                        {error && (
                            <div className="text-red-600 text-sm mb-2">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-600 text-sm mb-2">
                                {success}
                            </div>
                        )}
                        {masjidName.trim() && colony.trim() && (
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md py-2 disabled:opacity-60"
                            >
                                {submitting
                                    ? "Updating..."
                                    : "Update Masjid Info Or Jamat Times"}
                            </button>
                        )}
                    </form>
                </div>
                {/* Jamat Time Table */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-gray-800">
                        Jamat Time Table
                    </h2>
                    <div className="overflow-x-auto w-full">
                        <table className="table w-full min-w-[320px] border border-gray-200 bg-gray-50 text-sm sm:text-base">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-gray-700 whitespace-normal">Prayer</th>
                                    <th className="text-gray-700 whitespace-normal">Time</th>
                                    <th className="text-gray-700 whitespace-normal">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prayers.map((prayer, idx) => (
                                    <tr
                                        key={prayer.name}
                                        className="border-b border-gray-200"
                                    >
                                        <td
                                            className={[
                                                "font-semibold border-b-2",
                                                idx === 0
                                                    ? "text-primary border-primary"
                                                    : idx === 1
                                                        ? "text-pink-500 border-pink-500"
                                                        : idx === 2
                                                            ? "text-warning border-warning"
                                                            : idx === 3
                                                                ? "text-error border-error"
                                                                : idx === 4
                                                                    ? "text-info border-info"
                                                                    : idx === 5
                                                                        ? "text-black font-bold border-info"
                                                                        : idx === 6
                                                                            ? "text-[#8B4513] border-[#8B4513]"
                                                                            : "",
                                            ].join(" ")}
                                        >
                                            {prayer.name}
                                        </td>
                                        <td className="text-blue-600 font-semibold whitespace-normal">
                                            {editIdx === idx ? (
                                                <div className="flex flex-col sm:flex-row items-center gap-2">
                                                    <input
                                                        type="time"
                                                        className="input input-bordered input-sm bg-white text-gray-800 border-gray-300"
                                                        value={editValue}
                                                        onChange={(e) =>
                                                            setEditValue(
                                                                e.target.value
                                                            )
                                                        }
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
                                                        onClick={() =>
                                                            handleSave(idx)
                                                        }
                                                    >
                                                        <FaCheckCircle
                                                            size={16}
                                                        />
                                                    </button>
                                                </div>
                                            ) : (
                                                times[idx]
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center"
                                                onClick={() => handleEdit(idx)}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function convertTo24(timeStr) {
    const [time, period] = timeStr.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}`;
}

function convertTo12(timeStr) {
    let [h, m] = timeStr.split(":");
    h = parseInt(h);
    const period = h >= 12 ? "pm" : "am";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${m} ${period}`;
}
