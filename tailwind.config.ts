/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#30AF5B',
          90: '#292C27',
        },
        gray: {
          10: '#EEEEEE',
          20: '#A2A2A2',
          30: '#7B7B7B',
          50: '#585858',
          90: '#141414',
        },
        orange: {
          50: '#FF814C',
        },
        blue: {
          70: '#021639',
        },
        yellow: {
          50: '#FEC601',
        },
        lightBlue: {
          400: '#3FB4E6',
        },
        red: {
          999: '#FF3131'
        },
        navy: {
          100: "#23395d",
          200: "#203354",
          300: "#1c2e4a",
          400: "#192841",
          500: "#152238",
          800: '#1B212B',
        },
        sb: {
          100: '#3FB4E6',
        }
      },
      backgroundImage: {
        'bg-img-1': "url('/img-1.png')",
        'bg-img-2': "url('/img-2.png')",
        'feature-bg': "url('/feature-bg.png')",
        pattern: "url('/pattern.png')",
        'pattern-2': "url('/pattern-bg.png')",
      },
      screens: {
        xs: '400px',
        '3xl': '1680px',
        '4xl': '2200px',
      },
      maxWidth: {
        '10xl': '1512px',
      },
      borderRadius: {
        '5xl': '40px',
      },
      fontFamily: {
        gotham: ["Gotham", "sans-serif"],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
  safelist: [
    'text-navy-100',
    'text-navy-200',
    'text-navy-300',
    'text-navy-400',
    'text-navy-500',
    'text-navy-600',
    'text-navy-700',
    'text-navy-800',
    'text-navy-900',
    'text-indigo-800',
    'bg-[#ffaf00]',
    'bg-[#C0C0C0]',
    'bg-[#3FB4E6]',
    'bg-[#CD7F32]'
  ]
};