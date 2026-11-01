/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F8F4',  // Light warm agronomic tint
          100: '#E6EFE4', // Soft sprout tint
          200: '#CFE0CB', // Delicate field green
          300: '#A5C96A', // Sunlit leaf accent
          400: '#75AB6E', // Vibrant agronomy leaf
          500: '#4F8A4B', // Natural secondary leaf green
          600: '#3A723D', // Medium deep field green
          700: '#245B38', // The Khedut Official Primary Brand Green
          800: '#1D4A2D', // Deep forest crop green
          900: '#153621', // Dark agricultural green
          950: '#0C2014', // Extreme dark crop green
        },
        khedut: {
          primary: '#245B38',
          secondary: '#4F8A4B',
          accent: '#A5C96A',
          bg: '#F7F9F5',
          text: '#1D2922',
          muted: '#6B786F',
        },
        dark: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          850: '#152033',
          900: '#0F172A',
          950: '#080E1A',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
