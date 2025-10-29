/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        colors: {
            primary: "#000000", // text black
            beige: "#EDE8D0", // beige background
            accent: "#FFFFFF",
            green: {
                100: "#296964",
                200: "#2EA344"
            },

        }
    },
  },
  plugins: [],
}

