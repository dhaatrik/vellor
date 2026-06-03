/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        primary: {
          light: '#0a0a0a',
          DEFAULT: '#000000',
          dark: '#000000',
        },
        secondary: {
          light: '#ffffff',
          DEFAULT: '#f8fafc',
          dark: '#f1f5f9',
        },
        accent: {
          light: 'var(--color-accent-light, #a78bfa)',
          DEFAULT: 'var(--color-accent, #8b5cf6)',
          dark: 'var(--color-accent-dark, #7c3aed)',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#f43f5e',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0'},
          '100%': { transform: 'translateY(0)', opacity: '1'},
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    }
  },
  plugins: [],
}
