"use client"
import { FaAngleLeft, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import BackLoader from '../../../components/BackLoader.client';
import RaipurTimeTable from '../../../components/raipurTimeTable';

export default function Page() {
    const router = useRouter();
    const STORAGE_KEY = "ramzan_only_raipur";
    const SOUND_KEY = "ramzan_sound_enabled";
    const [onlyRaipur, setOnlyRaipur] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    // tick to force re-render so `isToday` updates when system date/time changes
    const [, setNowTick] = useState(0);
    const timerRef = useRef(null);
    const soundEnabledRef = useRef(false);

    useEffect(() => {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            if (v === "true") setOnlyRaipur(true);
            const s = localStorage.getItem(SOUND_KEY);
            if (s === "true") {
                setSoundEnabled(true);
                soundEnabledRef.current = true;
            }
            // no test UI state to load
            // no test overrides in production
        } catch (e) {
            // ignore
        }
    }, []);

    const handleOnlyRaipurChange = (checked) => {
        // show fake loader for 1 second, then apply change
        setShowLoader(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setOnlyRaipur(checked);
            try {
                if (checked) localStorage.setItem(STORAGE_KEY, "true");
                else localStorage.removeItem(STORAGE_KEY);
            } catch (e) {
                // ignore
            }
            setShowLoader(false);
            timerRef.current = null;
        }, 500);
    };

    const handleSoundChange = (checked) => {
        setSoundEnabled(checked);
        soundEnabledRef.current = checked;
        try {
            if (checked) {
                localStorage.setItem(SOUND_KEY, "true");
                // Clear the "already scheduled today" flag so alarms are re-scheduled immediately
                try { localStorage.removeItem(`ramzan_sched_done_${new Date().toDateString()}`); } catch (e) { }
                // Briefly play silence to unlock Web Audio context on iOS/Android
                if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                    audioCtxRef.current.resume().catch(() => { });
                }
                try {
                    const a = new Audio('/sehri.mp3');
                    a.volume = 0;
                    a.play().then(() => { a.pause(); }).catch(() => { });
                } catch (e) { }
                // Schedule native alarms now that sound is enabled
                setTimeout(() => scheduleNativeAlarmsOnce(), 500);
            } else {
                localStorage.removeItem(SOUND_KEY);
                // Cancel any previously scheduled native notifications
                if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
                    import('@tauri-apps/plugin-notification').then(nav => nav.cancelAll().catch(() => { })).catch(() => { });
                }
            }
        } catch (e) { }
    };



    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    // periodic re-render to refresh highlighting if system date changes
    useEffect(() => {
        const id = setInterval(() => setNowTick((n) => n + 1), 30 * 1000);
        return () => clearInterval(id);
    }, []);

    // helper: check if a date string in format "D Mon" (e.g. "28 Feb", "1 Mar") refers to today
    const isToday = (dateStr) => {
        try {
            if (!dateStr) return false;
            const parts = dateStr.trim().split(/\s+/);
            if (parts.length < 2) return false;
            const day = parseInt(parts[0], 10);
            const monStr = parts[1].replace(/\./g, '');
            const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
            const month = months[monStr];
            if (isNaN(day) || month === undefined) return false;
            const today = new Date();
            return today.getDate() === day && today.getMonth() === month;
        } catch (e) {
            return false;
        }
    };

    // Play audio announcement when sehri or iftari time hits
    const sehriAudioRef = useRef({ play: () => Promise.resolve() });
    const iftariAudioRef = useRef({ play: () => Promise.resolve() });
    const playedRef = useRef({ sehri: null, iftari: null });
    const audioCtxRef = useRef(null);

    // Send an immediate native notification (works in foreground)
    const tryNotify = async (title, body) => {
        try {
            if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
                const { invoke } = await import('@tauri-apps/api/core');
                const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
                let granted = await isPermissionGranted();
                if (!granted) {
                    const permission = await requestPermission();
                    granted = permission === 'granted';
                }
                if (granted) {
                    // Use invoke directly so it hits the native layer (not just window.Notification)
                    // Command name is 'notify' per the Tauri plugin Rust source
                    await invoke('plugin:notification|notify', {
                        options: { title, body, sound: 'default', channelId: 'ramzan_alert' }
                    }).catch(() => {
                        // Fallback to browser notification if invoke fails
                        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                            new Notification(title, { body });
                        }
                    });
                }
            } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification(title, { body });
            }
        } catch (e) { }
    };

    // Schedule a native alarm that fires even when app is closed/phone locked
    // Android: ExactAlarmAllowWhileIdle  |  iOS: UNUserNotificationCenter (works when locked/closed)
    // iosSoundName: name of the .caf file in the iOS bundle (without extension), e.g. 'sehri' or 'irftari'
    const scheduleNativeAlarm = async (date, idStr, titleStr, bodyStr, iosSoundName = 'default') => {
        if (!date || date <= new Date()) return;
        if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) return;
        try {
            const { invoke } = await import('@tauri-apps/api/core');
            const { isPermissionGranted, requestPermission, Schedule } = await import('@tauri-apps/plugin-notification');
            let granted = await isPermissionGranted();
            if (!granted) {
                const permission = await requestPermission();
                granted = permission === 'granted';
            }
            if (!granted) return;

            // Detect platform: channels are Android-only — on iOS create_channel is not needed
            let isIOS = false;
            try {
                const { platform } = await import('@tauri-apps/plugin-os');
                isIOS = (await platform()) === 'ios';
            } catch (e) { }

            if (!isIOS) {
                // Android: Create high-importance channel (required for custom sound + heads-up display)
                await invoke('plugin:notification|create_channel', {
                    id: 'ramzan_alert',
                    name: 'Ramzan Alerts',
                    description: 'Sehri and Iftari time alerts',
                    importance: 4,    // Importance.High
                    visibility: 1,    // Visibility.Public
                    vibration: true,
                    sound: 'ramzan_alert'  // matches res/raw/ramzan_alert.mp3 in Android assets
                }).catch(() => { });
            }

            // Use invoke directly — the JS sendNotification() wrapper just calls window.Notification
            // and does NOT reach the native scheduler on mobile.
            // Rust command name: 'notify' (from commands.rs in tauri-plugin-notification)
            const notifId = Math.abs(idStr.split('').reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0)) % 2147483647;
            await invoke('plugin:notification|notify', {
                options: {
                    id: notifId,
                    title: titleStr,
                    body: bodyStr,
                    // iOS: .caf file name (without extension) bundled in app  |  Android: res/raw sound name
                    sound: isIOS ? iosSoundName : 'ramzan_alert',
                    // channelId is ignored on iOS but required on Android
                    ...(isIOS ? {} : { channelId: 'ramzan_alert' }),
                    schedule: Schedule.at(date, false, true)  // allowWhileIdle=true → fires on locked screen
                }
            });
        } catch (e) {
            console.debug('scheduleNativeAlarm error', e);
        }
    };

    // Time table data (same as rendered table) for reliable lookups without DOM access
    const BILASPUR_TIMES = [
        { date: '19 Feb', sehri: '5:10', iftari: '6:06' }, { date: '20 Feb', sehri: '5:10', iftari: '6:06' },
        { date: '21 Feb', sehri: '5:09', iftari: '6:07' }, { date: '22 Feb', sehri: '5:09', iftari: '6:07' },
        { date: '23 Feb', sehri: '5:08', iftari: '6:08' }, { date: '24 Feb', sehri: '5:08', iftari: '6:08' },
        { date: '25 Feb', sehri: '5:07', iftari: '6:08' }, { date: '26 Feb', sehri: '5:07', iftari: '6:08' },
        { date: '27 Feb', sehri: '5:06', iftari: '6:09' }, { date: '28 Feb', sehri: '5:06', iftari: '6:09' },
        { date: '1 Mar', sehri: '5:04', iftari: '6:10' }, { date: '2 Mar', sehri: '5:02', iftari: '6:11' },
        { date: '3 Mar', sehri: '5:02', iftari: '6:11' }, { date: '4 Mar', sehri: '5:00', iftari: '6:12' },
        { date: '5 Mar', sehri: '5:00', iftari: '6:12' }, { date: '6 Mar', sehri: '4:59', iftari: '6:13' },
        { date: '7 Mar', sehri: '4:59', iftari: '6:13' }, { date: '8 Mar', sehri: '4:58', iftari: '6:14' },
        { date: '9 Mar', sehri: '4:58', iftari: '6:14' }, { date: '10 Mar', sehri: '4:56', iftari: '6:14' },
        { date: '11 Mar', sehri: '4:56', iftari: '6:14' }, { date: '12 Mar', sehri: '4:54', iftari: '6:15' },
        { date: '13 Mar', sehri: '4:54', iftari: '6:15' }, { date: '14 Mar', sehri: '4:52', iftari: '6:16' },
        { date: '15 Mar', sehri: '4:52', iftari: '6:16' }, { date: '16 Mar', sehri: '4:50', iftari: '6:16' },
        { date: '17 Mar', sehri: '4:50', iftari: '6:16' }, { date: '18 Mar', sehri: '4:48', iftari: '6:17' },
        { date: '19 Mar', sehri: '4:48', iftari: '6:17' }, { date: '20 Mar', sehri: '4:46', iftari: '6:17' },
    ];
    const RAIPUR_TIMES = [
        { date: '19 Feb', sehri: '05:13', iftari: '06:08' }, { date: '20 Feb', sehri: '05:12', iftari: '06:08' },
        { date: '21 Feb', sehri: '05:11', iftari: '06:09' }, { date: '22 Feb', sehri: '05:11', iftari: '06:09' },
        { date: '23 Feb', sehri: '05:10', iftari: '06:10' }, { date: '24 Feb', sehri: '05:09', iftari: '06:10' },
        { date: '25 Feb', sehri: '05:09', iftari: '06:11' }, { date: '26 Feb', sehri: '05:08', iftari: '06:11' },
        { date: '27 Feb', sehri: '05:07', iftari: '06:11' }, { date: '28 Feb', sehri: '05:07', iftari: '06:12' },
        { date: '1 Mar', sehri: '05:06', iftari: '06:12' }, { date: '2 Mar', sehri: '05:05', iftari: '06:13' },
        { date: '3 Mar', sehri: '05:04', iftari: '06:13' }, { date: '4 Mar', sehri: '05:04', iftari: '06:13' },
        { date: '5 Mar', sehri: '05:03', iftari: '06:14' }, { date: '6 Mar', sehri: '05:02', iftari: '06:14' },
        { date: '7 Mar', sehri: '05:01', iftari: '06:15' }, { date: '8 Mar', sehri: '05:00', iftari: '06:15' },
        { date: '9 Mar', sehri: '04:59', iftari: '06:15' }, { date: '10 Mar', sehri: '04:59', iftari: '06:16' },
        { date: '11 Mar', sehri: '04:58', iftari: '06:16' }, { date: '12 Mar', sehri: '04:57', iftari: '06:16' },
        { date: '13 Mar', sehri: '04:56', iftari: '06:17' }, { date: '14 Mar', sehri: '04:55', iftari: '06:17' },
        { date: '15 Mar', sehri: '04:54', iftari: '06:17' }, { date: '16 Mar', sehri: '04:53', iftari: '06:18' },
        { date: '17 Mar', sehri: '04:52', iftari: '06:18' }, { date: '18 Mar', sehri: '04:51', iftari: '06:18' },
        { date: '19 Mar', sehri: '04:50', iftari: '06:19' }, { date: '20 Mar', sehri: '04:50', iftari: '06:19' },
    ];

    // Parse "H:MM" or "HH:MM" with optional PM treatment
    const parseDatelessTime = (timeStr, treatAsPM = false) => {
        if (!timeStr) return null;
        const m = timeStr.trim().toLowerCase().match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
        if (!m) return null;
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        const suffix = m[3];
        if (suffix === 'am') { if (hh === 12) hh = 0; }
        else if (suffix === 'pm') { if (hh < 12) hh += 12; }
        else if (treatAsPM && hh < 12) { hh += 12; }
        const d = new Date();
        d.setHours(hh, mm, 0, 0);
        return d;
    };

    // Schedule Sehri & Iftari native alarms ONCE per day.
    // Using a localStorage key "ramzan_sched_done_DATE" prevents re-scheduling on every re-render.
    const scheduleNativeAlarmsOnce = async () => {
        if (typeof window === 'undefined' || !window.__TAURI_INTERNALS__) return;
        const soundOn = typeof localStorage !== 'undefined' && localStorage.getItem(SOUND_KEY) === 'true';
        if (!soundOn) return;
        const todayKey = new Date().toDateString();
        const schedDoneKey = `ramzan_sched_done_${todayKey}`;
        if (typeof localStorage !== 'undefined' && localStorage.getItem(schedDoneKey) === '1') return; // already scheduled today

        // Clear yesterday's sched key to avoid localStorage bloat
        try {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            localStorage.removeItem(`ramzan_sched_done_${yesterday.toDateString()}`);
        } catch (e) { }

        // Find today's row from embedded data (no DOM needed — works even before render)
        const onlyRaipurNow = typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
        const table = onlyRaipurNow ? RAIPUR_TIMES : BILASPUR_TIMES;
        const today = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const todayLabel = `${today.getDate()} ${months[today.getMonth()]}`;
        const row = table.find(r => r.date === todayLabel);
        if (!row) return;

        const sehriTime = parseDatelessTime(row.sehri);
        // Iftari times are all "6:xx" AM format in data but represent PM → treat as PM
        const iftariTime = parseDatelessTime(row.iftari, true);

        await scheduleNativeAlarm(
            sehriTime,
            `ramzan_sehri_${todayKey}`,
            'Sehri Time 🌙',
            `Sehri Ka Waqt Khatm Ho Gaya Hai (${row.sehri})`,
            'sehri'          // iOS: plays sehri.caf from app bundle
        );
        await scheduleNativeAlarm(
            iftariTime,
            `ramzan_iftari_${todayKey}`,
            'Iftari Time 🌅',
            `Iftari Ka Waqt Ho Gaya Hai (${row.iftari})`,
            'irftari'        // iOS: plays irftari.caf from app bundle
        );

        // Mark as scheduled for today
        try { localStorage.setItem(schedDoneKey, '1'); } catch (e) { }
    };

    useEffect(() => {
        // create Audio objects using Web Audio API for mobile compatibility
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext && !audioCtxRef.current) {
                audioCtxRef.current = new AudioContext();
            }
        } catch (e) { }

        const loadAudio = async (url, ref) => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                let audioBuffer = null;
                if (audioCtxRef.current) {
                    audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
                }
                ref.current = {
                    play: () => {
                        return new Promise((resolve) => {
                            try {
                                if (audioCtxRef.current && audioBuffer) {
                                    if (audioCtxRef.current.state === 'suspended') {
                                        audioCtxRef.current.resume();
                                    }
                                    const source = audioCtxRef.current.createBufferSource();
                                    source.buffer = audioBuffer;
                                    source.connect(audioCtxRef.current.destination);
                                    source.start(0);
                                    resolve();
                                } else {
                                    const a = new Audio(url);
                                    a.play().then(resolve).catch(resolve);
                                }
                            } catch (e) { resolve(); }
                        });
                    }
                };
            } catch (e) {
                console.error("Audio Load Error", e);
                const basic = new Audio(url);
                ref.current = { play: () => basic.play().catch(() => { }) };
            }
        };

        loadAudio('/sehri.mp3', sehriAudioRef);
        loadAudio('/irftari.mp3', iftariAudioRef);

        let checker = null;

        const getTodayLabel = () => {
            const today = new Date();
            const day = today.getDate();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${day} ${months[today.getMonth()]}`;
        };

        // parse a time string like "5:10", "05:10", or with am/pm like "5:10 pm".
        // if `treatAsPM` is true and no am/pm is present, times with hour < 12 are treated as PM (hour += 12).
        const parseTimeStr = (timeStr, treatAsPM = false) => {
            if (!timeStr) return null;
            const m = timeStr.trim().toLowerCase().match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
            if (!m) return null;
            let hh = parseInt(m[1], 10);
            const mm = parseInt(m[2], 10);
            const suffix = m[3];
            if (suffix === 'am') {
                if (hh === 12) hh = 0;
            } else if (suffix === 'pm') {
                if (hh < 12) hh += 12;
            } else if (treatAsPM && hh < 12) {
                hh += 12;
            }
            const d = new Date();
            d.setHours(hh);
            d.setMinutes(mm);
            d.setSeconds(0);
            d.setMilliseconds(0);
            return d;
        };



        const findTodayRowTimes = () => {
            const label = getTodayLabel();
            // look through all tables on page for a matching date cell
            const tables = document.querySelectorAll('table');
            for (const table of tables) {
                const rows = table.querySelectorAll('tbody tr');
                for (const r of rows) {
                    const tds = r.querySelectorAll('td');
                    if (tds.length < 5) continue;
                    const dateText = tds[1].textContent.trim();
                    if (dateText === label) {
                        const sehriText = tds[3].textContent.trim();
                        const iftariText = tds[4].textContent.trim();
                        return { sehriText, iftariText };
                    }
                }
            }
            return null;
        };

        const isSameMinute = (d1, d2) => {
            return d1 && d2 && d1.getHours() === d2.getHours() && d1.getMinutes() === d2.getMinutes();
        };

        const check = () => {

            // allow manual overrides (for normal flow) stored in localStorage
            const times = findTodayRowTimes();
            if (!times) return;
            // if user selected only Raipur, do not play sounds from the main (Bilaspur) player
            const onlyRaipur = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) === 'true' : false;
            if (onlyRaipur) return;
            const now = new Date();
            // debug info for diagnosis
            try {
                const sehriTime = parseTimeStr(times.sehriText);
                // treat iftari as PM when no am/pm is provided
                const iftariTime = parseTimeStr(times.iftariText, true);
                const persistedSehri = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_sehri') : null;
                const persistedIftari = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_iftari') : null;
                const dbg = `now=${now.toTimeString().slice(0, 8)} sehriText=${times.sehriText} sehri=${sehriTime ? sehriTime.toTimeString().slice(0, 8) : 'null'} iftariText=${times.iftariText} iftari=${iftariTime ? iftariTime.toTimeString().slice(0, 8) : 'null'} onlyRaipur=${onlyRaipur} soundEnabled=${soundEnabledRef.current} persistedSehri=${persistedSehri} persistedIftari=${persistedIftari}`;
                console.debug('Ramzan schedule check', dbg);
            } catch (e) { console.debug(e); }
            const sehriTime = parseTimeStr(times.sehriText);
            const iftariTime = parseTimeStr(times.iftariText, true);

            // NOTE: Native background alarms are scheduled once per day via scheduleNativeAlarmsOnce(),
            // not on every 10-second tick, to avoid duplicate notifications.

            if (sehriTime && isSameMinute(now, sehriTime)) {
                const key = (new Date()).toDateString();
                const persisted = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_sehri') : null;
                if (playedRef.current.sehri !== key && persisted !== key) {
                    playedRef.current.sehri = key;
                    tryNotify('Sehri Time 🌙', `Sehri Ka Waqt Khatm Ho Gaya Hai (${times.sehriText})`);
                    try {
                        if (soundEnabledRef.current) {
                            const p = sehriAudioRef.current?.play();
                            if (p && typeof p.then === 'function') {
                                p.then(() => { try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { } }).catch((e) => {
                                    console.error('Audio play failed:', e);
                                    try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { }
                                });
                            } else {
                                try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { }
                            }
                        } else {
                            try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { }
                        }
                    } catch (e) { console.error('Error in sehri sound', e); }
                }
            }

            if (iftariTime && isSameMinute(now, iftariTime)) {
                const key = (new Date()).toDateString();
                const persisted = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_iftari') : null;
                if (playedRef.current.iftari !== key && persisted !== key) {
                    playedRef.current.iftari = key;
                    tryNotify('Iftari Time 🌅', `Iftari Ka Waqt Ho Gaya Hai (${times.iftariText})`);
                    try {
                        if (soundEnabledRef.current) {
                            const p = iftariAudioRef.current?.play();
                            if (p && typeof p.then === 'function') {
                                p.then(() => { try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { } }).catch((e) => {
                                    console.error('Audio play failed:', e);
                                    try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { }
                                });
                            } else {
                                try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { }
                            }
                        } else {
                            try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { }
                        }
                    } catch (e) { console.error('Error in iftari sound', e); }
                }
            }
        };

        // Ask notification permission once
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            try { Notification.requestPermission().catch(() => { }); } catch (e) { }
        }

        // Schedule today's native alarms (once on mount — not every tick)
        scheduleNativeAlarmsOnce();

        // run immediately and then every 10 seconds
        check();
        checker = setInterval(check, 10000);

        return () => {
            if (checker) clearInterval(checker);
        };
    }, []);

    return (
        <main className="min-h-screen p-4 md:p-8 bg-base-200 text-base-content">
            <button
                className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                onClick={() => router.push("/ramzan")}
                aria-label="Back to Home"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>

            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">Ramzan Time Table {onlyRaipur ? 'Raipur' : 'Bilaspur'} C.G</h1>

            </div>
            <label className="flex items-center gap-2 text-sm text-primary">
                <input
                    type="checkbox"
                    className="toggle toggle-2xl checked:bg-primary checked:border-primary checked:after:bg-primary"
                    checked={onlyRaipur}
                    onChange={(e) => handleOnlyRaipurChange(e.target.checked)}
                    disabled={showLoader}
                    aria-label="Show Raipur timetable"
                />
                <span className="select-none">Show Raipur's Time Table</span>
            </label>

            <label className="flex items-center gap-2 text-sm text-primary mt-2">
                <input
                    type="checkbox"
                    className="toggle toggle-2xl checked:bg-primary checked:border-primary checked:after:bg-primary"
                    checked={soundEnabled}
                    onChange={(e) => handleSoundChange(e.target.checked)}
                    aria-label="Enable Ramzan sounds"
                />
                <span className="flex items-center gap-2 select-none">
                    {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                    <span>Enable Sehri / Iftari Announcement</span>
                </span>
            </label>

            {/* debug message removed */}

            {onlyRaipur ? (
                <RaipurTimeTable onlyRaipur={onlyRaipur} sehriAudioRef={sehriAudioRef} iftariAudioRef={iftariAudioRef} />
            ) : (
                <>
                    {/* ##############################Mobile single stacked table showing all 30 rows */}
                    <div className="mt-6 md:hidden">
                        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] touch-auto">
                            <table className="table table-compact table-fixed w-full whitespace-nowrap divide-y divide-primary">
                                <thead>
                                    <tr>
                                        <th className="sticky top-0 z-24 w-10 bg-primary text-primary-content text-center">Roza</th>
                                        <th className="sticky top-0 z-20 w-20 bg-primary text-primary-content text-center">Date</th>
                                        <th className="sticky top-0 z-20 w-12 bg-primary text-primary-content text-center">Day</th>
                                        <th className="sticky top-0 z-20 w-16 bg-primary text-primary-content text-center">Sehri</th>
                                        <th className="sticky top-0 z-20 w-20 bg-primary text-primary-content text-center">Iftar</th>
                                    </tr>
                                </thead>
                                <tbody className=" [&>tr>td]:border-t [&>tr>td]:border-primary">
                                    <tr className={isToday('19 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">1</td><td className="text-sm">19 Feb</td><td className="text-sm">Thu</td><td className="font-medium text-success">5:10</td><td className="font-medium text-warning">6:06</td></tr>
                                    <tr className={isToday('20 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">2</td><td className="text-sm">20 Feb</td><td className="text-sm">Fri</td><td className="font-medium text-success">5:10</td><td className="font-medium text-warning">6:06</td></tr>
                                    <tr className={isToday('21 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">3</td><td className="text-sm">21 Feb</td><td className="text-sm">Sat</td><td className="font-medium text-success">5:09</td><td className="font-medium text-warning">6:07</td></tr>
                                    <tr className={isToday('22 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">4</td><td className="text-sm">22 Feb</td><td className="text-sm">Sun</td><td className="font-medium text-success">5:09</td><td className="font-medium text-warning">6:07</td></tr>
                                    <tr className={isToday('23 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">5</td><td className="text-sm">23 Feb</td><td className="text-sm">Mon</td><td className="font-medium text-success">5:08</td><td className="font-medium text-warning">6:08</td></tr>
                                    <tr className={isToday('24 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">6</td><td className="text-sm">24 Feb</td><td className="text-sm">Tue</td><td className="font-medium text-success">5:08</td><td className="font-medium text-warning">6:08</td></tr>
                                    <tr className={isToday('25 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">7</td><td className="text-sm">25 Feb</td><td className="text-sm">Wed</td><td className="font-medium text-success">5:07</td><td className="font-medium text-warning">6:08</td></tr>
                                    <tr className={isToday('26 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">8</td><td className="text-sm">26 Feb</td><td className="text-sm">Thu</td><td className="font-medium text-success">5:07</td><td className="font-medium text-warning">6:08</td></tr>
                                    <tr className={isToday('27 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">9</td><td className="text-sm">27 Feb</td><td className="text-sm">Fri</td><td className="font-medium text-success">5:06</td><td className="font-medium text-warning">6:09</td></tr>
                                    <tr className={isToday('28 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">10</td><td className="text-sm">28 Feb</td><td className="text-sm">Sat</td><td className="font-medium text-success">5:06</td><td className="font-medium text-warning">6:09</td></tr>
                                    <tr className={isToday('1 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">11</td><td className="text-sm">1 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">5:04</td><td className="font-medium text-warning">6:10</td></tr>
                                    <tr className={isToday('2 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">12</td><td className="text-sm">2 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">5:02</td><td className="font-medium text-warning">6:11</td></tr>
                                    <tr className={isToday('3 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">13</td><td className="text-sm">3 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">5:02</td><td className="font-medium text-warning">6:11</td></tr>
                                    <tr className={isToday('4 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">14</td><td className="text-sm">4 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">5:00</td><td className="font-medium text-warning">6:12</td></tr>
                                    <tr className={isToday('5 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">15</td><td className="text-sm">5 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">5:00</td><td className="font-medium text-warning">6:12</td></tr>
                                    <tr className={isToday('6 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">16</td><td className="text-sm">6 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">4:59</td><td className="font-medium text-warning">6:13</td></tr>
                                    <tr className={isToday('7 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">17</td><td className="text-sm">7 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">4:59</td><td className="font-medium text-warning">6:13</td></tr>
                                    <tr className={isToday('8 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">18</td><td className="text-sm">8 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">4:58</td><td className="font-medium text-warning">6:14</td></tr>
                                    <tr className={isToday('9 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">19</td><td className="text-sm">9 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">4:58</td><td className="font-medium text-warning">6:14</td></tr>
                                    <tr className={isToday('10 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">20</td><td className="text-sm">10 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">4:56</td><td className="font-medium text-warning">6:14</td></tr>
                                    <tr className={isToday('11 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">21</td><td className="text-sm">11 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">4:56</td><td className="font-medium text-warning">6:14</td></tr>
                                    <tr className={isToday('12 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">22</td><td className="text-sm">12 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">4:54</td><td className="font-medium text-warning">6:15</td></tr>
                                    <tr className={isToday('13 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">23</td><td className="text-sm">13 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">4:54</td><td className="font-medium text-warning">6:15</td></tr>
                                    <tr className={isToday('14 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">24</td><td className="text-sm">14 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">4:52</td><td className="font-medium text-warning">6:16</td></tr>
                                    <tr className={isToday('15 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">25</td><td className="text-sm">15 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">4:52</td><td className="font-medium text-warning">6:16</td></tr>
                                    <tr className={isToday('16 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">26</td><td className="text-sm">16 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">4:50</td><td className="font-medium text-warning">6:16</td></tr>
                                    <tr className={isToday('17 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">27</td><td className="text-sm">17 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">4:50</td><td className="font-medium text-warning">6:16</td></tr>
                                    <tr className={isToday('18 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">28</td><td className="text-sm">18 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">4:48</td><td className="font-medium text-warning">6:17</td></tr>
                                    <tr className={isToday('19 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">29</td><td className="text-sm">19 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">4:48</td><td className="font-medium text-warning">6:17</td></tr>
                                    <tr className={isToday('20 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">30</td><td className="text-sm">20 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">4:46</td><td className="font-medium text-warning">6:17</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </main>
    )
}
