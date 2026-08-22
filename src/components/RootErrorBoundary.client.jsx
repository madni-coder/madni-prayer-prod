"use client";
import React from "react";

// Last-resort safety net: without this, any uncaught render/effect error
// anywhere in the tree unmounts the whole app to a permanent blank screen
// (observed on iOS when a network-dependent call throws synchronously offline).
// With this in place, only the crashing subtree is replaced by a small
// reload prompt, so unrelated features keep working.
export default class RootErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("[RootErrorBoundary] Caught error:", error, info);
    }

    handleReload = () => {
        this.setState({ hasError: false });
        if (typeof window !== "undefined") window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        padding: 24,
                        textAlign: "center",
                        background: "#0b1220",
                        color: "#fff",
                        zIndex: 999999,
                    }}
                >
                    <p style={{ fontSize: 15, maxWidth: 320 }}>
                        Something went wrong loading this screen.
                    </p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: 8,
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
