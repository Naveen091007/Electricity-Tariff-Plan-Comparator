/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0f2744', light: '#1e3a5f', dark: '#0a1c31' },
        sage: { DEFAULT: '#2d7d46', light: '#3da35d', pale: '#e8f5ee' },
      },
    },
  },
  plugins: [],
}