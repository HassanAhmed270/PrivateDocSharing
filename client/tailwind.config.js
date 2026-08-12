/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#2f8cff',
          600: '#176fe5',
          700: '#1459ba',
        },
      },
      boxShadow: {
        glow: '0 20px 80px rgba(47, 140, 255, 0.18)',
      },
    },
  },
  plugins: [],
};
