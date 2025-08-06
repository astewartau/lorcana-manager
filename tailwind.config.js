/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lorcana-blue': '#1e40af',
        'lorcana-purple': '#7c3aed',
        'lorcana-gold': '#f59e0b',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

