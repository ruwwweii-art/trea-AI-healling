/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 大地色系 - 优化低饱和暖调
      colors: {
        // 奶茶色系（更温暖的米色调）
        'cream': {
          50: '#FEFCF5',
          100: '#FAF8F5',
          200: '#F5F0E8',
          300: '#F0E8D8',
        },
        'warm-white': '#FFFCFA',
        'warm-gray': {
          50: '#FAFAF8',
          100: '#F8F8F0',
          200: '#F0EBE5',
          300: '#E8E8E0',
        },
        // 柔和雾霾蓝（更舒适的蓝色调）
        'gentle-blue': {
          50: '#F8FAFC',
          100: '#F0F8FC',
          200: '#E8F4FA',
          300: '#D4EAF6',
        },
        // 情绪颜色（优化后的柔和色调）
        'mood-low': '#E8B4C8',
        'mood-mid': '#B8D4D1',
        'mood-high': '#A7D7A9',
        'accent': '#D4EAF6',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.6',
          relaxed: '1.8',
          loose: '2',
        },
        letterSpacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0',
          wide: '0.025em',
          wider: '0.05em',
          widest: '0.1em',
        },
      },
      boxShadow: {
        // 更柔和的阴影系统
        'card': '0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06)',
        'button': '0 2px 6px rgba(0,0,0,0.08)',
        'floating': '0 8px 24px rgba(0,0,0,0.06)',
        'glow': '0 0px 20px rgba(212, 236, 253, 0.1)',
      },
      spacing: {
        // 增加留白，营造呼吸感
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '2.5rem',
        '2xl': '3rem',
        'padding': {
          'card': '2rem',
          'page': '3rem',
          'section': '4rem',
        },
      },
      borderRadius: {
        // 更圆润的设计
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      animation: {
        // 温和的动画效果
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}