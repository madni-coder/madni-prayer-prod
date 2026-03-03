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
        <h1 className="mr-0 relative w-full text-[clamp(1.65rem,5vw,3.75rem)] font-black font-serif tracking-[0.04em] sm:tracking-[0.06em] uppercase leading-tight drop-shadow-[0_12px_24px_rgba(139,94,60,0.45)] z-10 pb-2 text-center px-2">
            <span className="inline-flex items-center justify-center w-full whitespace-normal gap-1 sm:gap-2">
                <SplitText
                    text="RAAHE"
                    tag="span"
                    className="ml-2 inline-block break-words leading-tight align-middle sm:mr-0 [word-spacing:0.12em] sm:[word-spacing:0.25em] bg-clip-text text-transparent bg-gradient-to-b from-[#FFF4E6] via-[#FBE7D0] to-[#8B5E3C] drop-shadow-[0_0_18px_rgba(255,244,224,0.6)]"
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

                {/* small image between words */}
                <img
                    src="/gumbadeRaza.png"
                    alt="Gumbade Raza"
                    className="w-10 sm:w-8 md:w-10 lg:w-12 h-auto object-contain mx-2 md:mx-3 align-middle mb-3"
                    style={{ display: "inline-block", verticalAlign: "middle",  }}
                />

                <SplitText
                    text="HIDAYAT"
                    tag="span"
                    className=" mr-2 inline-block break-words leading-tight align-middle [word-spacing:0.12em] sm:[word-spacing:0.25em] bg-clip-text text-transparent bg-gradient-to-b from-[#FFF4E6] via-[#FBE7D0] to-[#8B5E3C] drop-shadow-[0_0_18px_rgba(255,244,224,0.6)]"
                    delay={200}
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
            </span>

            <style jsx>{`
                .split-parent .split-char,
                .split-parent .split-word,
                .split-parent .split-line {
                    display: inline-block;
                    color: transparent !important;
                    background: linear-gradient(to bottom, #FFF4E6, #FBE7D0, #8B5E3C);
                    -webkit-background-clip: text;
                    background-clip: text;
                    text-shadow: 0 6px 18px rgba(255,244,224,0.65), 0 0 26px rgba(139,94,60,0.28);
                }
            `}</style>
        </h1>
    );
};

export default AppTitle;
