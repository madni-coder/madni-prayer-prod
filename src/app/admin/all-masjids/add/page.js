"use client";
import { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { useAllMasjidContext } from "../../../../context/AllMasjidContext";

const prayers = [
    { name: "Fajr", defaultTime: "6:00" },
    { name: "Zuhar", defaultTime: "1:30" },
    { name: "Asr", defaultTime: "4:45" },
    { name: "Maghrib", defaultTime: "6:10" },
    { name: "Isha", defaultTime: "8:45" },
    { name: "Taravih", defaultTime: "00:00" },
    { name: "Juma", defaultTime: "1:30" },
];

export default function AddMasjidPage() {
    const router = useRouter();
    const { create } = useAllMasjidContext();
    const LOCAL_CITY_KEY = "masjid_city_isRaipur";
    const [masjidName, setMasjidName] = useState("");
    const [colony, setColony] = useState("");
    const [locality, setLocality] = useState("");
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [loginId, setLoginId] = useState("");
    const [memberNames, setMemberNames] = useState("");
    const [mobileNumbers, setMobileNumbers] = useState("");
    const [password, setPassword] = useState("");
    // add per-role mobile cache
    const [roleMobiles, setRoleMobiles] = useState({});
    // add per-role name cache
    const [roleNames, setRoleNames] = useState({});
    const [pasteMapUrl, setPasteMapUrl] = useState("");
    const [isRaipur, setIsRaipur] = useState(false);
    const [times, setTimes] = useState(prayers.map((p) => p.defaultTime));
    const [editIdx, setEditIdx] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleTimeChange = (idx, value) => {
        setTimes((times) => times.map((t, i) => (i === idx ? value : t)));
    };

    const handleEdit = (idx) => {
        setEditIdx(idx);
        setEditValue(times[idx]);
    };

    const handleSave = (idx) => {
        setTimes((times) =>
            times.map((t, i) => (i === idx ? editValue : t))
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
                masjidName: masjidName.trim(),
                colony: colony.trim(),
                locality: locality.trim() || null,
                role: role,
                name: name.trim(),
                mobile: mobile,
                pasteMapUrl: pasteMapUrl.trim(),
                city: isRaipur ? 'Raipur' : 'Bilaspur',
                loginId: loginId ? parseInt(loginId) : null,
                memberNames: memberNames ? memberNames.split(',').map(s => s.trim()).filter(Boolean) : [],
                mobileNumbers: mobileNumbers ? mobileNumbers.split(',').map(s => s.trim()).filter(Boolean) : [],
                password: password ? parseInt(password) : 0,
                // map times
                fazar: times[0],
                zuhar: times[1],
                asar: times[2],
                maghrib: times[3],
                isha: times[4],
                taravih: times[5],
                juma: times[6],
            };

            const { data } = await create(payload);
            setSuccess("Masjid added successfully");
            // redirect after slight delay
            setTimeout(() => router.push("/admin/all-masjids"), 800);
        } catch (err) {
            setError(err?.response?.data?.error || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // initialize isRaipur from localStorage (persist user preference)
    useEffect(() => {
        try {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(LOCAL_CITY_KEY);
                if (stored !== null) {
                    setIsRaipur(stored === "true");
                }
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

    // new handler to load/save per-role mobiles and names
    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setRole(newRole);
        // load saved mobile and name for this role if available
        setMobile(roleMobiles[newRole] || "");
        setName(roleNames[newRole] || "");
    };

    const handleMobileChange = (e) => {
        const val = e.target.value;
        setMobile(val);
        // save mobile under current role so selecting role later shows it
        if (role) {
            setRoleMobiles((prev) => ({ ...prev, [role]: val }));
        }
    };

    // new handler to persist name per selected role
    const handleNameChange = (e) => {
        const val = e.target.value;
        setName(val);
        if (role) {
            setRoleNames((prev) => ({ ...prev, [role]: val }));
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center py-4 px-4 md:py-10 md:px-0">

            <div className="w-full max-w-5xl flex items-center mb-4 px-2 md:px-0">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white btn btn-sm mr-2 flex items-center gap-1"
                    onClick={() => router.push("/admin/all-masjids")}
                >
                    <ArrowLeft size={16} /> Back
                </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-5xl items-start px-2 md:px-0">
                {/* Add Masjid Form */}
                <div className="w-full md:w-1/2">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-center text-gray-800">
                        Add New Masjid
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
                        id="masjid-form"
                        className="bg-white p-4 md:p-6 rounded shadow mb-4 md:mb-8"
                        onSubmit={handleSubmit}
                    >
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Masjid Name{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={masjidName}
                                onChange={(e) => setMasjidName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Colony <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={colony}
                                onChange={(e) => setColony(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Locality <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={locality}
                                onChange={(e) => setLocality(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Role
                            </label>
                            <select
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={role}
                                onChange={handleRoleChange}
                            >
                                <option value="">Select Role</option>
                                <option value="mutawalli">Mutawalli</option>
                                <option value="moizzan">Moizzan</option>
                                <option value="imam">Imam</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Name field: show selected role as a badge ahead of the input and persist per-role name */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Name
                            </label>
                            <div className="flex">
                                {role && (
                                    <div className="px-2 md:px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-full text-gray-700 text-xs md:text-sm flex items-center whitespace-nowrap">
                                        {role.charAt(0).toUpperCase() +
                                            role.slice(1)}
                                    </div>
                                )}
                                <input
                                    type="text"
                                    className={
                                        "input input-bordered w-full bg-white text-black border-gray-300 text-sm md:text-base " +
                                        (role
                                            ? "rounded-r-full"
                                            : "rounded-full")
                                    }
                                    value={name}
                                    onChange={handleNameChange}
                                    placeholder={
                                        role ? `Enter ${role} name` : "Name"
                                    }
                                />
                            </div>
                        </div>

                        {/* Mobile field: show selected role as a badge ahead of the input and persist per-role mobile */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Mobile Number
                            </label>
                            <div className="flex">
                                {role && (
                                    <div className="px-2 md:px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-full text-gray-700 text-xs md:text-sm flex items-center whitespace-nowrap">
                                        {role.charAt(0).toUpperCase() +
                                            role.slice(1)}
                                    </div>
                                )}
                                <input
                                    type="tel"
                                    className={
                                        "input input-bordered w-full bg-white text-black border-gray-300 text-sm md:text-base " +
                                        (role
                                            ? "rounded-r-full"
                                            : "rounded-full")
                                    }
                                    value={mobile}
                                    onChange={handleMobileChange}
                                    minLength={10}
                                    maxLength={15}
                                    placeholder={
                                        role
                                            ? `Enter ${role} mobile number`
                                            : "Mobile number"
                                    }
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Login ID
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={loginId}
                                onChange={(e) => setLoginId(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Password
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Committee Members (comma separated)
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={memberNames}
                                onChange={(e) => setMemberNames(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Committee Mobiles (comma separated)
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={mobileNumbers}
                                onChange={(e) => setMobileNumbers(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2 text-sm md:text-base">
                                Paste Map URL of Masjid Location
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full bg-white text-black border-gray-300 rounded-full text-sm md:text-base"
                                value={pasteMapUrl}
                                onChange={(e) => setPasteMapUrl(e.target.value)}
                                placeholder="Paste Google Map URL here"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-xs md:text-sm mb-2">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="text-green-600 text-xs md:text-sm mb-2">
                                {success}
                            </div>
                        )}
                        {masjidName.trim() &&
                            colony.trim() &&
                            locality.trim() && (
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="hidden md:block btn w-full mt-4 bg-green-500 hover:bg-green-600 text-white rounded-none disabled:opacity-60 text-sm md:text-base"
                                >
                                    {submitting ? "Saving..." : "Submit Masjid Info & Jamat Times"}
                                </button>
                            )}
                    </form>
                </div>
                {/* Jamat Time Table */}
                <div className="w-full md:w-1/2">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-gray-800">
                        Jamat Time Table
                    </h2>
                    <div className="overflow-x-auto w-full">
                        <table className="table w-full border border-gray-200 bg-gray-50 text-sm md:text-base">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-gray-700 text-xs md:text-base">Prayer</th>
                                    <th className="text-gray-700 text-xs md:text-base">Time</th>
                                    <th className="text-gray-700 text-xs md:text-base">Actions</th>
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
                                                "font-semibold border-b-2 text-xs md:text-base",
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
                                                                        ? "text-purple-600 border-purple-400"
                                                                        : idx === 6
                                                                            ? "text-[#8B4513] border-[#8B4513]"
                                                                            : "",
                                            ].join(" ")}
                                        >
                                            {prayer.name}
                                        </td>
                                        <td className="text-blue-600 font-semibold text-xs md:text-base">
                                            {editIdx === idx ? (
                                                <div className="flex items-center gap-1 md:gap-2">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        pattern="[0-9:]*"
                                                        className="input input-bordered input-sm bg-white text-gray-800 border-gray-300 text-sm md:text-base w-24 text-center"
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
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-1.5 md:px-2 py-1 rounded flex items-center"
                                                        onClick={() =>
                                                            handleSave(idx)
                                                        }
                                                    >
                                                        <FaCheckCircle
                                                            size={14}
                                                            className="md:w-4 md:h-4"
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
                                                className="bg-green-600 hover:bg-green-700 text-white px-1.5 md:px-2 py-1 rounded flex items-center"
                                                onClick={() => handleEdit(idx)}
                                            >
                                                <Plus size={14} className="md:w-4 md:h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Mobile Submit Button - Shows only on mobile below the table */}
                {masjidName.trim() &&
                    colony.trim() &&
                    locality.trim() && (
                        <button
                            type="submit"
                            form="masjid-form"
                            disabled={submitting}
                            className="block md:hidden btn w-full mt-4 bg-green-500 hover:bg-green-600 text-white rounded-none disabled:opacity-60 text-sm px-2"
                        >
                            {submitting ? "Saving..." : "Submit Masjid Info & Jamat Times"}
                        </button>
                    )}
            </div>
        </div>
    );
}

// Conversions removed to allow raw text input
