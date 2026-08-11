import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf5",
          100: "#d6f9e6",
          200: "#b0f1d0",
          300: "#7be4b3",
          400: "#3fce8f",
          500: "#17b478",
          600: "#0a9160",
          700: "#0a7450",
          800: "#0c5c41",
          900: "#0b4b37",
          950: "#032a1f",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d4d9e2",
          300: "#aeb7c7",
          400: "#8290a7",
          500: "#61718b",
          600: "#4c5972",
          700: "#3e485d",
          800: "#363e4f",
          900: "#181d26",
          950: "#0c0f15",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
