"use client";

import { FaAngleLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function IslamicStarPage() {
    const router = useRouter();

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
                    Study material (PDF):
                    <br />
                    <a
                        href="https://archive.org/details/Misbahi_Library_Book_No__481__/page/n7/mode/2up"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-300 underline"
                    >
                        Open the PDF and study it carefully
                    </a>
                </p>

                <p className="text-sm text-gray-300">
                    The exam questions will come from this PDF. Come prepared.
                </p>

            </div>

        </main>
    );
}
