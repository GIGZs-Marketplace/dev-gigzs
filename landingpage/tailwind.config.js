/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00704a',
        secondary: '#f7f7f7',
        dark: '#272727',
      },
    },
  },
  plugins: [],
}