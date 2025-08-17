import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        border: 'var(--border)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          '2': 'var(--primary-2)',
        },
        accent: 'var(--accent)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        danger: 'var(--danger)',
        chip: 'var(--chip)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['var(--font-family)'],
      },
      fontSize: {
        'xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.25rem' }],
        'sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.5rem' }],
        'base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.75rem' }],
        'lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.75rem' }],
        'xl': ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { lineHeight: '2rem' }],
        '2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '2.25rem' }],
        '3xl': ['clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)', { lineHeight: '2.5rem' }],
        '4xl': ['clamp(2.25rem, 1.9rem + 1.75vw, 3rem)', { lineHeight: '1.1' }],
        '5xl': ['clamp(3rem, 2.5rem + 2.5vw, 4rem)', { lineHeight: '1.1' }],
        '6xl': ['clamp(3.75rem, 3rem + 3.75vw, 5rem)', { lineHeight: '1.1' }],
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '64': '16rem',
      },
      borderRadius: {
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'float': 'var(--shadow-float)',
        'subtle': 'var(--shadow-subtle)',
      },
      animation: {
        'quick-in': 'quickIn 0.2s ease-out',
        'soft-scale': 'softScale 0.2s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        quickIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        softScale: {
          '0%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      screens: {
        'xs': '390px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: 'var(--container-padding)',
          sm: 'var(--container-padding)',
          lg: 'var(--container-padding)',
          xl: 'var(--container-padding)',
          '2xl': 'var(--container-padding)',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': 'var(--container-max)',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
