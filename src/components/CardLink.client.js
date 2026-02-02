"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CardLink({ href, children, onDelayedShow, delay = 800, className }) {
    const router = useRouter();
    const timerRef = useRef();

    const createOverlay = (text) => {
        if (typeof document === "undefined") return;
        if (document.getElementById("global-navigation-loader")) return;
        const overlay = document.createElement("div");
        overlay.id = "global-navigation-loader";
        overlay.setAttribute(
            "style",
            "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);z-index:9999;"
        );

        overlay.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <span class="loader-global" aria-hidden="true"></span>
                <div style="color:#fff;font-size:14px;text-align:center">${text || "Loading..."}</div>
      </div>
      <style>
                .loader-global{display:inline-block;position:relative;width:80px;height:80px}
                .loader-global:before{content:'';position:absolute;width:38px;height:38px;border-radius:50%;top:50%;left:0;transform:translate(-5px,-50%);background:linear-gradient(to right,#fff 50%,var(--error-color,#de3500) 50%) no-repeat;background-size:200% auto;background-position:100% 0;animation:colorBallMoveX 1.5s linear infinite alternate}
                .loader-global:after{content:'';position:absolute;left:50%;top:0;transform:translateX(-50%);width:2px;height:100%;background:var(--error-color,#de3500)}
        @keyframes colorBallMoveX{0%{background-position:0% 0;transform:translate(-15px,-50%)}15%,25%{background-position:0% 0;transform:translate(0px,-50%)}75%,85%{background-position:100% 0;transform:translate(50px,-50%)}100%{background-position:100% 0;transform:translate(65px,-50%)}}
      </style>
    `;

        // try to inherit the app theme's error color from CSS variables
        try {
            let error = "";

            const tryGet = (el, name) => {
                try {
                    return getComputedStyle(el).getPropertyValue(name).trim();
                } catch (e) {
                    return "";
                }
            };

            // 1) try :root / html variables commonly used by DaisyUI / Tailwind themes
            error = tryGet(document.documentElement, "--color-error") || tryGet(document.documentElement, "--error-color");

            // 2) if still empty, try body
            if (!error) error = tryGet(document.body, "--color-error") || tryGet(document.body, "--error-color");

            // 3) as a last resort attempt: create a temporary element with a theme helper class
            //    (Tailwind/DaisyUI usually maps `bg-error` to the theme color)
            if (!error) {
                const tmp = document.createElement("div");
                tmp.className = "bg-error";
                tmp.style.position = "fixed";
                tmp.style.left = "-9999px";
                document.body.appendChild(tmp);
                try {
                    const bg = getComputedStyle(tmp).backgroundColor;
                    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") error = bg;
                } catch (e) { }
                tmp.remove();
            }

            // If we found something, validate it's not a DaisyUI "error" color.
            const normalize = (c) => (c || "").replace(/\s+/g, "").toLowerCase();
            const isErrorColor = (c) => {
                if (!c) return false;
                const n = normalize(c);
                // common DaisyUI/ Tailwind error reds (rgb or hex)
                const errorCandidates = [
                    "rgb(220,38,38)", // #dc2626
                    "rgb(239,68,68)", // #ef4444
                    "rgb(255,0,0)",
                    "#dc2626",
                    "#ef4444",
                    "#ff0000",
                ];
                return errorCandidates.includes(n);
            };

            if (error && isErrorColor(error)) {
                // try alternative selectors that might map to error
                const altEl = document.querySelector(".btn-error, .bg-error, [data-theme]");
                if (altEl) {
                    const alt = getComputedStyle(altEl).backgroundColor || tryGet(altEl, "--color-error") || tryGet(altEl, "--error-color");
                    if (alt && !isErrorColor(alt)) error = alt;
                }
            }

            // If we found something, set it as the overlay variable. Otherwise leave default.
            if (error) overlay.style.setProperty("--error-color", error);
        } catch (e) {
            // swallow any errors to avoid breaking navigation
        }

        document.body.appendChild(overlay);
    };

    const removeOverlay = () => {
        if (typeof document === "undefined") return;
        const el = document.getElementById("global-navigation-loader");
        if (el) el.remove();
    };

    const handleClick = async (e) => {
        e.preventDefault();

        // show a global overlay spinner so it remains visible during navigation
        createOverlay("Please wait...");

        // capture current URL so we can detect a successful navigation
        const startHref = typeof window !== "undefined" ? window.location.href : "";

        // navigate - await if router.push returns a promise
        try {
            const pushResult = router.push(href);
            // if push returns a promise, await it
            if (pushResult && typeof pushResult.then === "function") {
                try {
                    await pushResult;
                } catch (e) {
                    // ignore; we'll detect nav via href change below or remove on error
                }
            }
        } catch (err) {
            removeOverlay();
            if (onDelayedShow) onDelayedShow(false);
            return;
        }

        // poll until the URL changes (client navigation finished), then remove overlay
        const checkInterval = setInterval(() => {
            if (typeof window === "undefined") return;
            if (window.location.href !== startHref) {
                removeOverlay();
                clearInterval(checkInterval);
            }
        }, 100);

        // safety: remove overlay after 10s to avoid stuck state
        setTimeout(() => {
            removeOverlay();
            clearInterval(checkInterval);
        }, 10000);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <a href={href} onClick={handleClick} className={className}>
            {children}
        </a>
    );
}
