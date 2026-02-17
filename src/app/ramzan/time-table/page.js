"use client"
import { FaAngleLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import BackLoader from '../../../components/BackLoader.client';
import RaipurTimeTable from '../../../components/raipurTimeTable';

export default function Page() {
    const router = useRouter();
    const STORAGE_KEY = "ramzan_only_raipur";
    const [onlyRaipur, setOnlyRaipur] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            if (v === "true") setOnlyRaipur(true);
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

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
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
            {showLoader && <BackLoader message="Switching..." />}
            {onlyRaipur ? (
                <RaipurTimeTable />
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
