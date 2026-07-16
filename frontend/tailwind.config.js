/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #0F172A)',
          dark: 'var(--color-primary-dark, #020617)',
        },
        secondary: {
          DEFAULT: '#1E293B', // Slate 800
          light: '#334155',   // Slate 700
        },
        accent: {
          DEFAULT: 'var(--color-accent, #14B8A6)', // Teal 500
          hover: 'var(--color-accent-hover, #0D9488)',   // Teal 600
          light: 'var(--color-accent-light, #CCFBF1)',   // Teal 100
        },
        healthbg: {
          DEFAULT: '#F8FAFC', // Slate 50
          dark: '#0F172A',
        },
        background: 'var(--color-bg, #F8FAFC)',
        'surface-container': 'var(--color-surface, #ffffff)',
        'surface-container-low': 'var(--color-surface-low, #f1f5f9)',
        'surface-container-high': 'var(--color-surface-high, #e2e8f0)',
        'surface-container-highest': 'var(--color-surface-highest, #cbd5e1)',
        'on-surface': 'var(--color-on-surface, #0f172a)',
        'on-surface-variant': 'var(--color-on-surface-variant, #475569)',
        'outline-variant': 'var(--color-outline-variant, #e2e8f0)',
        outline: 'var(--color-outline, #94a3b8)',
        tertiary: 'var(--color-tertiary, #dec29a)',
        'primary-stitch': 'var(--color-accent, #14B8A6)',
        'secondary-stitch': 'var(--color-accent, #14B8A6)',
        error: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
