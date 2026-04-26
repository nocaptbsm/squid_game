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
        background: "var(--s-bg)",
        foreground: "var(--s-text)",
        border: "var(--s-border)",
        ring: "var(--s-accent)",
        // SaaS tokens
        sBg: "var(--s-bg)",
        sSurface: "var(--s-surface)",
        sSurface2: "var(--s-surface-2)",
        sBorder: "var(--s-border)",
        sAccent: "var(--s-accent)",
        sAccentHover: "var(--s-accent-hover)",
        sAccentLight: "var(--s-accent-light)",
        sText: "var(--s-text)",
        sTextSecondary: "var(--s-text-secondary)",
        sTextMuted: "var(--s-text-muted)",
        sGreen: "var(--s-green)",
        sGreenLight: "var(--s-green-light)",
        sOrange: "var(--s-orange)",
        sOrangeLight: "var(--s-orange-light)",
        sRed: "var(--s-red)",
        sRedLight: "var(--s-red-light)",
        // Legacy aliases
        npPink: "var(--s-accent)",
        npTeal: "var(--s-green)",
        npGold: "var(--s-orange)",
        npCoral: "var(--s-red)",
        npText: "var(--s-text)",
        npTextSecondary: "var(--s-text-secondary)",
        npTextMuted: "var(--s-text-muted)",
        sqBg: "var(--s-bg)",
        sqSurface: "var(--s-surface)",
        sqPink: "var(--s-accent)",
        sqGreen: "var(--s-green)",
        sqRed: "var(--s-red)",
        sqGold: "var(--s-orange)",
        sqText: "var(--s-text)",
        sqMuted: "var(--s-text-muted)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        sm: "var(--s-shadow-sm)",
        DEFAULT: "var(--s-shadow)",
        md: "var(--s-shadow-md)",
        // legacy
        npPinkGlow: "0 0 0 3px rgba(79,110,247,0.15)",
        npTealGlow: "0 0 0 3px rgba(22,163,74,0.15)",
        npGoldGlow: "0 0 0 3px rgba(217,119,6,0.15)",
        sqPinkGlow: "0 0 0 3px rgba(79,110,247,0.15)",
        sqGreenGlow: "0 0 0 3px rgba(22,163,74,0.15)",
      },
      animation: {
        "spin-slow": "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
