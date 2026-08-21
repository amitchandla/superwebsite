/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#151312',
        paper: '#FAF7F2',
        moss: '#2F5233',
        ember: '#C4592B',
        brass: '#B08D57',
        line: '#E4DDCF'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
}
