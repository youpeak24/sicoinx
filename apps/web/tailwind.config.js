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
          blue: '#175CFF',
          deep: '#123B9A',
          pale: '#EDF4FF',
          dark: '#10213A',
          muted: '#64748B',
          bg: '#F7FAFF',
          border: '#DFE8F5',
          success: '#15803D',
          warning: '#B45309',
          error: '#DC2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(18, 59, 154, 0.04), 0 10px 24px -4px rgba(18, 59, 154, 0.06)',
        'elevated': '0 12px 36px -6px rgba(23, 92, 255, 0.12), 0 4px 12px -2px rgba(16, 33, 58, 0.04)',
        'glow-blue': '0 0 25px -4px rgba(23, 92, 255, 0.35)',
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.35)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(23, 92, 255, 0.4)' },
          '50%': { opacity: '0.85', boxShadow: '0 0 24px 6px rgba(23, 92, 255, 0.25)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.08)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.96)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'blob': 'blob 10s infinite ease-in-out',
        'marquee': 'marquee 35s linear infinite',
        'gradient-flow': 'gradientFlow 6s ease infinite',
      },
    },
  },
  plugins: [],
}
