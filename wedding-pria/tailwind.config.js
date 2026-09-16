/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        playfair: ['"Playfair Display"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        alex: ['"Alex Brush"', 'cursive'],
      },
      colors: {
        emerald: {
          950: '#04130d',
          900: '#092318',
          850: '#0e3122',
          800: '#143f2d',
          700: '#1c553e',
          600: '#267354',
          500: '#34936d',
          400: '#4db58a',
          300: '#7ad0ac',
          200: '#b0e7cf',
          100: '#d9f5e9',
          50: '#f0faf5',
        },
        gold: {
          900: '#5a4309',
          800: '#7d5e0d',
          700: '#a37a13',
          600: '#c5941c',
          500: '#d4af37',
          400: '#dfc259',
          300: '#ebd481',
          200: '#f4e6b1',
          100: '#fbf4dd',
          50: '#fdfbf4',
        },
        cream: {
          900: '#d4c7b2',
          800: '#ded3c1',
          700: '#e7ded0',
          600: '#efe8dc',
          500: '#f4ede2',
          400: '#f8f3eb',
          300: '#fbf8f2',
          200: '#fdfbf8',
          100: '#ffffff',
        }
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'float 7s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'sway': 'sway 4s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sway: {
          '0%': { transform: 'rotate(-2deg)' },
          '100%': { transform: 'rotate(2deg)' },
        }
      },
    },
  },
  plugins: [],
};