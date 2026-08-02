/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#080d18",
        surface: "#0f1729",
        surface2: "#141f38",
        card: "#111c33",
        hairline: "rgba(201, 162, 39, 0.14)",
        ink: {
          DEFAULT: "#f3efe4",
          muted: "#8b93a8",
          dim: "#5b6478",
        },
        gold: {
          DEFAULT: "#c9a227",
          light: "#e8c766",
          dim: "#7d6620",
          foil: "#f1dfa3",
        },
        navy: {
          DEFAULT: "#0d1526",
          deep: "#060a13",
        },
        signal: {
          green: "#3fb68b",
          red: "#c1554d",
          blue: "#4d8fc1",
        },
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "monospace"],
      },
      boxShadow: {
        goldglow: "0 0 40px -12px rgba(201, 162, 39, 0.35)",
        lift: "0 20px 50px -20px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "navy-radial": "radial-gradient(ellipse 120% 80% at 50% -10%, #16233d 0%, #080d18 60%)",
      },
    },
  },
  plugins: [],
};
