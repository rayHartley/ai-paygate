/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tron: {
          red: '#c23631',
          dark: '#1a1a2e',
          darker: '#0f0f23',
          accent: '#e94560',
          blue: '#0f3460',
          purple: '#533483',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(233, 69, 96, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(233, 69, 96, 0.8), 0 0 40px rgba(233, 69, 96, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
