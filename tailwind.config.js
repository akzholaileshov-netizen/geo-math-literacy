/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        elev: 'var(--elev)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        brass: 'var(--brass)',
        'brass-deep': 'var(--brass-deep)',
        good: 'var(--good)',
        bad: 'var(--bad)',
        onbrass: 'var(--on-brass)',
        warn: 'var(--warn)',
        urgent: 'var(--urgent)',
      },
      fontFamily: {
        serif: ['Literata', 'Palatino Linotype', 'Palatino', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow)',
        lift: 'var(--shadow-lift)',
        glow: '0 0 24px var(--glow)',
      },
      minHeight: {
        11: '2.75rem',
      },
    },
  },
  plugins: [],
};
