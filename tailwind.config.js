/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: { 800: '#1E293B', 900: '#0F172A' },
        ink: '#0B0F17',
        surface: '#F8FAFC',
        gold: { DEFAULT: '#D97706', light: '#F59E0B' },
        royal: { DEFAULT: '#0A1B33', 800: '#102847' },
        brass: '#D9A93C',
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Noto Sans Ethiopic"', 'Georgia', 'serif'],
        sans: [
          'Inter',
          '"Noto Sans Ethiopic"',
          '"Abyssinica SIL"',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15,23,42,.04), 0 4px 16px -4px rgba(15,23,42,.08)',
        lift: '0 2px 4px rgba(15,23,42,.06), 0 12px 28px -8px rgba(15,23,42,.18)',
        glow: '0 0 0 4px rgba(245,158,11,.18)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(.6)', opacity: '0' },
          '60%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
        rise: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        ping2: {
          '75%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        pop: 'pop .35s ease-out',
        rise: 'rise .3s ease-out',
        ping2: 'ping2 1.6s cubic-bezier(0,0,.2,1) infinite',
      },
    },
  },
  plugins: [],
};
