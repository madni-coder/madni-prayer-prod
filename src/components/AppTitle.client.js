"use client";

const TITLE_TEXT = "RAAHE HIDAYAT";
const TITLE_CLASS = "inline-block w-full break-words bg-clip-text text-transparent bg-gradient-to-b from-[#FFF4E6] via-[#FBE7D0] to-[#8B5E3C]";

const AppTitle = () => {
    return (
        <h1 className="mr-0 relative w-full text-3xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black font-serif tracking-[0.06em] uppercase leading-tight drop-shadow-[0_12px_24px_rgba(139,94,60,0.45)] z-10 pb-2 text-center px-2">
            <span className={TITLE_CLASS} style={{ wordSpacing: '0.25em' }}>
                {TITLE_TEXT}
            </span>
        </h1>
    );
};

export default AppTitle;
