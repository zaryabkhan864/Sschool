/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'xs-custom': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm-custom': ['0.875rem', { lineHeight: '1.25rem' }],
        'base-custom': ['1rem', { lineHeight: '1.5rem' }],
        'lg-custom': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl-custom': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl-custom': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        'nav-group': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.09em' }],
        'nav-item': ['0.875rem', { lineHeight: '1.25rem' }],
        'nav-caption': ['0.6875rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      colors: {
        brand: {
          50: '#f0f6ff', 100: '#e0edff', 200: '#c7ddff', 300: '#9ec3ff',
          400: '#6d9eff', 500: '#3b76f6', 600: '#2557eb', 700: '#1d43d8',
          800: '#1e38af', 900: '#1e328b', 950: '#0f1d52',
        },
        navy: {
          700: '#2c3b52',
          800: '#1e293b',
          900: '#0f172a',
          950: '#080d1a',
        },
        surface: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          800: '#1e293b', 900: '#0f172a',
        },
        // Neutral text scale for light-background areas (cards, inputs, badges) —
        // replaces old ad-hoc gray-*/dark/dark-light usage across components
        ink: {
          900: '#0f172a',
          700: '#334155',
          600: '#475569',
          400: '#94a3b8',
          300: '#cbd5e1',
        },
      },
      boxShadow: {
        'soft': '0 2px 12px -2px rgba(15, 23, 42, 0.04)',
        'card': '0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
        'button': '0 8px 20px -4px rgba(37, 87, 235, 0.25)',
        'glow-brand': '0 0 16px rgba(59, 118, 246, 0.4)',
        'glow-soft': '0 0 32px rgba(59, 118, 246, 0.15)',
        'premium': '0 20px 40px -8px rgba(8, 13, 26, 0.35)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
