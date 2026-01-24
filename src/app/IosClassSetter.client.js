"use client";
import { useEffect } from "react";

export default function IosClassSetter() {
    useEffect(() => {
        try {
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const isIOS = /iPad|iPhone|iPod/.test(ua) ||
                (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
            if (isIOS) document.documentElement.classList.add("is-ios");
            else document.documentElement.classList.remove("is-ios");
        } catch (e) {
            // silently fail
        }
    }, []);

    return null;
}
