/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./preview.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#F3F1FF',
          100: '#ECE8FF',
          500: '#8B7BFF', // Secondary Purple
          600: '#6D5EF8', // Primary Purple
          700: '#5849D6',
        },
        slate: {
          50: '#FAFBFF',  // Light Soft Canvas Background
          100: '#F4F2FF',
          200: '#ECECF5',  // Border Color
          400: '#9CA3AF',  // Muted Text
          500: '#6B7280',  // Secondary Text
          900: '#202124',  // Primary Text
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '22px', // Card Radius
        '2xl': '16px',
        'xl': '14px',  // Button Radius
      },
      boxShadow: {
        'soft-purple': '0px 10px 35px rgba(108, 92, 231, 0.10)',
        'soft-purple-hover': '0px 15px 40px rgba(108, 92, 231, 0.18)',
        'purple-btn': '0px 8px 25px rgba(109, 94, 248, 0.25)',
      }
    },
  },
  plugins: [],
}
