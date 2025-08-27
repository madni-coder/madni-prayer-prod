'use client'
import React, { useState } from "react";

export default function Register() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        location: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-base-100">
            {!submitted ? (
                <form
                    onSubmit={handleSubmit}
                    className="glass-card max-w-md w-full p-8 space-y-6 shadow-lg animate-fade-in bg-base-200 text-base-content"
                >
                    <h2 className="text-2xl font-bold text-center text-primary mb-2">
                        Register Yourself
                    </h2>
                    <div className="form-control">
                        <label className="label">Name</label>
                        <input
                            name="name"
                            required
                            className="input input-bordered"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="input input-bordered"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="input input-bordered"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">Location</label>
                        <input
                            name="location"
                            required
                            className="input input-bordered"
                            value={form.location}
                            onChange={handleChange}
                        />
                    </div>
                    <button className="btn btn-primary w-full mt-2">
                        Register
                    </button>
                </form>
            ) : (
                <div className="glass-card max-w-md w-full p-8 flex flex-col items-center animate-fade-in bg-base-200 text-base-content">
                    <svg
                        width="64"
                        height="64"
                        fill="none"
                        viewBox="0 0 64 64"
                        className="mb-4 animate-bounce"
                    >
                        <circle
                            cx="32"
                            cy="32"
                            r="32"
                            fill="#1fa463"
                            fillOpacity="0.15"
                        />
                        <path
                            d="M32 16v32M16 32h32"
                            stroke="#1fa463"
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                    <h2 className="text-2xl font-bold text-primary mb-2">
                        Welcome, {form.name}!
                    </h2>
                    <p className="text-center">
                        Your account has been created.
                        <br />
                        Enjoy Madni Prayer Times!
                    </p>
                </div>
            )}
        </div>
    );
}
