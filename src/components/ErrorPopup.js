import React, { useState, useEffect } from 'react';
import { FaCopy, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

export default function ErrorPopup({ error, onClose }) {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!error) {
            setIsVisible(false);
            return;
        }

        const isLocallyHosted = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        const isAppFlag = typeof window !== 'undefined' && localStorage.getItem('isApp') === 'true';
        const isTauriApp = typeof window !== 'undefined' && typeof window.__TAURI_IPC__ !== 'undefined';

        // Ensure it triggers if NEXT_PUBLIC_DEBUG is true, or if we are natively testing inside the App/mobile wrappers
        const isDebug = process.env.NEXT_PUBLIC_DEBUG === 'true' || isLocallyHosted || isAppFlag || isTauriApp;

        console.log("ErrorPopup triggering", { error, isDebug, envDebug: process.env.NEXT_PUBLIC_DEBUG, isAppFlag, isTauriApp });

        if (isDebug) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [error]);

    if (!isVisible || !error) return null;

    const handleCopy = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(String(error));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                backgroundColor: '#0f172a',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                height: '400px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                        <FaExclamationTriangle style={{ fontSize: '20px' }} />
                        <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>API Error (Debug)</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={handleCopy}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                            title="Copy Error"
                        >
                            <FaCopy />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '6px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div style={{
                    flex: 1,
                    padding: '16px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px'
                }}>
                    <pre style={{
                        color: '#fca5a5',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                        lineHeight: 1.5
                    }}>
                        {String(error)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
