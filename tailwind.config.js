/** @type {import('tailwindcss').Config} */
module.exports = {
    // Force Tailwind dark variants to only activate via the `.dark` class, not OS preference
    darkMode: "class",
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        // Only build and use the forest theme
        themes: ["forest"],
        // Use forest even if something toggles to "dark"
        darkTheme: "forest",
    },
};
