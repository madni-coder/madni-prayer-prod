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
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-600 mb-2">
                    Contact Us
                </h1>
            </header>

            {/* Information Demo Section */}
            <section className="mb-8 w-full max-w-4xl">
                <h2 className="text-xl md:text-2xl font-semibold mb-2 text-green-600">
                    Motive Of Our App
                </h2>
                <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-gray-700 dark:text-gray-200">
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
                <h2 className="text-xl md:text-2xl font-semibold mb-2 text-green-600">
                    About Us
                </h2>
                <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 text-gray-700 dark:text-gray-200">
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
                <h3 className="text-lg font-medium text-green-700 mb-4">
                    Get in touch
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full rounded-lg text-sm text-gray-600 dark:text-gray-300">
                        <tbody>
                            <tr className="border-b border-green-200 dark:border-green-800">
                                <td className="py-2 px-2 font-semibold">
                                    📧 Email
                                </td>
                                <td className="py-2 px-2">
                                    raahehidayatindia@gmail.com
                                </td>
                            </tr>
                            <tr className="border-b border-green-200 dark:border-green-800">
                                <td className="py-2 px-2 font-semibold">
                                    📞 Phone
                                </td>
                                <td className="py-2 px-2">88171 88825</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-2 font-semibold">
                                    📍 Address
                                </td>
                                <td className="py-2 px-2">
                                    Bilaspur , Chhattisgarh
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-xs w-full">
                <span className="text-gray-500 dark:text-gray-400">
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
