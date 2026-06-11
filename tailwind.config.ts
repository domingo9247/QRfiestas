import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        champagne: "#d6b25e",
        ink: "#0b0b0d",
        pewter: "#6f7178"
      },
      boxShadow: {
        glow: "0 22px 80px rgba(214, 178, 94, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
