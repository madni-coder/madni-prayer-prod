'use client';

import { useState } from 'react';
import { FaUser, FaPhone, FaMosque, FaAngleLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function FreeServicePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        masjidName: '',
        numberOfACs: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validate mobile number - only digits and max 15 characters
        if (name === 'mobileNumber') {
            if (!/^\d*$/.test(value) || value.length > 15) return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const response = await axios.post('/api/free-service', {
                fullName: formData.fullName,
                mobileNumber: formData.mobileNumber,
                masjidName: formData.masjidName,
                numberOfACs: formData.numberOfACs
            });

            if (response.data.ok) {
                setSubmitMessage('Request submitted successfully! We will contact you soon.');
                setShowSuccessToast(true);
                setFormData({
                    fullName: '',
                    mobileNumber: '',
                    masjidName: '',
                    numberOfACs: ''
                });

                setTimeout(() => {
                    setShowSuccessToast(false);
                    setSubmitMessage('');
                }, 3000);
            } else {
                setSubmitMessage(response.data.error || 'Failed to submit request. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitMessage(error.response?.data?.error || 'Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-base-100 pb-24 pt-6 px-4">
            {/* Subtle pattern SVG - matching myProfile page */}
            <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="p" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M40 0 L0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.08" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#p)" />
            </svg>

            <div className="w-full max-w-2xl mx-auto relative z-10">
                {/* Back Button & Title Section */}
                <div className="mb-8 flex items-center gap-4">
                    <button
                        className="flex items-center gap-2 text-lg text-primary hover:text-green-600 font-semibold"
                        onClick={() => router.push("/ramzan")}
                        aria-label="Back to Home"
                    >
                        <FaAngleLeft /> Back
                    </button>
                </div>
                <h1 className="text-2xl font-bold text-primary mb-6">
                    Only For Masjid Committee                </h1>
                <h2 className="text-xl font-bold text-white mb-6">
                    Request Free AC Service from
                </h2>
                <h2 className="text-2xl font-bold text-error mb-6">
                    Pefect Solution Company                    </h2>

                <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                    {/* Full Name */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Full Name of Mutawalli <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" size={18} />
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Enter full name of mutawalli"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Mobile Number <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" size={18} />
                            <input
                                type="tel"
                                name="mobileNumber"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                                minLength="10"
                                maxLength="15"
                                placeholder="Enter mobile number"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <p className="mt-1 text-xs text-white/60">10-15 digits only</p>
                    </div>

                    {/* Masjid Name */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Masjid Name <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <FaMosque className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" size={18} />
                            <input
                                type="text"
                                name="masjidName"
                                value={formData.masjidName}
                                onChange={handleChange}
                                required
                                placeholder="Enter masjid name"
                                className="input input-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    {/* Number of ACs */}
                    <div className="form-control w-full">
                        <label className="label pb-2">
                            <span className="label-text font-semibold text-base flex items-center gap-1 text-white">
                                Number of ACs to Service <span className="text-error">*</span>
                            </span>
                        </label>
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                            <select
                                name="numberOfACs"
                                value={formData.numberOfACs}
                                onChange={handleChange}
                                required
                                className="select select-bordered w-full pl-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            >
                                <option value="" disabled>Select number of ACs</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="5+">5+</option>
                            </select>
                        </div>
                        <p className="mt-1 text-xs text-white/60">Select between 1 to 5 or 5+</p>
                    </div>

                    {/* Error Alert */}
                    {submitMessage && !submitMessage.includes('success') && (
                        <div className="alert alert-error rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">{submitMessage}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn btn-primary w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </form>
            </div>

            {/* Success Toast */}
            {showSuccessToast && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-3xl">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 w-full h-12">
                        <div className="flex items-center gap-3 flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-semibold truncate">{submitMessage}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
