import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "../../packages/core/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-gujarati)", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#172033",
        pearl: "#f7fbff",
        gold: "#b88931"
      }
    }
  },
  plugins: []
};

export default config;
