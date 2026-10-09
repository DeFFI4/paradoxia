/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          950: '#030305',
          900: '#060609',
          850: '#0a0a0f',
          800: '#11111a',
          700: '#1a1a27',
          600: '#262638',
        },
        cyber: {
          cyan: '#06b6d4',
          'cyan-bright': '#22d3ee',
          violet: '#8b5cf6',
          'violet-bright': '#a855f7',
          emerald: '#10b981',
          'emerald-bright': '#34d399',
          amber: '#f59e0b',
          crimson: '#f43f5e',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.03)',
          highlight: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-active': 'rgba(6, 182, 212, 0.40)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.5)',
        'glow-crimson': '0 0 25px -5px rgba(244, 63, 94, 0.4)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.57)',
        'glass-card-hover': '0 16px 48px 0 rgba(6, 182, 212, 0.15)',
      },
      animation: {
        'aurora': 'aurora 15s ease infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-flow': 'glowFlow 6s linear infinite',
      },
      keyframes: {
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        glowFlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
};
