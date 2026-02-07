'use client';

import { useState, useEffect } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import apiClient from '../../../lib/apiClient';

export default function FreeServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState('success');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/api/free-service');
            setServices(data.data || []);
            setError('');
        } catch (err) {
            console.error('Error fetching free services:', err);
            setError('Failed to load free services');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this service request?')) {
            return;
        }

        try {
            await apiClient.delete('/api/free-service', { data: { id } });
            // Refresh the list
            fetchServices();
        } catch (err) {
            console.error('Error deleting service:', err);
            alert('Failed to delete service request');
        }
    };

    const handleToggle = async (id, value) => {
        // Optimistic UI update
        const prev = services;
        try {
            const updated = services.map((s) => (s.id === id ? { ...s, isServiceDone: value } : s));
            setServices(updated);

            await apiClient.patch('/api/free-service', { id, isServiceDone: value });

            // show theme-aware toast
            setToastMessage(value ? 'Service Completed' : 'Service Incomplete');
            setToastVariant(value ? 'success' : 'warning');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2500);
        } catch (err) {
            console.error('Error updating service:', err);
            // revert optimistic update
            setServices(prev);
            setToastMessage('Failed to update service status');
            setToastVariant('error');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Pagination calculations
    const totalPages = Math.ceil(services.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentServices = services.slice(startIndex, endIndex);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="p-6">
            <div className="mb-6">

                <h1 className="text-3xl font-bold text-gray-900">Free AC Services</h1>
                <p className="text-gray-600 mt-2">Manage free AC service requests from masjids</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div>
                {/* Desktop / Tablet: show table */}
                <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-error">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Masjid Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Mutawalli Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Mobile No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        No. Of ACs
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Is Service Done
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentServices.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            No service requests found
                                        </td>
                                    </tr>
                                ) : (
                                    currentServices.map((service) => (
                                        <tr key={service.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.masjidName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.mutuwalliName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.mobileNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {service.numberOfACs}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(service.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <button
                                                    role="switch"
                                                    aria-checked={!!service.isServiceDone}
                                                    onClick={() => handleToggle(service.id, !service.isServiceDone)}
                                                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${service.isServiceDone ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform ${service.isServiceDone ? 'translate-x-6' : 'translate-x-1'}`}
                                                    />
                                                </button>
                                                <span className="ml-3 text-sm text-gray-700">{service.isServiceDone ? 'Yes' : 'No'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => handleDelete(service.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile: show stacked cards */}
                <div className="md:hidden space-y-3">
                    {currentServices.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-4 text-center text-gray-500">No service requests found</div>
                    ) : (
                        currentServices.map((service) => (
                            <div key={service.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-gray-900">{service.masjidName}</div>
                                        <div className="mt-1 text-sm text-gray-600">{service.mutuwalliName}</div>
                                    </div>
                                    <div className="ml-3 flex items-center gap-3">
                                        <button
                                            role="switch"
                                            aria-checked={!!service.isServiceDone}
                                            onClick={() => handleToggle(service.id, !service.isServiceDone)}
                                            className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors focus:outline-none ${service.isServiceDone ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                        >
                                            <span
                                                className={`inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform ${service.isServiceDone ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Mobile</span>
                                        <span className="truncate">{service.mobileNumber || '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">ACs</span>
                                        <span>{service.numberOfACs ?? '-'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Date</span>
                                        <span>{new Date(service.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-500 uppercase">Status</span>
                                        <span>{service.isServiceDone ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {services.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {startIndex + 1} to {Math.min(endIndex, services.length)} of {services.length} requests
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === pageNum
                                            ? 'bg-blue-500 text-white'
                                            : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
            {/* Toast */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
                    <div className={`px-5 py-3 rounded-lg shadow-lg text-white flex items-center gap-3 ${toastVariant === 'success' ? 'bg-green-500 dark:bg-green-600' : toastVariant === 'warning' ? 'bg-yellow-500 dark:bg-yellow-600' : 'bg-red-500 dark:bg-red-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {toastVariant === 'success' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            ) : toastVariant === 'warning' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                            )}
                        </svg>
                        <span className="font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
