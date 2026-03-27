/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        quantum: { cyan: '#00f0ff', purple: '#a855f7', pink: '#f43f5e', green: '#22c55e', gold: '#f59e0b' },
        dark: { 900: '#040810', 800: '#0a0f1e', 700: '#111827' }
      },
      fontFamily: { mono: ["'JetBrains Mono'", "monospace"] },
      animation: { 'gradient': 'gradient 4s ease infinite', 'slide-up': 'slideUp .3s ease' },
      keyframes: {
        gradient: { '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
      }
    }
  },
  plugins: []
}
