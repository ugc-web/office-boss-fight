/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f1226',
        panel: '#1a1f3d',
        neon: '#a855f7',
        cyanx: '#22d3ee',
        good: '#4ade80',
        bad: '#f97316',
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', 'monospace'],
        body: ['var(--font-body)', 'monospace'],
      },
      keyframes: {
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-8px)' }, '75%': { transform: 'translateX(8px)' } },
        hit: { '0%,100%': { filter: 'none' }, '50%': { filter: 'brightness(3) saturate(0)' } },
        lunge: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.3) translateY(10px)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        pop: { '0%': { transform: 'scale(0)', opacity: 0 }, '60%': { transform: 'scale(1.2)', opacity: 1 }, '100%': { transform: 'scale(1)' } },
        steam: { '0%': { transform: 'translateY(0)', opacity: 1 }, '100%': { transform: 'translateY(-20px)', opacity: 0 } },
      },
      animation: {
        shake: 'shake 0.3s steps(4) 2',
        hit: 'hit 0.2s steps(2) 3',
        lunge: 'lunge 0.4s steps(4)',
        bob: 'bob 1.2s steps(4) infinite',
        pop: 'pop 0.4s steps(5) both',
        steam: 'steam 1s steps(5) infinite',
      },
    },
  },
  plugins: [],
};
