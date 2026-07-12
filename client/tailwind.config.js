/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1B2D", // primary dark surface
          800: "#16263D",
          700: "#1C2B3F",
          600: "#25384F",
        },
        fog: {
          DEFAULT: "#8FA3B8", // muted text on dark
          light: "#C4D0DC",
        },
        signal: {
          DEFAULT: "#F2A72E", // amber accent - primary
          dark: "#D6900F",
          light: "#FFD98A",
        },
        line: {
          go: "#2FBF87",     // active / on-time
          hold: "#F2A72E",   // pending / scheduled
          stop: "#E5484D",   // blocked / overdue
          transit: "#4C8DFF" // in-progress / en route
        },
        paper: "#F5F7FA", // app background (light mode)
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15,27,45,0.06), 0 4px 12px rgba(15,27,45,0.04)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
