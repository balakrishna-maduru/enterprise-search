module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50, #fef2f2)',
          100: 'var(--color-primary-100, #fee2e2)',
          200: 'var(--color-primary-200, #fecaca)',
          300: 'var(--color-primary-300, #fca5a5)',
          400: 'var(--color-primary-400, #f87171)',
          500: 'var(--color-primary-500, #ef4444)',
          600: 'var(--color-primary-600, #dc2626)',
          700: 'var(--color-primary-700, #b91c1c)',
          800: 'var(--color-primary-800, #991b1b)',
          900: 'var(--color-primary-900, #7f1d1d)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #f8fafc)',
          100: 'var(--color-secondary-100, #f1f5f9)',
          200: 'var(--color-secondary-200, #e2e8f0)',
          300: 'var(--color-secondary-300, #cbd5e1)',
          400: 'var(--color-secondary-400, #94a3b8)',
          500: 'var(--color-secondary-500, #64748b)',
          600: 'var(--color-secondary-600, #475569)',
          700: 'var(--color-secondary-700, #334155)',
          800: 'var(--color-secondary-800, #1e293b)',
          900: 'var(--color-secondary-900, #0f172a)',
        },
        accent: {
          50: 'var(--color-accent-50, #fef7ff)',
          100: 'var(--color-accent-100, #fdf2ff)',
          200: 'var(--color-accent-200, #fce7ff)',
          300: 'var(--color-accent-300, #f8ccff)',
          400: 'var(--color-accent-400, #f0a3ff)',
          500: 'var(--color-accent-500, #e879f9)',
          600: 'var(--color-accent-600, #d946ef)',
          700: 'var(--color-accent-700, #c026d3)',
          800: 'var(--color-accent-800, #a21caf)',
          900: 'var(--color-accent-900, #86198f)',
        }
      }
    },
  },
  plugins: [],
}