import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0D",
        surface: "#1A1A1A",
        orange: "#FF5C00",
        "orange-dim": "#CC4A00",
        cream: "#F5F0E8",
        muted: "#666666",
      },
      fontFamily: {
        cormorant: ["var(--font-cormorant)", "serif"],
        dm: ["var(--font-poppins)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        vazir: ["var(--font-vazir)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
