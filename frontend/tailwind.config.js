/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    extend: {
      // Semantic font scale (use these classes for all text elements)
      fontSize: {
        'xs-custom': ['0.75rem', { lineHeight: '1rem' }],     // 12px
        'sm-custom': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base-custom': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg-custom': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl-custom': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl-custom': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        'display-sm': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }], // 36px
        'display-lg': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }],       // 56px
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],           
      },
      colors: {
        brand: {
          50: '#fff1f2',
          100: '#ffe4e6',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          900: '#881337',
        },
        dark: {
          light: '#1f2937',
          DEFAULT: '#111827', // Rich Black/Gray
          darker: '#0d1117',
        },
        surface: {
          50: '#f9fafb',
          100: '#f3f4f6',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};