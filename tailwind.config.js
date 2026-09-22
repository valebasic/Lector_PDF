/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#000000",
        pastelAccent: "#b48ead", // Un tono lila/pastel elegante
        pastelPeach: "#ebcb8b",  // Un tono durazno de acento
      },
    },
  },
  plugins: [],
}
