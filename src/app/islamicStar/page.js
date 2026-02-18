"use client";

import { FaAngleLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function IslamicStarPage() {
    const router = useRouter();
    const examImages = [
        'e1.jpeg',
        'e2.jpeg',
        'e3.png',
        'e4.jpeg',
        'e5.jpeg',
        'e6.jpeg',
        'e7.jpeg',
    ]

    return (
        <main className="flex min-h-screen flex-col items-start justify-start bg-[#09152a] text-gray-200 p-4 sm:p-6 pb-24 sm:pb-28" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}>
            <button
                className="flex items-center gap-2 mb-6 text-lg text-primary hover:text-yellow-400 font-semibold"
                onClick={() => router.push("/ramzan")}
                aria-label="Back to Ramzan"
                style={{ alignSelf: "flex-start" }}
            >
                <FaAngleLeft /> Back
            </button>

            <header className="text-center mb-8 w-full">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-white">Islamic Star</span>
                </h1>
            </header>

            <div className="glass-card p-6 max-w-3xl mx-4 rounded-xl bg-[#243447] border border-[#2d3f54] shadow-lg">
                <p className="text-sm text-gray-300 mb-4">
                    Below is an important announcement and study material for the upcoming exam.
                </p>

                <p className="mb-4 text-lg">
                    <strong className="text-yellow-300 text-xl">Exam on 4 March 2026 at your nearby masjid — pass the exam to win exciting prizes!</strong>
                </p>

                <p className="mb-6 text-sm text-gray-300">
                    First Exam (PDF):
                    <br />
                    <a
                        href="https://archive.org/details/Misbahi_Library_Book_No__481__/page/n7/mode/2up"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 underline"
                    >
                        Anwaar-e-shariat
                    </a>
                    <br />
                    <br />
                    Final Exam (PDF) :
                    <a

                        href="https://archive.org/details/makhzan-e-malumat/page/19/mode/2up"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 underline mt-2 block"
                    >
                        Makhzan-e-Malumat
                    </a>
                </p>

                <p className="text-sm text-gray-300">
                    The exam's questions will come from this PDF. Come prepared.
                </p>

            </div>

            <div className="w-full p-6 bg-[#243447] border-t border-b border-[#2d3f54] mt-6">
                <header className="text-center mb-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">राहे हिदायत इंडिया</h2>
                    <p className="text-sm text-gray-300 mt-1">अहम ऐलान — दीन इम्तिहान</p>
                </header>

                <div className="max-w-none">
                    <div className="space-y-4">
                        {examImages.map((img, idx) => (
                            <img
                                key={img}
                                src={`/exam/${img}`}
                                alt={`Exam page ${idx + 1}`}
                                className="w-full h-auto rounded-md shadow-md border-4 border-red-500"
                            />
                        ))}
                    </div>
                </div>
            </div>

        </main>
    );
}
