/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores exactos de Pipedrive para que sea idéntico
        pipedrive: {
          blue: '#2b73ff',
          sidebar: '#1a2634',
          hover: '#2a3a4a',
          gray: '#f5f6f8',
          border: '#e6e9ef',
          text: '#3b434e'
        }
      }
    },
  },
  plugins: [],
}