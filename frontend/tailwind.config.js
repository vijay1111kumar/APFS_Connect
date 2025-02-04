/** @type {import('tailwindcss').Config} */
const flowbite = require("flowbite-react/tailwind");
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', flowbite.content()],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        text: '#252525',
        base: "#F6F6F4",
        base2: "#edede9",
        primary: '#343633',
        secondary: '#FEFAE0',
        background: '#FEFFF8',
        highlight: '#DD6031',
        focus: "#D9DD92",
        graph: "#D9DD92"
      },
      animation: {
        fade: 'fadeOut 1s ease-in-out',
      },
      keyframes: theme => ({
        fadeOut: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }),

    },
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
  }),
  require("tailwind-scrollbar")({ nocompatible: true })
]
};
