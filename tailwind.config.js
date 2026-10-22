/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffe',
          300: '#7cc3fd',
          400: '#36a3f9',
          500: '#0c85eb',
          600: '#0066c8',
          700: '#0152a2',
          800: '#064685',
          900: '#0b3b6e',
          950: '#072549',
        },
        cargo: {
          slate: '#0f172a',
          navy: '#0a1128',
          card: '#ffffff',
          surface: '#f8fafc',
          border: '#e2e8f0',
          accent: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'glow-brand': '0 0 20px -3px rgba(12, 133, 235, 0.25)',
      }
    },
  },
  plugins: [],
}

