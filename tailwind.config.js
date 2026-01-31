/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'login-hero': "url('/images/login.jpg')",
      },
    },
  },
  plugins: [],
}
