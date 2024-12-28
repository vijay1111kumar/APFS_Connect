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
        primary: '#FEFAE0',
        secondary: '#FEFAE0',
        background: '#FEFFF8',
        highlight: '#CCD5AE',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')({
      charts: true,
  }),
  require("tailwind-scrollbar")({ nocompatible: true })
]
};
