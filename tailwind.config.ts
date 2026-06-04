import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        bg0: "#07070b",
        bg1: "#0c0c14",
        bg2: "#11111c",
        ink: "#f6f1e3",
        "ink-dim": "#b8b1a0",
        "ink-muted": "#6e6a5e",
        gold: "#d4af37",
        "gold-bright": "#f4d77a",
        "gold-deep": "#8a6d1c",
        platinum: "#e6e2d3",
        line: "rgba(212, 175, 55, 0.18)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Times New Roman", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(6vmax, -4vmax) scale(1.08)" },
        },
        "halo-spin": { to: { transform: "rotate(360deg)" } },
        "pulse-ring": {
          "0%, 100%": { transform: "scale(0.85)", opacity: "0.5" },
          "50%": { transform: "scale(1.25)", opacity: "0.95" },
        },
        "logo-breathe": {
          "0%, 100%": {
            filter: "drop-shadow(0 0 24px rgba(212, 175, 55, 0.35))",
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            filter: "drop-shadow(0 0 80px rgba(244, 215, 122, 0.85))",
            transform: "translateY(-10px) scale(1.05)",
          },
        },
        bob: {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 1.2s ease forwards",
        drift: "drift 22s ease-in-out infinite",
        "halo-spin": "halo-spin 9s linear infinite",
        "pulse-ring": "pulse-ring 4.5s ease-in-out infinite",
        "logo-breathe": "logo-breathe 5s ease-in-out 1.2s infinite",
        bob: "bob 2.4s ease-in-out 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
