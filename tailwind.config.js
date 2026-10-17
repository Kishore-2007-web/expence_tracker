/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
        },
        aquatic: {
          DEFAULT: '#96DFCE', // PANTONE 13-5412 TCX Aquatic Green
          50: '#f1fbf8',
          100: '#ddf7f1',
          200: '#bfefe4',
          300: '#96DFCE',
          400: '#6dceb9',
          500: '#42bda3',
          600: '#2ea38d',
          700: '#268472',
          800: '#22695c',
          900: '#1f574d',
          950: '#0c332d',
        },
        sunshine: {
          DEFAULT: '#FADE85', // PANTONE 12-0727 TCX Sunshine Yellow
          50: '#fefef7',
          100: '#fdf9e7',
          200: '#fbf2ca',
          300: '#FADE85',
          400: '#f6ca53',
          500: '#eeb42a',
          600: '#d59318',
          700: '#ac6c17',
          800: '#8d5519',
          900: '#764719',
          950: '#44240a',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
        },
        success: {
          DEFAULT: '#96DFCE', // Pantone Aquatic Green
          dark: '#2ea38d',
        },
        danger: {
          DEFAULT: '#f43f5e', // Rose
          dark: '#e11d48',
        },
        slate: {
          50: 'var(--slate-50)',
          100: 'var(--slate-100)',
          200: 'var(--slate-200)',
          300: 'var(--slate-300)',
          400: 'var(--slate-400)',
          500: 'var(--slate-500)',
          600: 'var(--slate-600)',
          700: 'var(--slate-700)',
          800: 'var(--slate-800)',
          900: 'var(--slate-900)',
          955: 'var(--slate-950)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 24px rgba(150, 223, 206, 0.35)',
        'glow-sunshine': '0 0 24px rgba(250, 222, 133, 0.35)',
      },
    },
  },
  plugins: [],
}
