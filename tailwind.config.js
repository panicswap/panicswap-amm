module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Orbitron"', "sans-serif"],
        heading: ['"Sora"', "sans-serif"],
      },
      colors: {
        lightGray: {
          DEFAULT: "#eff3fb",
        },
        darkGray: {
          DEFAULT: "#b7becb",
        },
      },
    },
  },
  plugins: [],
};
