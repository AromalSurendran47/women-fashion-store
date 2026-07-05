import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Premium luxury fashion palette
        background: "#FFFFFF",
        secondary: "#F8F5F2",
        ink: "#111111",
        accent: {
          DEFAULT: "#D8C6B2",
          dark: "#C4AE93",
        },
        muted: "#6B6B6B",
        line: "#EDE8E2",
        sale: "#B23A48",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
      },
      maxWidth: {
        container: "1440px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
