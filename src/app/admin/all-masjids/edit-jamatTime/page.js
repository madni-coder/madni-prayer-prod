"use client";
import { useState } from "react";
import { FaPencilAlt, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const prayers = [
    { name: "Fajr", defaultTime: "5:00 am" },
    { name: "Zuhar", defaultTime: "6:10 am" },
    { name: "Asr", defaultTime: "4:30 pm" },
    { name: "Maghrib", defaultTime: "7:15 pm" },
    { name: "Isha", defaultTime: "8:45 pm" },
    { name: "Juma", defaultTime: "1:30 pm" }, // Added Juma below Isha
];

const locations = ["Location 1", "Location 2", "Location 3"];
const masjids = ["Masjid A", "Masjid B", "Masjid C"];

export default function JamatTimeTable() {
    const router = useRouter();
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedMasjid, setSelectedMasjid] = useState("");
    const [times, setTimes] = useState(prayers.map((p) => p.defaultTime));
    const [editIdx, setEditIdx] = useState(null);
    const [editValue, setEditValue] = useState("");

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

    return (
        <div className="min-h-screen bg-white flex flex-col items-center py-10">
            <div className="w-full max-w-xl flex items-center mb-4">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white btn btn-sm mr-2 flex items-center gap-1"
                    onClick={() => router.push("/admin/all-masjids")}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <div className="flex gap-4 mb-6 w-full max-w-xl">
                {/* Location Dropdown (DaisyUI) */}
                <div className="dropdown w-1/2">
                    <label
                        tabIndex={0}
                        className="btn w-full bg-white border text-gray-500 justify-between"
                    >
                        {selectedLocation || "Select Location"}
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full z-10"
                    >
                        {locations.map((loc) => (
                            <li key={loc}>
                                <a onClick={() => setSelectedLocation(loc)}>
                                    {loc}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Masjid Dropdown (DaisyUI) */}
                <div className="dropdown w-1/2">
                    <label
                        tabIndex={0}
                        className="btn w-full bg-white border text-gray-500 justify-between"
                    >
                        {selectedMasjid || "Select Masjid"}
                    </label>
                    <ul
                        tabIndex={0}
                        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full z-10"
                    >
                        {masjids.map((masjid) => (
                            <li key={masjid}>
                                <a onClick={() => setSelectedMasjid(masjid)}>
                                    {masjid}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
                Jamat Time Table
            </h1>
            <div className="overflow-x-auto w-full max-w-xl">
                <table className="table w-full border border-gray-200 bg-gray-50">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-gray-700">Prayer</th>
                            <th className="text-gray-700">Time</th>
                            <th className="text-gray-700">Actions</th>
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
                                            ? "text-[#8B4513] border-[#8B4513]" // Juma brown
                                            : "",
                                    ].join(" ")}
                                >
                                    {prayer.name}
                                </td>
                                <td className="text-blue-600 font-semibold">
                                    {editIdx === idx ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                className="input input-bordered input-sm bg-white text-gray-800 border-gray-300"
                                                value={editValue}
                                                onChange={(e) =>
                                                    setEditValue(e.target.value)
                                                }
                                                autoFocus
                                            />
                                            <button
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center"
                                                onClick={() => handleSave(idx)}
                                            >
                                                <FaCheckCircle size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        times[idx]
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded flex items-center"
                                        onClick={() => handleEdit(idx)}
                                    >
                                        <FaPencilAlt size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Helper to convert 12hr string to 24hr format for input value
function convertTo24(timeStr) {
    // e.g. '6:10 am' => '06:10', '4:30 pm' => '16:30'
    const [time, period] = timeStr.split(" ");
    let [h, m] = time.split(":");
    h = parseInt(h);
    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}`;
}

// Helper to convert 24hr input value to 12hr string
function convertTo12(timeStr) {
    // e.g. '06:10' => '6:10 am', '16:30' => '4:30 pm'
    let [h, m] = timeStr.split(":");
    h = parseInt(h);
    const period = h >= 12 ? "pm" : "am";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${m} ${period}`;
}
