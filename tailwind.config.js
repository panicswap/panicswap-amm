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
        darkBlue: {
          DEFAULT: "#1E293B",
        },
        panic: {
          DEFAULT: "#3cc6f4",
        },
      },
    },
  },
  plugins: [],
};
