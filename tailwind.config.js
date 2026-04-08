/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        copper: {
          50: '#faf3ec',
          100: '#f5e8d8',
          200: '#e8ccaa',
          300: '#d4944c',
          400: '#c47e3c',
          500: '#a86830',
          600: '#8a5228',
          700: '#6a3e1c',
          800: '#4a2c18',
          900: '#3a2010',
        },
        dark: {
          50: '#e8e4de',
          100: '#b0a898',
          200: '#8a8278',
          300: '#6a6560',
          400: '#4a4540',
          500: '#3a3530',
          600: '#2a2520',
          700: '#1a1815',
          800: '#0f0e0c',
          900: '#080808',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Outfit"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
