"use client"
import { useEffect, useRef, useState } from 'react';

export default function RaipurTimeTable({ onlyRaipur }) {
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

    // audio & testing helpers (same behaviour as page-level implementation)
    const sehriAudioRef = useRef(null);
    const iftariAudioRef = useRef(null);
    const playedRef = useRef({ sehri: null, iftari: null });
    const [debugMsg, setDebugMsg] = useState('');

    useEffect(() => {
        sehriAudioRef.current = new Audio('/sehri.mp3');
        iftariAudioRef.current = new Audio('/irftari.mp3');

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
            const table = document.querySelector('table');
            if (!table) return null;
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
            return null;
        };

        const tryNotify = (title, body) => {
            try {
                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification(title, { body });
            } catch (e) { }
        };

        const check = () => {
            const times = findTodayRowTimes();
            if (!times) return;
            // debug
            try {
                const now = new Date();
                const sehriTime = parseTimeStr(times.sehriText);
                // treat iftari as PM when no am/pm is provided
                const iftariTime = parseTimeStr(times.iftariText, true);
                const persistedSehri = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_sehri') : null;
                const persistedIftari = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_iftari') : null;
                const dbg = `raipur now=${now.toTimeString().slice(0, 8)} sehri=${times.sehriText} sehriTs=${sehriTime ? sehriTime.toTimeString().slice(0, 8) : 'null'} iftari=${times.iftariText} iftariTs=${iftariTime ? iftariTime.toTimeString().slice(0, 8) : 'null'} persistedSehri=${persistedSehri} persistedIftari=${persistedIftari}`;
                console.debug('Raipur schedule check', dbg);
                setDebugMsg(dbg);
            } catch (e) { console.debug(e); }
            // only play from this Raipur component when page indicates Raipur selected
            if (!onlyRaipur) return;
            const now = new Date();
            const sehriTime = parseTimeStr(times.sehriText);
            const iftariTime = parseTimeStr(times.iftariText);

            if (sehriTime && now >= sehriTime) {
                const key = (new Date()).toDateString();
                const persisted = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_sehri') : null;
                if (playedRef.current.sehri !== key && persisted !== key) {
                    playedRef.current.sehri = key;
                    tryNotify('Sehri Time', `Sehri time has started (${times.sehriText})`);
                    try {
                        const s = typeof localStorage !== 'undefined' ? localStorage.getItem('ramzan_sound_enabled') : null;
                        if (s === 'true') {
                            const p = sehriAudioRef.current?.play();
                            if (p && typeof p.then === 'function') {
                                p.then(() => {
                                    try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { }
                                }).catch(() => { });
                            } else {
                                try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { }
                            }
                        } else {
                            try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_sehri', key); } catch (e) { }
                        }
                    } catch (e) { }
                }
            }

            if (iftariTime && now >= iftariTime) {
                const key = (new Date()).toDateString();
                const persisted = (typeof localStorage !== 'undefined') ? localStorage.getItem('ramzan_played_iftari') : null;
                if (playedRef.current.iftari !== key && persisted !== key) {
                    playedRef.current.iftari = key;
                    tryNotify('Iftari Time', `Iftari time has started (${times.iftariText})`);
                    try {
                        const s = typeof localStorage !== 'undefined' ? localStorage.getItem('ramzan_sound_enabled') : null;
                        if (s === 'true') {
                            const p = iftariAudioRef.current?.play();
                            if (p && typeof p.then === 'function') {
                                p.then(() => {
                                    try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { }
                                }).catch(() => { });
                            } else {
                                try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { }
                            }
                        } else {
                            try { if (typeof localStorage !== 'undefined') localStorage.setItem('ramzan_played_iftari', key); } catch (e) { }
                        }
                    } catch (e) { }
                }
            }
        };

        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            try { Notification.requestPermission().catch(() => { }); } catch (e) { }
        }

        check();
        checker = setInterval(check, 10000);

        return () => {
            if (checker) clearInterval(checker);
        };
    }, []);

    return (
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
                            <tr className={isToday('19 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">1</td><td className="text-sm">19 Feb</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:13</td><td className="font-medium text-warning">06:08</td></tr>
                            <tr className={isToday('20 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">2</td><td className="text-sm">20 Feb</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:12</td><td className="font-medium text-warning">06:08</td></tr>
                            <tr className={isToday('21 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">3</td><td className="text-sm">21 Feb</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:11</td><td className="font-medium text-warning">06:09</td></tr>
                            <tr className={isToday('22 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">4</td><td className="text-sm">22 Feb</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:11</td><td className="font-medium text-warning">06:09</td></tr>
                            <tr className={isToday('23 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">5</td><td className="text-sm">23 Feb</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:10</td><td className="font-medium text-warning">06:10</td></tr>
                            <tr className={isToday('24 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">6</td><td className="text-sm">24 Feb</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:09</td><td className="font-medium text-warning">06:10</td></tr>
                            <tr className={isToday('25 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">7</td><td className="text-sm">25 Feb</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:09</td><td className="font-medium text-warning">06:11</td></tr>
                            <tr className={isToday('26 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">8</td><td className="text-sm">26 Feb</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:08</td><td className="font-medium text-warning">06:11</td></tr>
                            <tr className={isToday('27 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">9</td><td className="text-sm">27 Feb</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:07</td><td className="font-medium text-warning">06:11</td></tr>
                            <tr className={isToday('28 Feb') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">10</td><td className="text-sm">28 Feb</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:07</td><td className="font-medium text-warning">06:12</td></tr>
                            <tr className={isToday('1 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">11</td><td className="text-sm">1 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:06</td><td className="font-medium text-warning">06:12</td></tr>
                            <tr className={isToday('2 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">12</td><td className="text-sm">2 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:05</td><td className="font-medium text-warning">06:13</td></tr>
                            <tr className={isToday('3 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">13</td><td className="text-sm">3 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:04</td><td className="font-medium text-warning">06:13</td></tr>
                            <tr className={isToday('4 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">14</td><td className="text-sm">4 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:04</td><td className="font-medium text-warning">06:13</td></tr>
                            <tr className={isToday('5 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">15</td><td className="text-sm">5 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:03</td><td className="font-medium text-warning">06:14</td></tr>
                            <tr className={isToday('6 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">16</td><td className="text-sm">6 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:02</td><td className="font-medium text-warning">06:14</td></tr>
                            <tr className={isToday('7 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">17</td><td className="text-sm">7 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:01</td><td className="font-medium text-warning">06:15</td></tr>
                            <tr className={isToday('8 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">18</td><td className="text-sm">8 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:00</td><td className="font-medium text-warning">06:15</td></tr>
                            <tr className={isToday('9 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">19</td><td className="text-sm">9 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">04:59</td><td className="font-medium text-warning">06:15</td></tr>
                            <tr className={isToday('10 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">20</td><td className="text-sm">10 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">04:59</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr className={isToday('11 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">21</td><td className="text-sm">11 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">04:58</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr className={isToday('12 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">22</td><td className="text-sm">12 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">04:57</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr className={isToday('13 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">23</td><td className="text-sm">13 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">04:56</td><td className="font-medium text-warning">06:17</td></tr>
                            <tr className={isToday('14 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">24</td><td className="text-sm">14 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">04:55</td><td className="font-medium text-warning">06:17</td></tr>
                            <tr className={isToday('15 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">25</td><td className="text-sm">15 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">04:54</td><td className="font-medium text-warning">06:17</td></tr>
                            <tr className={isToday('16 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">26</td><td className="text-sm">16 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">04:53</td><td className="font-medium text-warning">06:18</td></tr>
                            <tr className={isToday('17 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">27</td><td className="text-sm">17 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">04:52</td><td className="font-medium text-warning">06:18</td></tr>
                            <tr className={isToday('18 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">28</td><td className="text-sm">18 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">04:51</td><td className="font-medium text-warning">06:18</td></tr>
                            <tr className={isToday('19 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">29</td><td className="text-sm">19 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">04:50</td><td className="font-medium text-warning">06:19</td></tr>
                            <tr className={isToday('20 Mar') ? 'ring-4 ring-success/40 bg-success/20 border-2 border-success/60 rounded-md' : ''}><td className="font-semibold">30</td><td className="text-sm">20 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">04:50</td><td className="font-medium text-warning">06:19</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
