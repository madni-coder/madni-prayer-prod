"use client";

import { useEffect, useState } from "react";
import { ToastContainer, Slide } from "react-toastify";

function mapTheme(attr) {
    if (!attr) return "light";
    if (attr === "night" || attr === "dark") return "dark";
    return "light";
}

export default function ThemeableToast() {
    const [theme, setTheme] = useState(() => {
        if (typeof document !== "undefined") {
            return mapTheme(document.documentElement.getAttribute("data-theme"));
        }
        return "light";
    });

    useEffect(() => {
        if (typeof document === "undefined") return;
        const observer = new MutationObserver(() => {
            setTheme(mapTheme(document.documentElement.getAttribute("data-theme")));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, []);

    return (
        <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={true}
            pauseOnHover={true}
            transition={Slide}
            theme={theme}
        />
    );
}
