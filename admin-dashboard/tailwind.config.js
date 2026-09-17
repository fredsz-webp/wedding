/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        emerald: {
          950: '#04130d',
          900: '#092318',
          850: '#0e3122',
          800: '#143f2d',
        },
        gold: {
          600: '#c5941c',
          500: '#d4af37',
          400: '#dfc259',
          100: '#fbf4dd',
        },
      },
    },
  },
  plugins: [],
};
