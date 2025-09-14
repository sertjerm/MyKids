/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'kids-pink': {
          50: '#fef7ff',
          100: '#feeffe', 
          200: '#fce7fd',
          300: '#f9d0fa',
          400: '#f4a8f4',
          500: '#ec7fed',
          600: '#d946ef',
          700: '#c026d3',
          800: '#a21caf',
          900: '#86198f'
        },
        'kids-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff', 
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        }
      },
      fontFamily: {
        'thai': ['Sarabun', 'Kanit', 'sans-serif']
      },
      animation: {
        'bounce-soft': 'bounce 1s ease-in-out 2',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
