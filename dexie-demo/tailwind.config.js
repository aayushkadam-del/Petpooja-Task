/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          orange: '#FF9900',
          'orange-dark': '#FF9900',
          'dark-bg': '#131921',
          gold: '#FFB81C',
          'price-red': '#B12704',
          'success': '#4caf50',
          'link-blue': '#0066c0',
        }
      }
    },
  },
  plugins: [],
}
