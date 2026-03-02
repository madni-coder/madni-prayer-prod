"use client";

import SplitText from "./SplitText.client";
import { useCallback } from 'react';

const AppTitle = () => {
    const handleAnimationComplete = useCallback(() => {
        // simple callback when animation completes; keep for debug/analytics
        // eslint-disable-next-line no-console
        console.log('All letters have animated!');
    }, []);

    return (
        <h1 className="mr-0 relative w-full text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black font-serif tracking-[0.06em] uppercase leading-tight drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)] z-10 pb-2 text-center px-2">
            <SplitText
                text="RAAHE HIDAYAT"
                className="inline-block w-full break-words [word-spacing:0.25em] bg-clip-text text-transparent bg-gradient-to-b from-white via-emerald-200 to-teal-600 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                delay={140}
                duration={2.0}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                tag="span"
                onLetterAnimationComplete={handleAnimationComplete}
            />

            <style jsx>{`
        .split-parent .split-char,
        .split-parent .split-word,
        .split-parent .split-line {
          display: inline-block;
          color: transparent !important;
          background: linear-gradient(to bottom, #ffffff, #bbf7d0, #14b8a6);
          -webkit-background-clip: text;
          background-clip: text;
        }
      `}</style>
        </h1>
    );
};

export default AppTitle;
