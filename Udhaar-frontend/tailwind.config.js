/** @type {import('tailwindcss').Config} */
import tailwindScrollbar from "tailwind-scrollbar"; // Import the plugin

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Your file paths
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        Eastham: ['Eastham Demo', 'sans-serif'], // Add your custom font
      },
    },
  },
  plugins: [
    tailwindScrollbar, // Add the plugin here
  ],
};
