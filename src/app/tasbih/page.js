"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RotateCw, Trash2 } from "lucide-react";
import { PiHandTapLight } from "react-icons/pi";
import { FaAngleLeft, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/apiClient";
import AnimatedLooader from "../../components/animatedLooader";

export default function Tasbih() {
    // Initialize count from localStorage
    const [count, setCount] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("tasbihCount");
            return saved ? Number(saved) : 0;
        }
        return 0;
    });
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showLimitReached, setShowLimitReached] = useState(false);
    const [history, setHistory] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("duroodHistory");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [savedMobile, setSavedMobile] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("userMobile") || "";
        }
        return "";
    });
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem('userData');
            return !!userData;
        }
        return false;
    });
    const [submitting, setSubmitting] = useState(false);
    const [theme, setTheme] = useState("system");
    const [target, setTarget] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("tasbihTarget");
            return saved ? Number(saved) : 0;
        }
        return 0;
    });
    const [targetInput, setTargetInput] = useState("");
    const [showTargetTooltip, setShowTargetTooltip] = useState(false);
    const [showTargetReached, setShowTargetReached] = useState(false);
    const [allowContinueAfterTarget, setAllowContinueAfterTarget] = useState(false);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualTargetValue, setManualTargetValue] = useState("");
    // Card carousel state
    const [currentCard, setCurrentCard] = useState(0);
    // Show / hide carousel/cards wrapper
    const [showCards, setShowCards] = useState(false);
    // Press animation state for the main tap button
    const [pressing, setPressing] = useState(false);

    const startPress = useCallback(() => {
        // Immediate visual press
        setPressing(true);
        try { createRipple(); applyGlow(); } catch (e) { }
        // Fallback clear in case animationend doesn't fire
        window.setTimeout(() => setPressing(false), 260);
    }, []);

    // ref for inner tap circle to apply ripple/glow
    const tapInnerRef = useRef(null);

    const createRipple = useCallback(() => {
        try {
            const el = tapInnerRef.current;
            if (!el) return;
            const r = document.createElement('span');
            r.className = 'tap-ripple';
            el.appendChild(r);
            r.addEventListener('animationend', () => r.remove());
        } catch (e) {
            // ignore
        }
    }, []);

    const applyGlow = useCallback(() => {
        try {
            const el = tapInnerRef.current;
            if (!el) return;
            el.classList.add('tap-glow-strong');
            window.setTimeout(() => el.classList.remove('tap-glow-strong'), 580);
        } catch (e) { }
    }, []);

    const cards = [
        {
            title: 'दुरूदे इब्राहीमी',
            content: `अल्लाहुम्मा स़ल्लि अला सय्यिदिना मुहम्मदिवँ व अला आलि सय्यिदिना मुहम्मदिन कमा स़ल्लेता अला सय्यिदिना इब्राहिमा व अला आलि सय्यिदिना इब्राहिमा इन्नका हमीदुम मजीद।\nअल्लाहुम्मा बारिक अला सय्यिदिना मुहम्मदिवँ व अला सय्यिदिना मुहम्मदिन कमा बारक-ता अला सय्यिदिना इब्राहिमा व अला आलि सय्यिदिना इब्राहिमा इन्नका हमीदुम मजीद।`
        },
        {
            title: 'रोज़ी में बरकत',
            content: `अल्लाहुम्मा स़ल्लि अला मुहम्मदिन अब्दिका व रसूलिका व स़ल्लि अलल मुअमिनीना व मुअमिनाति वल मुस्लिमीना वल मुस्लिमाति,\nजिस शख्स की ये ख्वाहिश हाे कि उसका माल बढ जाए, वो इस Darood Sharif को पढा करै,`
        },
        {
            title: 'अस्सी साल की इबादत का सवाब',
            content: `अल्लाहुम्मा स़ल्लि अला मुहम्मदि निन नबीय्यिल उम्मिय्यि व अला आलिही व स़ल्लिम तस्लीमा,\nजुमअ के दिन जहाँ नमाजे अस्र पढी हो उसी जगह उठने से पहले अस्सी मर्तबा ये दुरूद शरीफ़ Darood Sharif पढ़ने से अस्सी साल के गुनाह मुआफ होते हैं, और अस्सी साल की इबादत کا सवाब मिलता है,`
        },
        {
            title: 'दुरूदे इस्मे आज़म',
            content: `अल्लाहु रब्बु मुहम्मदिन स़ल्ला अलैहि वसल्लमा, नहनु इबादु मुहम्मदिन स़ल्ला अलैहि वसल्लमा,\nये दुरूद शरीफ़ Darood Sharif को  सौ मर्तबा रोजाना अपना मअमूल बना लीजिए, फिर इसकी बरकात देखिए कि दीन व दुनिया के हर काम मेंकामयाबी आपके क़दम चूमेगी नाकामी की बादे ख़ज़ाँ कभी दूर से भी नहीं गुज़रेगी,`
        },
        {
            title: 'खजिनए फ़ज़ाइलो बरकात',
            content: `सल्लल्लाहु अलन-नबीय्यिल उम्मिय्यि व आलिही सल्लल्लाहु अलेहि वसल्लमा सलातवें व सलामन अलैका या रसूलल्लाह\nये दुरूद शरीफ़ Darood Sharif हर नमाज़ खुसूसन नमाजे जुम्मा के बाद मदीना मुनव्वरा की जानिब मुँह करके सौ मर्तबा पढने से बे-शुमार फ़जाएलाे बरकात हासिल होते हैं,`
        },
        {
            title: 'तमाम औकात में दुरूद शरीफ़',
            content: `अल्लाहुम्मा स़ल्लि अला मुहम्मदिन फी अव्वलि कलामिना, अल्लाहुम्मा स़ल्लि अला मुहम्मदिन फी औ-सति कलामिना,अल्लाहुम्मा स़ल्लि अला मुहम्मदिन फी आख़िरि कलामिना,\nशैखुल इस्लाम अबुल अब्बास ने फ़रमाया जाे शख्स दिन और रात मेंतीन तीन मर्तबा ये दुरूद शरीफ़ Darood Sharif पढे वाे गाेया रात व दिन के तमाम औकात में दुरूद भेंजता रहा,`
        },
        {
            title: 'दस नेकिया',
            content: `मौलाया स़ल्लि व स़ल्लिम दाइमन अ-ब-दन अला हबीबिका खै़रिल-खल्कि कुल्लिहिमी,\nअल्लाह तआला दुरूद शरीफ़ Darood Sharif पढ़ने वाले के लिए दस नेकियाँ लिख देता है, उसके दस दर्जे बुलंद कर देता है और दस गुनाह मुआफ कर देता है,`
        },
        {
            title: 'दोज़ख़ से नजात',
            content: `अल्लाहुम्मा स़ल्लि अला मुहम्मदि निन नबीय्यिल उम्मिय्यि व अला आलिही वसल्लिम,\nहजरत खल्लाद रहमतुल्लाह अलैह जुम्मा के दिन ये दुरूद शरीफ़ एक हजार मर्तबा पढा करते थे, उनके इन्तिकाल के बाद उनके तकिया के नीचे से एक कागज मिला जिस पर लिखा हुआ था, कि ये ख़ल्लाद दिन कसीर के लिए दोज़ख़ से आजादी का परवाना है,`
        },
        {
            title: 'जन्नत में ठिकाना',
            content: `अल्लाहुम्मा स़ल्लि अला मुहम्मदि निन नबीय्यिल उम्मिय्यि अलैंहिस-सलामु,\nजुम्मा के दिन एक हजार मर्तबा ये दुरूद शरीफ़ Darood Sharif पढने वाले को मरने से पहले जन्नत यें उसका ठिकाना दिखा दिया जाएगा,`
        },

    ];
    const carouselRef = useRef(null);
    const touchStartX = useRef(null);
    const cardRefs = useRef([]);
    const [carouselHeight, setCarouselHeight] = useState(0);
    const [expandedCards, setExpandedCards] = useState(() => Array(cards.length).fill(false));

    useEffect(() => {
        // Disable automatic sliding via keyboard and touch/swipe.
        // Cards will only change through explicit buttons and dot controls.
        return () => { };
    }, [cards.length]);


    // Measure active card height and set container height so it resizes to content
    useEffect(() => {
        const measure = () => {
            const el = cardRefs.current[currentCard];
            if (el && typeof el.offsetHeight === 'number') {
                setCarouselHeight(el.offsetHeight);
            } else {
                setCarouselHeight(0);
            }
        };

        // measure after paint
        requestAnimationFrame(measure);

        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [currentCard, cards.length, expandedCards]);
    // Warn user if they try to set a new target while an active one exists
    const [showActiveTargetWarning, setShowActiveTargetWarning] = useState(false);
    const [pendingTarget, setPendingTarget] = useState(null);
    const [showIncompleteTargetWarning, setShowIncompleteTargetWarning] = useState(false);
    const [allowFreeCounting, setAllowFreeCounting] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('tasbihAllowFree') === '1';
        }
        return false;
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 6;
    const totalPages = Math.ceil(history.length / entriesPerPage);
    const paginatedHistory = history.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
    );
    // Clear history confirmation modal
    const [showClearHistoryConfirm, setShowClearHistoryConfirm] =
        useState(false);

    const router = useRouter();

    // Sync count to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("tasbihCount", count);
        }
    }, [count]);

    // Sync history to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("duroodHistory", JSON.stringify(history));
        }
    }, [history]);

    // Persist target
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("tasbihTarget", String(target || 0));
        }
    }, [target]);

    // Persist allowFreeCounting (No Target) so selection survives redirects/navigation
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            if (allowFreeCounting) {
                localStorage.setItem('tasbihAllowFree', '1');
                // ensure numeric target is cleared
                localStorage.removeItem('tasbihTarget');
            } else {
                localStorage.removeItem('tasbihAllowFree');
            }
        } catch (e) {
            // ignore storage errors
        }
    }, [allowFreeCounting]);

    // Detect theme changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedTheme = localStorage.getItem("theme") || "system";
            setTheme(savedTheme);

            const observer = new MutationObserver(() => {
                const currentTheme = localStorage.getItem("theme") || "system";
                setTheme(currentTheme);
            });

            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["data-theme", "class"],
            });

            return () => observer.disconnect();
        }
    }, []);

    // play a short tick sound using WebAudio (no external assets)
    const playTick = useCallback(() => {
        if (typeof window === 'undefined') return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            // reuse a single context on window to avoid repeated creations
            if (!window.__tasbihAudioCtx) window.__tasbihAudioCtx = new AudioContext();
            const ctx = window.__tasbihAudioCtx;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(0.12, now + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.09);
        } catch (err) {
            // ignore any audio errors; non-critical
        }
    }, []);

    // Helper function to show toast (react-toastify)
    const showToast = (t) => {
        if (!t) return;
        if (t.type === "error") toast.error(t.text || t.message || String(t));
        else toast.success(t.text || t.message || String(t));
    };

    // local-only submit (skip API call) used by modal Skip action
    const skipSubmit = (countToSubmit) => {
        const v = Number(countToSubmit);
        if (!v || v <= 0) {
            showToast({ type: 'error', text: 'Count Value must be greater than 0' });
            return;
        }

        const newEntry = {
            count: v,
            weeklyCounts: v,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
        };
        setHistory((prev) => [newEntry, ...prev]);
        setCount(0);
        setTarget(0);
        if (typeof window !== 'undefined') localStorage.removeItem('tasbihTarget');
        setShowTargetReached(false);
        setAllowContinueAfterTarget(false);
        setAllowFreeCounting(false);
        showToast({ type: 'success', text: 'Count saved locally' });
    };

    // Helper to get effective theme
    const effectiveTheme = () => {
        if (theme === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        return theme;
    };

    // Helper function to trigger low intensity vibration on mobile
    // Tries multiple fallbacks: standard Vibration API, Tauri haptics plugin,
    // and other common WebView bridges. Nothing is done if no API exists.
    const triggerVibration = useCallback(async () => {
        if (typeof window === "undefined") return;

        try {
            // 1) Tauri Haptics Plugin - For Tauri mobile apps (iOS & Android)
            // This is the primary method for Tauri v2 mobile apps
            if (window.__TAURI_INTERNALS__) {
                try {
                    // Import haptics dynamically
                    const { vibrate, ImpactStyle } = await import('@tauri-apps/plugin-haptics');
                    // Use light impact for subtle feedback
                    await vibrate(ImpactStyle.Light);
                    return;
                } catch (e) {
                    // Plugin might not be loaded, try other methods
                    console.debug('Tauri haptics not available:', e);
                }
            }

            // 2) Standard web Vibration API (works in Android Chrome and many browsers)
            if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
                navigator.vibrate(20);
                return;
            }

            // 3) React Native WebView bridge
            if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === "function") {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: "vibrate", duration: 20 }));
                return;
            }

            // 4) Android/JavascriptInterface commonly exposed as `Android` or `android`
            if (window.Android && typeof window.Android.vibrate === "function") {
                window.Android.vibrate(20);
                return;
            }
            if (window.android && typeof window.android.vibrate === "function") {
                window.android.vibrate(20);
                return;
            }

            // 5) WKWebView iOS message handler (app must expose a `vibrate` handler)
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.vibrate) {
                window.webkit.messageHandlers.vibrate.postMessage({ duration: 20 });
                return;
            }
        } catch (err) {
            // swallow errors — vibration is non-essential
            // eslint-disable-next-line no-console
            console.warn("triggerVibration error:", err);
        }
    }, []);

    // shared increment handler (respects custom target and global 10000 limit)
    const increment = useCallback(() => {
        // Prevent starting if no target is set (unless free counting is enabled)
        if (!allowFreeCounting && (!target || target <= 0)) {
            // show themed tooltip on target field
            setShowTargetTooltip(true);
            // clear after a short delay so mobile users see it
            setTimeout(() => setShowTargetTooltip(false), 3500);
            return;
        }

        setCount((c) => {
            // global hard limit
            if (c >= 10000) {
                setShowLimitReached(true);
                return c;
            }

            // if a custom target is set and user hasn't opted to continue,
            // show target reached modal when about to reach/just reached target
            if (target > 0 && !allowContinueAfterTarget) {
                if (c + 1 > target) {
                    // do not increment beyond target until user chooses to continue
                    setShowTargetReached(true);
                    return c;
                }
                if (c + 1 === target) {
                    triggerVibration();
                    try { playTick(); } catch (e) { }
                    try { createRipple(); applyGlow(); } catch (e) { }
                    setShowTargetReached(true);
                    return c + 1;
                }
            }

            triggerVibration(); // Add vibration feedback
            try { playTick(); } catch (e) { }
            try { createRipple(); applyGlow(); } catch (e) { }
            return c + 1;
        });
    }, [triggerVibration, target, allowContinueAfterTarget, playTick, allowFreeCounting]);

    // submit helper used by main submit button and target modal
    const submitCount = async (countToSubmit) => {
        if (!countToSubmit || Number(countToSubmit) <= 0) {
            showToast({ type: 'error', text: 'Count Value must be greater than 0' });
            return;
        }

        // If user has an active target that's not yet completed, warn them instead of submitting
        if (target > 0 && count < target) {
            setShowIncompleteTargetWarning(true);
            return;
        }

        const userData = localStorage.getItem('userData');

        if (userData) {
            try {
                setSubmitting(true);
                const user = JSON.parse(userData);
                // Create new history entry
                const newEntry = {
                    count: countToSubmit,
                    weeklyCounts: countToSubmit,
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                };
                const { data } = await apiClient.post(
                    '/api/api-tasbihUsers',
                    {
                        fullName: user.fullName,
                        address: user.address,
                        mobileNumber: user.mobile || user.email,
                        tasbihCount: countToSubmit,
                        weeklyCounts: countToSubmit,
                        history: [newEntry],
                    }
                );

                if (data && data.ok) {
                    setHistory((prev) => [newEntry, ...prev]);
                    setCount(0);
                    setTarget(0);
                    if (typeof window !== 'undefined') localStorage.removeItem('tasbihTarget');
                    setShowTargetReached(false);
                    setAllowContinueAfterTarget(false);
                    setAllowFreeCounting(false);
                    showToast({ type: 'success', text: 'Durood Counts Submitted Successfully' });
                } else {
                    showToast({ type: 'error', text: (data && data.message) || 'Failed to submit. Please try again.' });
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Error submitting tasbih:', error);
                showToast({ type: 'error', text: 'Failed to submit. Please try again.' });
            } finally {
                setSubmitting(false);
            }
        } else {
            const returnTo = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/tasbih';
            router.push(`/myProfile?returnTo=${encodeURIComponent(returnTo)}`);
        }
    };

    // determine which tick is active (scale count to 100 ticks)
    const activeTick = count > 0 ? (count - 1) % 100 : -1;

    // helper to render 100 tick marks around a circle
    const ticks = Array.from({ length: 100 }).map((_, i) => {
        const angle = (i / 100) * 360;
        const long = i % 5 === 0; // every 5th tick longer
        const isActive = i === activeTick;
        const y2 = isActive ? -72 : long ? -78 : -84;
        const strokeW = isActive ? 2.5 : long ? 2 : 1;
        const strokeColor = isActive ? "white" : "currentColor";
        return (
            <line
                key={i}
                x1="0"
                y1={-90}
                x2="0"
                y2={y2}
                strokeWidth={strokeW}
                transform={`rotate(${angle})`}
                stroke={strokeColor}
                strokeLinecap="round"
            />
        );
    });

    return (
        <section className="flex flex-col items-center min-h-screen px-4 py-1 bg-base-100 text-base-content">
            {/* Press animation keyframes for the tap button */}
            <style>{`
                @keyframes pressAnim {
                    0% { transform: translateY(0) scale(1); box-shadow: 0 10px 20px rgba(0,0,0,0.10); }
                    30% { transform: translateY(4px) scale(0.97); box-shadow: 0 6px 10px rgba(0,0,0,0.06); }
                    60% { transform: translateY(-2px) scale(1.02); box-shadow: 0 12px 20px rgba(0,0,0,0.12); }
                    100% { transform: translateY(0) scale(1); box-shadow: 0 10px 20px rgba(0,0,0,0.10); }
                }
                @keyframes rippleAnim { 0% { transform: scale(0.2); opacity: 0.6; } 100% { transform: scale(2.6); opacity: 0; } }
                .tap-ripple { position: absolute; width: 40px; height: 40px; left: calc(50% - 20px); top: calc(50% - 20px); border-radius: 999px; background: rgba(255,255,255,0.26); pointer-events: none; animation: rippleAnim 520ms cubic-bezier(.2,.9,.3,1) forwards; }
                .tap-glow-strong { box-shadow: 0 10px 38px rgba(99, 179, 95, 0.62), inset 0 4px 12px rgba(255,255,255,0.08); transform: translateY(-2px) scale(1.035); transition: box-shadow 260ms ease, transform 260ms ease; }
            `}</style>
            {/* Header */}
            <button
                className="flex items-center gap-2 mb-2 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>
            <div className="w-full max-w-3xl flex items-center gap-2">


            </div>

            {/* Hidden message removed from page — now shown only in modal */}

            {/* Card */}
            {/* Make this entire card respond to pointer and keyboard so taps anywhere increment the counter */}
            <div
                className="w-full max-w-3xl  card bg-base-200 shadow-md rounded-2xl p-4 flex flex-col items-center "
            >
                {/* Header row with label and reset button */}
                <div
                    className="w-full flex items-center justify-between mb-2"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="text-lg font-semibold text-primary">Tasbih Counter</p>
                    <button
                        aria-label="Reset"
                        className="btn btn-ghost btn-circle"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowResetConfirm(true);
                        }}
                    >
                        <RotateCw className="h-6 w-6" />
                    </button>
                </div>
                <div className="divider my-1" />

                {/* Target setter - Beautiful Dropdown */}
                <div className="w-full  p-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl shadow-sm border border-primary/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <label className="text-sm font-semibold text-primary">Set Target:</label>
                            <select
                                aria-label="Select Target Value"
                                className="select select-bordered select-sm bg-base-100 border-primary/30 focus:border-primary focus:outline-none w-full md:w-40 font-medium text-primary shadow-sm"
                                value={allowFreeCounting ? "no-target" : (target || "")}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // If there's an active target that isn't completed, block changing it
                                    if (target > 0 && count < target) {
                                        setPendingTarget(value);
                                        setShowActiveTargetWarning(true);
                                        return;
                                    }

                                    if (value === "manual") {
                                        setShowManualInput(true);
                                        setAllowFreeCounting(false);
                                    } else if (value === "no-target") {
                                        // Allow free counting without any target restrictions
                                        setTarget(0);
                                        setAllowFreeCounting(true);
                                        setShowTargetTooltip(false);
                                        setAllowContinueAfterTarget(false);
                                        if (typeof window !== 'undefined') localStorage.removeItem('tasbihTarget');
                                        showToast({ type: 'success', text: `No target — free counting enabled` });
                                    } else if (value) {
                                        const v = Number(value);
                                        setTarget(v);
                                        setShowTargetTooltip(false);
                                        setAllowContinueAfterTarget(false);
                                        setAllowFreeCounting(false);
                                        showToast({ type: 'success', text: `Target set to ${v}` });
                                    }
                                }}
                            >
                                <option value="" disabled hidden>Please Select</option>
                                <option value="manual">⚙️ Manual</option>
                                <option value="no-target" className="text-error">No Target</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="400">400</option>
                                <option value="500">500</option>
                                <option value="700">700</option>
                                <option value="1000">1000</option>
                            </select>
                        </div>

                        {/* Tooltip shown when user attempts to start without setting a target */}
                        {showTargetTooltip && (
                            <div className={
                                "text-xs px-3 py-1.5 rounded-lg border font-medium " +
                                (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                    ? 'bg-error text-white border-error/30'
                                    : 'bg-error/10 text-error border-error/20')
                            }>
                                ⚠️ Please set a target first
                            </div>
                        )}

                        <div className="text-sm font-medium text-primary/90 w-full md:w-auto text-center md:text-right">
                            <div className="flex flex-col items-center md:items-end gap-2">
                                {allowFreeCounting ? (
                                    <span className="bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">No Target</span>
                                ) : target > 0 ? (
                                    <span className="bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">🎯 Target: <strong className="text-primary">{target}</strong></span>
                                ) : (
                                    <span className="text-primary/60">No target set</span>
                                )}

                                {/* Show/Hide toggle for the info cards (underline link) */}
                                <button
                                    onClick={() => setShowCards((s) => !s)}
                                    aria-expanded={showCards}
                                    className={
                                        "text-sm underline underline-offset-4 font-medium focus:outline-none " +
                                        (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                            ? 'text-primary/90'
                                            : 'text-primary')
                                    }
                                >
                                    {showCards ? 'Hide Durood Sharif' : 'Show Durood Sharif'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Collapsible wrapper for carousel controls + cards (starts from carousel buttons down) */}
                    <div
                        className={
                            "w-full overflow-hidden transition-[max-height,opacity] duration-300 " +
                            (showCards ? 'max-h-[1600px] opacity-100 mt-2' : 'max-h-0 opacity-0')
                        }
                        aria-hidden={!showCards}
                    >
                        <div className="w-full flex items-center justify-center gap-6 mb-2 mt-[-4]">
                            <button
                                aria-label="Previous info card"
                                onClick={() => setCurrentCard((c) => (c - 1 + cards.length) % cards.length)}
                                className={
                                    "flex items-center justify-center w-11 h-11 rounded-full text-primary border shadow-md hover:scale-105 transition-transform focus:outline-none mt-2 " +
                                    (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                        ? 'bg-neutral/10 border-neutral/20'
                                        : 'bg-primary/8 border-primary/20')
                                }
                            >
                                <FaArrowLeft className="h-5 w-5" />
                            </button>

                            <button
                                aria-label="Next info card"
                                onClick={() => setCurrentCard((c) => (c + 1) % cards.length)}
                                className={
                                    "flex items-center justify-center w-11 h-11 rounded-full text-primary border shadow-md hover:scale-105 transition-transform focus:outline-none mt-2 " +
                                    (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                        ? 'bg-neutral/10 border-neutral/20'
                                        : 'bg-primary/8 border-primary/20')
                                }
                            >
                                <FaArrowRight className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Cards Carousel - theme aware, responsive */}
                        <div className="w-full mb-4">
                            <div ref={carouselRef} className="relative w-full max-w-3xl mx-auto">


                                <div
                                    className={
                                        "overflow-hidden rounded-xl border p-0 " +
                                        (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                            ? 'bg-neutral/6 border-neutral/20'
                                            : 'bg-base-100/60 border-primary/10')
                                    }
                                    style={{ height: carouselHeight ? `${carouselHeight}px` : 'auto', transition: 'height 280ms ease' }}
                                >
                                    <div
                                        className="flex items-start transition-transform duration-300 ease-in-out"
                                        style={{ transform: `translateX(-${currentCard * 100}%)` }}
                                    >
                                        {cards.map((card, idx) => (
                                            <div
                                                key={idx}
                                                ref={(el) => (cardRefs.current[idx] = el)}
                                                style={{ flex: '0 0 100%' }}
                                                className="w-full p-3 flex flex-col gap-2"
                                            >
                                                <h4 className="text-lg font-semibold  text-warning mt-[-4]">{card.title}</h4>
                                                <div className="text-sm leading-relaxed">
                                                    {(() => {
                                                        const lines = card.content.split('\n');
                                                        return (
                                                            <>
                                                                <p className="text-xl text-primary/90">{lines[0]}</p>
                                                                {expandedCards[idx]
                                                                    ? lines.slice(1).map((line, i) => (
                                                                        <p key={i} className="text-sm text-info italic">
                                                                            {line}
                                                                        </p>
                                                                    ))
                                                                    : null}
                                                            </>
                                                        );
                                                    })()}

                                                    <div className="mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedCards((prev) => {
                                                                    const copy = Array.from(prev);
                                                                    copy[idx] = !copy[idx];
                                                                    return copy;
                                                                })
                                                            }
                                                            className="btn btn-ghost btn-sm px-3 text-error"
                                                        >
                                                            {expandedCards[idx] ? "Hide Fazilat" : "View Fazilat"}
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dots */}
                                <div className="flex gap-2 justify-center mt-3">
                                    {cards.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentCard(i)}
                                            aria-label={`Go to card ${i + 1}`}
                                            className={
                                                "w-3 h-3 rounded-full transition-colors " +
                                                (i === currentCard ? 'bg-primary' : 'bg-primary/30')
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Circular ring with ticks */}
                <div className="relative flex items-center justify-center ">
                    <svg
                        viewBox="-110 -110 220 220"
                        width="260"
                        height="260"
                        className="text-primary/80"
                    >
                        <g transform="translate(0,0)">{ticks}</g>
                        <circle
                            cx="0"
                            cy="0"
                            r="92"
                            fill="none"
                            stroke="currentColor"
                            strokeOpacity="0.08"
                            strokeWidth="6"
                        />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center ">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-extrabold text-primary">
                                {target > 0
                                    ? `${count}/${target}`
                                    : count.toString().padStart(2, "0")
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Large tappable area */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <button
                        onClick={() => increment()}
                        onPointerDown={startPress}
                        onTouchStart={startPress}
                        aria-disabled={!allowFreeCounting && target <= 0}
                        aria-label="Increment Tasbih"
                        className="relative -mb-1 p-4 rounded-full focus:outline-none"
                        title="Tap to increment"
                    >
                        <span
                            onAnimationEnd={() => setPressing(false)}
                            style={{ animation: pressing ? 'pressAnim 260ms cubic-bezier(.2,.9,.3,1)' : 'none' }}
                            ref={tapInnerRef}
                            className={
                                "relative flex items-center justify-center w-28 h-28 rounded-full transition-transform shadow-xl overflow-hidden " +
                                (!allowFreeCounting && target <= 0
                                    ? 'bg-base-100 border border-primary/30 text-primary/70 opacity-90'
                                    : 'bg-gradient-to-b from-primary to-primary/80 text-white')
                            }
                        >
                            <PiHandTapLight className="h-16 w-16" />
                        </span>
                    </button>

                    <div className="text-xl font-bold">Tap Above</div>
                </div>
            </div>

            {/* Limit reached modal */}
            {showLimitReached && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg text-primary">
                                🎉 Congratulations!
                            </h3>
                            <p className="py-4">
                                You have reached the maximum count of 10,000!
                                Please reset the counter to continue.
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setCount(0);
                                        setTarget(0);
                                        if (typeof window !== 'undefined') localStorage.removeItem('tasbihTarget');
                                        setShowManualInput(false);
                                        setShowLimitReached(false);
                                        setShowTargetReached(false);
                                        setAllowContinueAfterTarget(false);
                                        setAllowFreeCounting(false);
                                        setPendingTarget(null);
                                    }}
                                >
                                    Reset Counter
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowLimitReached(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset confirmation modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg">Reset Counter</h3>
                            <p className="py-4">
                                Are you sure you want to reset the tasbih
                                counter?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setCount(0);
                                        setTarget(0);
                                        if (typeof window !== 'undefined') localStorage.removeItem('tasbihTarget');
                                        setShowManualInput(false);
                                        setShowResetConfirm(false);
                                        setShowTargetReached(false);
                                        setAllowContinueAfterTarget(false);
                                        setAllowFreeCounting(false);
                                        setPendingTarget(null);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowResetConfirm(false)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Target achieved modal (theme aware) */}
            {showTargetReached && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className={
                            "modal-box text-center " +
                            (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                ? 'bg-neutral text-neutral-content'
                                : 'bg-base-100 text-primary')
                        }>
                            <h3 className="font-bold text-lg">Target Achieved</h3>
                            <p className="py-4">
                                You have reached your target of <strong className="text-primary">{target}</strong>.
                                Would you like to Submit Or Skip?
                            </p>
                            <div className="modal-action justify-center flex gap-3">
                                <button
                                    className="btn btn-primary w-36"
                                    onClick={() => submitCount(target > 0 ? target : count)}
                                    disabled={submitting}
                                >
                                    {submitting ? <AnimatedLooader className="inline-block" /> : 'Submit'}
                                </button>
                                <button
                                    className="btn btn-error w-36"
                                    onClick={() => skipSubmit(target > 0 ? target : count)}
                                >
                                    Skip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning shown when user tries to change target while an active one exists */}
            {showActiveTargetWarning && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className={
                            "modal-box text-center " +
                            (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                ? 'bg-neutral text-neutral-content'
                                : 'bg-base-100 text-primary')
                        }>
                            <h3 className="font-bold text-lg">Active Target In Progress</h3>
                            <p className="py-4">
                                You already have an active target of <strong className="text-primary">{target}</strong>.
                                Please reset or complete the current target before setting a new one.
                            </p>
                            <div className="modal-action justify-center flex gap-3">
                                <button
                                    className="btn btn-error w-36"
                                    onClick={() => {
                                        // Reset current progress and apply pending target
                                        setCount(0);
                                        setShowActiveTargetWarning(false);
                                        setShowTargetReached(false);
                                        setAllowContinueAfterTarget(false);
                                        if (pendingTarget === 'manual') {
                                            setTarget(0);
                                            setShowManualInput(true);
                                            setAllowFreeCounting(false);
                                        } else if (pendingTarget === 'no-target') {
                                            setTarget(0);
                                            setAllowFreeCounting(true);
                                            if (typeof window !== 'undefined') localStorage.removeItem('tasbihTarget');
                                            showToast({ type: 'success', text: `No target — free counting enabled` });
                                        } else if (pendingTarget) {
                                            const v = Number(pendingTarget);
                                            setTarget(v);
                                            setAllowFreeCounting(false);
                                            showToast({ type: 'success', text: `Target set to ${v}` });
                                        }
                                        setPendingTarget(null);
                                    }}
                                >
                                    Reset & Set
                                </button>
                                <button
                                    className="btn btn-ghost w-36"
                                    onClick={() => {
                                        setShowActiveTargetWarning(false);
                                        setPendingTarget(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning shown when user tries to submit before completing the active target */}
            {showIncompleteTargetWarning && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className={
                            "modal-box text-center " +
                            (typeof window !== 'undefined' && effectiveTheme() === 'dark'
                                ? 'bg-neutral text-neutral-content'
                                : 'bg-base-100 text-primary')
                        }>
                            <h3 className="font-bold text-lg">Target Incomplete</h3>
                            <p className="py-4">
                                Your target is not completed.
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowIncompleteTargetWarning(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {/* Durood history list */}
            <div className="w-full max-w-3xl mt-6 mb-14 card bg-base-200 shadow-md rounded-2xl p-6">
                <button
                    className="btn btn-sm btn-primary mb-4"
                    onClick={() => submitCount(count)}
                    disabled={submitting}
                    aria-label="Register Durood"
                >
                    {submitting ? (
                        <AnimatedLooader className="inline-block" />
                    ) : (
                        'Submit Durood Sharif'
                    )}
                </button>
                <h3 className="text-lg font-bold mb-4 text-primary">
                    <span>Durood History</span>
                    <button
                        className="btn btn-ghost btn-sm text-error border border-error hover:bg-error/10 float-right"
                        style={{ float: "right" }}
                        aria-label="Clear History"
                        onClick={() => setShowClearHistoryConfirm(true)}
                    >
                        Delete History
                    </button>
                </h3>
                {history.length === 0 ? (
                    <div className="text-center text-base text-primary/70">
                        No history yet. Register your durood to see it here.
                    </div>
                ) : (
                    <>
                        {/* Desktop / Tablet: scrollable fixed table to avoid layout shift */}
                        <div className="hidden md:block w-full overflow-x-auto">
                            <table className="table table-fixed w-full text-primary text-l">
                                <thead>
                                    <tr>
                                        <th className="w-24">Counts</th>
                                        <th className="w-40">Date</th>
                                        <th className="w-36">Time</th>
                                        {/* Action column removed */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedHistory.map((item, idx) => (
                                        <tr
                                            key={
                                                idx +
                                                (currentPage - 1) *
                                                entriesPerPage
                                            }
                                        >
                                            <td className="align-middle">
                                                {item.count
                                                    .toString()
                                                    .padStart(2, "0")}
                                            </td>
                                            <td className="align-middle">
                                                {item.date}
                                            </td>
                                            <td className="align-middle">
                                                {new Date(
                                                    `1970-01-01T${item.time}`
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </td>
                                            {/* Action button removed */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile: stacked cards for each history row to avoid narrow columns and right overflow */}
                        <div className="md:hidden flex flex-col gap-3">
                            {paginatedHistory.map((item, idx) => (
                                <div
                                    key={
                                        idx + (currentPage - 1) * entriesPerPage
                                    }
                                    className="w-full bg-base-100 rounded-lg p-3 flex items-center justify-between border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="font-mono text-lg text-primary w-12 text-center">
                                            {item.count
                                                .toString()
                                                .padStart(2, "0")}
                                        </div>
                                        <div className="flex flex-col text-sm text-primary/90">
                                            <span className="font-semibold">
                                                {item.date}
                                            </span>
                                            <span className="text-xs text-primary/70">
                                                {new Date(
                                                    `1970-01-01T${item.time}`
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div>{/* Action button removed */}</div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination controls */}
                        {history.length > entriesPerPage && (
                            <div className="flex justify-center items-center gap-3 mt-6">
                                <button
                                    className="btn btn-sm btn-primary btn-outline hover:scale-105 transition-transform"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 font-semibold bg-primary/10 rounded-full text-primary">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-sm btn-primary btn-outline hover:scale-105 transition-transform"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}

                        <div className="mt-4 text-right text-lg font-bold text-primary">
                            Total Counts:{" "}
                            {history
                                .reduce(
                                    (sum, item) => sum + Number(item.count),
                                    0
                                )
                                .toString()
                                .padStart(2, "0")}
                        </div>
                    </>
                )}
            </div>

            {/* Delete confirmation modal */}
            {/* Clear History confirmation modal */}
            {showClearHistoryConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg text-error">
                                Clear History
                            </h3>
                            <p className="py-4">
                                Are you sure you want to clear all Durood
                                history permanently?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-error"
                                    onClick={async () => {
                                        // Clear from localStorage
                                        setHistory([]);
                                        localStorage.removeItem(
                                            "duroodHistory"
                                        );

                                        // Call DELETE API to clear history from database
                                        const userData = localStorage.getItem('userData');
                                        if (userData) {
                                            try {
                                                const user = JSON.parse(userData);
                                                await apiClient.delete('/api/api-tasbihUsers', {
                                                    data: {
                                                        mobileNumber: user.mobile || user.email,
                                                        clearHistory: true,
                                                    }
                                                });
                                                showToast({ type: 'success', text: 'History cleared successfully!' });
                                            } catch (error) {
                                                console.error('Error clearing history from database:', error);
                                                showToast({ type: 'error', text: 'Failed to clear history from server.' });
                                            }
                                        }

                                        setShowClearHistoryConfirm(false);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() =>
                                        setShowClearHistoryConfirm(false)
                                    }
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {deleteIndex !== null && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 ">
                    <div className="modal modal-open">
                        <div className="modal-box text-center">
                            <h3 className="font-bold text-lg">Delete Entry</h3>
                            <p className="py-4">
                                Are you sure you want to delete this entry?
                            </p>
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-error"
                                    onClick={() => {
                                        setHistory(
                                            history.filter(
                                                (_, i) => i !== deleteIndex
                                            )
                                        );
                                        setDeleteIndex(null);
                                    }}
                                >
                                    Yes
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setDeleteIndex(null)}
                                >
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Target Input Modal */}
            {showManualInput && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 backdrop-blur-sm">
                    <div className="modal modal-open">
                        <div className="modal-box text-center border border-primary/20 shadow-2xl">
                            <h3 className="font-bold text-xl text-primary mb-2">
                                🎯 Enter Custom Target
                            </h3>
                            <p className="text-sm text-primary/70 mb-4">
                                Set your own custom target count
                            </p>
                            <input
                                type="number"
                                min="1"
                                max="10000"
                                inputMode="numeric"
                                className="input input-bordered w-full max-w-xs text-center text-lg font-semibold border-primary/30 focus:border-primary"
                                value={manualTargetValue}
                                onChange={(e) => setManualTargetValue(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="Enter count"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const v = Number(manualTargetValue || 0);
                                        if (!v || v <= 0) {
                                            showToast({ type: 'error', text: 'Enter a valid target (> 0)' });
                                            return;
                                        }
                                        if (v > 10000) {
                                            showToast({ type: 'error', text: 'Target cannot exceed 10,000' });
                                            return;
                                        }
                                        setTarget(v);
                                        setShowTargetTooltip(false);
                                        setAllowContinueAfterTarget(false);
                                        setManualTargetValue('');
                                        setShowManualInput(false);
                                        showToast({ type: 'success', text: `Target set to ${v}` });
                                    }
                                }}
                            />
                            <div className="modal-action justify-center">
                                <button
                                    className="btn btn-primary px-6"
                                    onClick={() => {
                                        const v = Number(manualTargetValue || 0);
                                        if (!v || v <= 0) {
                                            showToast({ type: 'error', text: 'Enter a valid target (> 0)' });
                                            return;
                                        }
                                        if (v > 10000) {
                                            showToast({ type: 'error', text: 'Target cannot exceed 10,000' });
                                            return;
                                        }
                                        setTarget(v);
                                        setShowTargetTooltip(false);
                                        setAllowContinueAfterTarget(false);
                                        setManualTargetValue('');
                                        setShowManualInput(false);
                                        showToast({ type: 'success', text: `Target set to ${v}` });
                                    }}
                                >
                                    Set Target
                                </button>
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setShowManualInput(false);
                                        setManualTargetValue('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </section>
    );
}

