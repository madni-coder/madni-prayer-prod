"use client";
import React from "react";

const QuranLoader = ({
    isVisible,
    progress = 0,
    title = "Loading...",
    subtitle = "Please wait while we prepare your content"
}) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-base-200 rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-primary/20">
                {/* Islamic Pattern Decoration */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {/* Outer ring with rotation animation */}
                        <div className="w-20 h-20 border-4 border-primary/20 rounded-full animate-spin">
                            <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-pulse"></div>
                        </div>
                        {/* Inner Islamic star pattern */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 text-primary animate-pulse">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-primary text-center mb-2">
                    {title}
                </h3>

                {/* Subtitle */}
                <p className="text-base-content/70 text-center text-sm mb-6">
                    {subtitle}
                </p>

                {/* Progress Bar */}
                <div className="w-full mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-base-content">
                            Opening...
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {Math.round(progress)}%
                        </span>
                    </div>

                    {/* Progress bar track */}
                    <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden shadow-inner">
                        {/* Progress bar fill */}
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary-focus rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                </div>

                {/* Islamic decoration */}
                <div className="flex justify-center mt-6 space-x-4 text-primary/30">
                    <span className="text-lg">﴾</span>
                    <span className="text-sm animate-pulse">◆</span>
                    <span className="text-lg">﴿</span>
                </div>
            </div>
        </div>
    );
};

export default QuranLoader;