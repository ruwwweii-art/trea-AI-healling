/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 奶茶色系
        cream: {
          50: '#FFFEF9',
          100: '#FDF9ED',
          200: '#F9EFE0',
          300: '#F5E0D0',
          400: '#F0CFB8',
          500: '#F5F0E8',
          600: '#D4C4B0',
        },
        // 大地色系
        earth: {
          50: '#FAF7F4',
          100: '#F5EDE5',
          200: '#EBDDD1',
          300: '#E0CDBE',
          400: '#D6BCAB',
          500: '#CCAB98',
          600: '#C29A85',
        },
        // 雾霾蓝
        misty: {
          50: '#F5F8FA',
          100: '#EAF0F4',
          200: '#DFE6ED',
          300: '#D3DCE6',
          400: '#C8D2DF',
          500: '#E8F0F2',
          600: '#AAB8C5',
        },
      },
      borderRadius: {
        'chat': '18px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
}
