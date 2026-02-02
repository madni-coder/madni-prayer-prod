"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CardLink({ href, children, onDelayedShow, delay = 800, className }) {
    const router = useRouter();
    const timerRef = useRef();

    const handleClick = (e) => {
        e.preventDefault();

        // start a timer to show loader only if navigation takes longer than `delay`
        timerRef.current = setTimeout(() => {
            if (onDelayedShow) onDelayedShow(true);
        }, delay);

        // navigate - the page component will unmount; if navigation is fast the timer won't fire
        try {
            router.push(href);
        } catch (err) {
            clearTimeout(timerRef.current);
            if (onDelayedShow) onDelayedShow(false);
        }
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
