import React from "react";
import Link from "next/link";

const Sidebar = () => (
    <div
        style={{
            width: 260,
            height: "100vh",
            background: "#fff",
            borderRight: "1px solid #f0f0f0",
            padding: "24px 0 0 16px",
            boxSizing: "border-box",
        }}
    >
        <div
            style={{
                fontWeight: 700,
                fontSize: 22,
                color: "#5cb85c",
                marginBottom: 40,
            }}
        >
            Admin Panel
        </div>
        <div style={{ marginBottom: 32, fontSize: 18, cursor: "pointer" }}>
            <Link
                href="/admin/jamat-times"
                style={{ color: "inherit", textDecoration: "none" }}
            >
                Jamat Times
            </Link>
        </div>
        <div style={{ marginBottom: 32, fontSize: 18, cursor: "pointer" }}>
            <Link
                href="/admin/rewards"
                style={{ color: "inherit", textDecoration: "none" }}
            >
                Rewards
            </Link>
        </div>
        <div style={{ marginBottom: 32, fontSize: 18, cursor: "pointer" }}>
            <Link
                href="/admin/notice"
                style={{ color: "inherit", textDecoration: "none" }}
            >
                Notice
            </Link>
        </div>
        <div style={{ marginBottom: 0, fontSize: 18, cursor: "pointer" }}>
            <Link
                href="/admin/logout"
                style={{ color: "inherit", textDecoration: "none" }}
            >
                Logout
            </Link>
        </div>
    </div>
);

export default Sidebar;
