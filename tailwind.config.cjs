/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        text: "text 1s ease infinite",
      },
      keyframes: {
        text: {
          "0%": {
            color: "#f00",
          },
          "100%": {
            color: "#ffffff",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
