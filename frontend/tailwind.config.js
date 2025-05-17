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
          'blue': {
              600: '#2563eb',
              700: '#1d4ed8',
          },
      boxShadow: {
          'soft': '0 8px 32px rgba(0,0,0,0.05)',
      }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
