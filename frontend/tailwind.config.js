/** @type {import('tailwindcss').Config} */
export default {
  // This is the most important change: enables class-based dark mode
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // We no longer need the custom theme colors here.
      // We will use Tailwind's default color palette with dark: variants.
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Optional: Add a fade-in animation for content
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
