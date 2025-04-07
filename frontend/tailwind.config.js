/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#4F46E5",
                    50: "#EBEAFD",
                    100: "#D7D5FB",
                    200: "#AFABF7",
                    300: "#8781F3",
                    400: "#5F57EF",
                    500: "#4F46E5",
                    600: "#2A20D9",
                    700: "#211AAB",
                    800: "#18137D",
                    900: "#0F0C4F",
                },
                secondary: {
                    DEFAULT: "#10B981",
                    50: "#E6F6F1",
                    100: "#CCEEE3",
                    200: "#99DDC7",
                    300: "#66CCAB",
                    400: "#33BB8F",
                    500: "#10B981",
                    600: "#0D9467",
                    700: "#0A704E",
                    800: "#064C34",
                    900: "#03281A",
                },
                background: "#F9FAFB",
                foreground: "#111827",
                border: "hsl(var(--border))",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: 0 },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: 0 },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} 