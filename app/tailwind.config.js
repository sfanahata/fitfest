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
        'fitfest': {
          deep: '#005B6A',
          bright: '#00A7B5',
          coral: '#FF6B6B',
          gold: '#FFD700',
          light: '#F0F2F5',
          dark: '#1A202C',
          text: '#2D3748',
          subtle: '#A0AEC0',
          success: '#48BB78',
          warning: '#F6E05E',
        }
      }
    },
  },
  plugins: [],
} 