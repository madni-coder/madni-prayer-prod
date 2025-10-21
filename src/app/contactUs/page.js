"use client";
import React, { useState, useEffect } from "react";

import Link from "next/link";

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#1a2332] text-gray-100 p-4 sm:p-6 mb-[64px]">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-green-400 mb-2">
                    Contact Us
                </h1>
            </header>

            {/* Information Demo Section */}
            <section className="mb-8 w-full max-w-4xl">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-green-400">
                    Motive Of Our App
                </h2>
                <div className="bg-green-700 rounded-lg p-6 text-white">
                    <p className="text-base md:text-lg">
                        Our platform is designed to help you stay connected with
                        Jamat Times manage daily prayer times, and access
                        essential Islamic resources. Experience a seamless and
                        modern interface tailored for your spiritual journey.
                    </p>
                </div>
            </section>

            {/* About Us Section */}
            <section className="mb-8 w-full max-w-4xl">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-green-400">
                    About Us
                </h2>
                <div className="bg-green-700 rounded-lg p-6 text-white">
                    <p className="text-base md:text-lg">
                        Raah-e-Hidayat is your essential companion for daily
                        Islamic practices. Our mission is to provide a
                        user-friendly platform for prayer times, Quran reading,
                        tasbih counter, and more. We are committed to supporting
                        your spiritual growth and community connection.
                    </p>
                </div>
            </section>

            {/* Contact Information Section */}
            <section className="mb-8">
                <h3 className="text-lg font-medium text-green-400 mb-6 text-center">
                    Get in touch
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-blue-400">📧</span>
                        <span className="text-gray-300 font-medium">Email</span>
                        <span className="text-gray-400">
                            raahehidayatindia@gmail.com
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">📞</span>
                        <span className="text-gray-300 font-medium">Phone</span>
                        <span className="text-gray-400">88171 88825</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-red-400">📍</span>
                        <span className="text-gray-300 font-medium">
                            Address
                        </span>
                        <span className="text-gray-400">
                            Bilaspur , Chhattisgarh
                        </span>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="mt-10 pt-6 border-t border-gray-600 text-center text-xs w-full">
                <span className="text-gray-400">
                    Developed by{" "}
                    <Link
                        href="https://crown-edge-technologies.vercel.app/"
                        target="_blank"
                        className="text-green-600 hover:underline font-semibold"
                    >
                        Crown Edge Technologies
                    </Link>
                </span>
            </footer>
        </main>
    );
}
