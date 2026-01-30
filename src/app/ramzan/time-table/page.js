"use client"

export default function Page() {
    return (
        <main className="min-h-screen p-4 md:p-8 bg-base-200 text-base-content">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">Ramzan Time Table Bilaspur C.G</h1>
                </div>

                <div className="hidden md:grid md:grid-cols-2 gap-6">
                    {/* Left column: Roza 1-15 */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="table table-compact w-full">
                                <thead>
                                    <tr className="bg-primary text-primary-content">
                                        <th className="w-6">Ramzan</th>
                                        <th>Date</th>
                                        <th>Day</th>
                                        <th>Sehri</th>
                                        <th>Iftar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-top"><td className="font-semibold">1</td><td className="text-sm">18 Feb 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:26 AM</td><td className="font-medium text-warning">06:48 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">2</td><td className="text-sm">19 Feb 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:25 AM</td><td className="font-medium text-warning">06:49 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">3</td><td className="text-sm">20 Feb 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:24 AM</td><td className="font-medium text-warning">06:49 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">4</td><td className="text-sm">21 Feb 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:23 AM</td><td className="font-medium text-warning">06:50 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">5</td><td className="text-sm">22 Feb 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:22 AM</td><td className="font-medium text-warning">06:50 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">6</td><td className="text-sm">23 Feb 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:21 AM</td><td className="font-medium text-warning">06:51 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">7</td><td className="text-sm">24 Feb 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:20 AM</td><td className="font-medium text-warning">06:51 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">8</td><td className="text-sm">25 Feb 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:19 AM</td><td className="font-medium text-warning">06:52 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">9</td><td className="text-sm">26 Feb 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:18 AM</td><td className="font-medium text-warning">06:52 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">10</td><td className="text-sm">27 Feb 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:17 AM</td><td className="font-medium text-warning">06:53 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">11</td><td className="text-sm">28 Feb 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:16 AM</td><td className="font-medium text-warning">06:53 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">12</td><td className="text-sm">01 Mar 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:15 AM</td><td className="font-medium text-warning">06:54 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">13</td><td className="text-sm">02 Mar 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:14 AM</td><td className="font-medium text-warning">06:54 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">14</td><td className="text-sm">03 Mar 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:13 AM</td><td className="font-medium text-warning">06:55 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">15</td><td className="text-sm">04 Mar 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:12 AM</td><td className="font-medium text-warning">06:55 PM</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right column: Roza 16-30 */}
                    <div className="card bg-base-100 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="table table-compact w-full">
                                <thead>
                                    <tr className="bg-primary text-primary-content">
                                        <th className="w-6">Ramzan</th>
                                        <th>Date</th>
                                        <th>Day</th>
                                        <th>Sehri</th>
                                        <th>Iftar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="align-top"><td className="font-semibold">16</td><td className="text-sm">05 Mar 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:11 AM</td><td className="font-medium text-warning">06:56 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">17</td><td className="text-sm">06 Mar 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:10 AM</td><td className="font-medium text-warning">06:56 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">18</td><td className="text-sm">07 Mar 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:09 AM</td><td className="font-medium text-warning">06:57 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">19</td><td className="text-sm">08 Mar 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:08 AM</td><td className="font-medium text-warning">06:57 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">20</td><td className="text-sm">09 Mar 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:07 AM</td><td className="font-medium text-warning">06:58 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">21</td><td className="text-sm">10 Mar 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:06 AM</td><td className="font-medium text-warning">06:58 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">22</td><td className="text-sm">11 Mar 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:05 AM</td><td className="font-medium text-warning">06:59 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">23</td><td className="text-sm">12 Mar 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:04 AM</td><td className="font-medium text-warning">06:59 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">24</td><td className="text-sm">13 Mar 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:03 AM</td><td className="font-medium text-warning">07:00 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">25</td><td className="text-sm">14 Mar 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:02 AM</td><td className="font-medium text-warning">07:00 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">26</td><td className="text-sm">15 Mar 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:01 AM</td><td className="font-medium text-warning">07:01 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">27</td><td className="text-sm">16 Mar 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:00 AM</td><td className="font-medium text-warning">07:01 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">28</td><td className="text-sm">17 Mar 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">04:59 AM</td><td className="font-medium text-warning">07:02 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">29</td><td className="text-sm">18 Mar 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">04:58 AM</td><td className="font-medium text-warning">07:02 PM</td></tr>
                                    <tr className="align-top"><td className="font-semibold">30</td><td className="text-sm">19 Mar 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">04:57 AM</td><td className="font-medium text-warning">07:03 PM</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* ##############################Mobile single stacked table showing all 30 rows */}
                <div className="mt-6 md:hidden card bg-base-100 shadow-sm">
                    <div className="overflow-x-auto overflow-y-auto max-h-[75vh] touch-auto">
                        <table className="table table-compact table-fixed w-full whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th className="sticky top-0 z-24 w-10 bg-primary text-primary-content text-center">Roza</th>
                                    <th className="sticky top-0 z-20 w-20 bg-primary text-primary-content text-center">Date</th>
                                    <th className="sticky top-0 z-20 w-10 bg-primary text-primary-content text-center">Day</th>
                                    <th className="sticky top-0 z-20 w-20 bg-primary text-primary-content text-center">Sehri</th>
                                    <th className="sticky top-0 z-20 w-22 bg-primary text-primary-content text-center">Iftar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td className="font-semibold">1</td><td className="text-sm">18 Feb 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:26 AM</td><td className="font-medium text-warning">06:48 PM</td></tr>
                                <tr><td className="font-semibold">2</td><td className="text-sm">19 Feb 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:25 AM</td><td className="font-medium text-warning">06:49 PM</td></tr>
                                <tr><td className="font-semibold">3</td><td className="text-sm">20 Feb 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:24 AM</td><td className="font-medium text-warning">06:49 PM</td></tr>
                                <tr><td className="font-semibold">4</td><td className="text-sm">21 Feb 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:23 AM</td><td className="font-medium text-warning">06:50 PM</td></tr>
                                <tr><td className="font-semibold">5</td><td className="text-sm">22 Feb 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:22 AM</td><td className="font-medium text-warning">06:50 PM</td></tr>
                                <tr><td className="font-semibold">6</td><td className="text-sm">23 Feb 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:21 AM</td><td className="font-medium text-warning">06:51 PM</td></tr>
                                <tr><td className="font-semibold">7</td><td className="text-sm">24 Feb 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:20 AM</td><td className="font-medium text-warning">06:51 PM</td></tr>
                                <tr><td className="font-semibold">8</td><td className="text-sm">25 Feb 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:19 AM</td><td className="font-medium text-warning">06:52 PM</td></tr>
                                <tr><td className="font-semibold">9</td><td className="text-sm">26 Feb 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:18 AM</td><td className="font-medium text-warning">06:52 PM</td></tr>
                                <tr><td className="font-semibold">10</td><td className="text-sm">27 Feb 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:17 AM</td><td className="font-medium text-warning">06:53 PM</td></tr>
                                <tr><td className="font-semibold">11</td><td className="text-sm">28 Feb 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:16 AM</td><td className="font-medium text-warning">06:53 PM</td></tr>
                                <tr><td className="font-semibold">12</td><td className="text-sm">01 Mar 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:15 AM</td><td className="font-medium text-warning">06:54 PM</td></tr>
                                <tr><td className="font-semibold">13</td><td className="text-sm">02 Mar 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:14 AM</td><td className="font-medium text-warning">06:54 PM</td></tr>
                                <tr><td className="font-semibold">14</td><td className="text-sm">03 Mar 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:13 AM</td><td className="font-medium text-warning">06:55 PM</td></tr>
                                <tr><td className="font-semibold">15</td><td className="text-sm">04 Mar 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:12 AM</td><td className="font-medium text-warning">06:55 PM</td></tr>
                                <tr><td className="font-semibold">16</td><td className="text-sm">05 Mar 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:11 AM</td><td className="font-medium text-warning">06:56 PM</td></tr>
                                <tr><td className="font-semibold">17</td><td className="text-sm">06 Mar 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:10 AM</td><td className="font-medium text-warning">06:56 PM</td></tr>
                                <tr><td className="font-semibold">18</td><td className="text-sm">07 Mar 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:09 AM</td><td className="font-medium text-warning">06:57 PM</td></tr>
                                <tr><td className="font-semibold">19</td><td className="text-sm">08 Mar 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:08 AM</td><td className="font-medium text-warning">06:57 PM</td></tr>
                                <tr><td className="font-semibold">20</td><td className="text-sm">09 Mar 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:07 AM</td><td className="font-medium text-warning">06:58 PM</td></tr>
                                <tr><td className="font-semibold">21</td><td className="text-sm">10 Mar 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:06 AM</td><td className="font-medium text-warning">06:58 PM</td></tr>
                                <tr><td className="font-semibold">22</td><td className="text-sm">11 Mar 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:05 AM</td><td className="font-medium text-warning">06:59 PM</td></tr>
                                <tr><td className="font-semibold">23</td><td className="text-sm">12 Mar 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:04 AM</td><td className="font-medium text-warning">06:59 PM</td></tr>
                                <tr><td className="font-semibold">24</td><td className="text-sm">13 Mar 25</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:03 AM</td><td className="font-medium text-warning">07:00 PM</td></tr>
                                <tr><td className="font-semibold">25</td><td className="text-sm">14 Mar 25</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:02 AM</td><td className="font-medium text-warning">07:00 PM</td></tr>
                                <tr><td className="font-semibold">26</td><td className="text-sm">15 Mar 25</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:01 AM</td><td className="font-medium text-warning">07:01 PM</td></tr>
                                <tr><td className="font-semibold">27</td><td className="text-sm">16 Mar 25</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:00 AM</td><td className="font-medium text-warning">07:01 PM</td></tr>
                                <tr><td className="font-semibold">28</td><td className="text-sm">17 Mar 25</td><td className="text-sm">Mon</td><td className="font-medium text-success">04:59 AM</td><td className="font-medium text-warning">07:02 PM</td></tr>
                                <tr><td className="font-semibold">29</td><td className="text-sm">18 Mar 25</td><td className="text-sm">Tue</td><td className="font-medium text-success">04:58 AM</td><td className="font-medium text-warning">07:02 PM</td></tr>
                                <tr><td className="font-semibold">30</td><td className="text-sm">19 Mar 25</td><td className="text-sm">Wed</td><td className="font-medium text-success">04:57 AM</td><td className="font-medium text-warning">07:03 PM</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
