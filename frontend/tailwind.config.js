/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Indigo
        secondary: "#F59E0B", // Amber
        background: "#F3F4F6", // Light gray
        darkBackground: "#1F2937", // Dark mode background
        textPrimary: "#1F2937", // Dark gray text
        textSecondary: "#6B7280", // Lighter gray text
        darkText: "#F3F4F6", // Light text for dark mode
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
