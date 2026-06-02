/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563eb', dark: '#1d4ed8', light: '#3b82f6' },
        secondary: '#0f172a',
      }
    }
  },
  plugins: []
}