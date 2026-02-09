export default function RaipurTimeTable() {
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
                            <tr><td className="font-semibold">1</td><td className="text-sm">19 Feb</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:17</td><td className="font-medium text-warning">06:06</td></tr>
                            <tr><td className="font-semibold">2</td><td className="text-sm">20 Feb</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:17</td><td className="font-medium text-warning">06:06</td></tr>
                            <tr><td className="font-semibold">3</td><td className="text-sm">21 Feb</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:16</td><td className="font-medium text-warning">06:07</td></tr>
                            <tr><td className="font-semibold">4</td><td className="text-sm">22 Feb</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:16</td><td className="font-medium text-warning">06:07</td></tr>
                            <tr><td className="font-semibold">5</td><td className="text-sm">23 Feb</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:15</td><td className="font-medium text-warning">06:08</td></tr>
                            <tr><td className="font-semibold">6</td><td className="text-sm">24 Feb</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:15</td><td className="font-medium text-warning">06:08</td></tr>
                            <tr><td className="font-semibold">7</td><td className="text-sm">25 Feb</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:14</td><td className="font-medium text-warning">06:08</td></tr>
                            <tr><td className="font-semibold">8</td><td className="text-sm">26 Feb</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:14</td><td className="font-medium text-warning">06:08</td></tr>
                            <tr><td className="font-semibold">9</td><td className="text-sm">27 Feb</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:13</td><td className="font-medium text-warning">06:09</td></tr>
                            <tr><td className="font-semibold">10</td><td className="text-sm">28 Feb</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:13</td><td className="font-medium text-warning">06:09</td></tr>
                            <tr><td className="font-semibold">11</td><td className="text-sm">1 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:11</td><td className="font-medium text-warning">06:10</td></tr>
                            <tr><td className="font-semibold">12</td><td className="text-sm">2 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:11</td><td className="font-medium text-warning">06:10</td></tr>
                            <tr><td className="font-semibold">13</td><td className="text-sm">3 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:09</td><td className="font-medium text-warning">06:11</td></tr>
                            <tr><td className="font-semibold">14</td><td className="text-sm">4 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:09</td><td className="font-medium text-warning">06:11</td></tr>
                            <tr><td className="font-semibold">15</td><td className="text-sm">5 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:07</td><td className="font-medium text-warning">06:12</td></tr>
                            <tr><td className="font-semibold">16</td><td className="text-sm">6 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:07</td><td className="font-medium text-warning">06:12</td></tr>
                            <tr><td className="font-semibold">17</td><td className="text-sm">7 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:06</td><td className="font-medium text-warning">06:13</td></tr>
                            <tr><td className="font-semibold">18</td><td className="text-sm">8 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">05:06</td><td className="font-medium text-warning">06:13</td></tr>
                            <tr><td className="font-semibold">19</td><td className="text-sm">9 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">05:05</td><td className="font-medium text-warning">06:14</td></tr>
                            <tr><td className="font-semibold">20</td><td className="text-sm">10 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">05:05</td><td className="font-medium text-warning">06:14</td></tr>
                            <tr><td className="font-semibold">21</td><td className="text-sm">11 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">05:03</td><td className="font-medium text-warning">06:14</td></tr>
                            <tr><td className="font-semibold">22</td><td className="text-sm">12 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">05:03</td><td className="font-medium text-warning">06:14</td></tr>
                            <tr><td className="font-semibold">23</td><td className="text-sm">13 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">05:01</td><td className="font-medium text-warning">06:15</td></tr>
                            <tr><td className="font-semibold">24</td><td className="text-sm">14 Mar</td><td className="text-sm">Fri</td><td className="font-medium text-success">05:01</td><td className="font-medium text-warning">06:15</td></tr>
                            <tr><td className="font-semibold">25</td><td className="text-sm">15 Mar</td><td className="text-sm">Sat</td><td className="font-medium text-success">04:59</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr><td className="font-semibold">26</td><td className="text-sm">16 Mar</td><td className="text-sm">Sun</td><td className="font-medium text-success">04:59</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr><td className="font-semibold">27</td><td className="text-sm">17 Mar</td><td className="text-sm">Mon</td><td className="font-medium text-success">04:57</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr><td className="font-semibold">28</td><td className="text-sm">18 Mar</td><td className="text-sm">Tue</td><td className="font-medium text-success">04:57</td><td className="font-medium text-warning">06:16</td></tr>
                            <tr><td className="font-semibold">29</td><td className="text-sm">19 Mar</td><td className="text-sm">Wed</td><td className="font-medium text-success">04:55</td><td className="font-medium text-warning">06:17</td></tr>
                            <tr><td className="font-semibold">30</td><td className="text-sm">20 Mar</td><td className="text-sm">Thu</td><td className="font-medium text-success">04:55</td><td className="font-medium text-warning">06:17</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
