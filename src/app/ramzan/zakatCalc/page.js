'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcDonate } from 'react-icons/fc';
import { FaAngleLeft } from 'react-icons/fa';

export default function ZakatCalculator() {
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [zakatAmount, setZakatAmount] = useState(null);

    const calculateZakat = () => {
        if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
            const zakat = (parseFloat(amount) * 2.5) / 100;
            setZakatAmount(zakat.toFixed(2));
        } else {
            setZakatAmount(null);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        if (value === '') {
            setZakatAmount(null);
        }
    };

    const handleClear = () => {
        setAmount('');
        setZakatAmount(null);
    };

    return (
        <div className="min-h-screen bg-base-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <button
                    className="flex items-center gap-2 mb-4 text-lg text-primary hover:text-green-600 font-semibold"
                    onClick={() => router.push("/ramzan")}
                    aria-label="Back to Home"
                >
                    <FaAngleLeft /> Back
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-4">Zakat Calculator</h1>
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-base-200 border-4 border-primary/30 rounded-full p-4 shadow-xl">
                                <FcDonate className="text-6xl" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Main Card */}
                <div className="bg-base-200 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Decorative Header */}
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-3"></div>

                    <div className="p-8">
                        {/* Input Section */}
                        <div className="mb-6">
                            <label className="block text-base-content font-semibold mb-4 text-center text-lg">
                                Enter Your Total Wealth
                            </label>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary text-2xl font-bold">₹</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                                                e.preventDefault();
                                            }
                                        }}
                                        placeholder="0.00"
                                        className="w-full pl-14 pr-6 py-5 text-3xl font-bold text-base-content border-2 border-primary/40 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/40 focus:border-primary bg-base-100 transition-all shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={calculateZakat}
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                            >
                                Calculate Zakat
                            </button>
                            <button
                                onClick={handleClear}
                                className="bg-base-300 hover:bg-base-content/20 text-base-content font-semibold py-4 px-6 rounded-xl transition-all"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Result Section */}
                        {zakatAmount !== null && (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 animate-fadeIn">
                                <div className="text-center">
                                    <p className="text-black font-bold font-medium mb-2">Your Zakat Amount</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-4xl font-bold text-emerald-600">₹</span>
                                        <span className="text-5xl font-bold text-emerald-600">{zakatAmount}</span>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                    {/* Decorative Footer */}
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 h-3"></div>
                </div>


            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}
