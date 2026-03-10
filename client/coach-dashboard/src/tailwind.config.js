/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vlr-dark': '#0f1923',    // Nền tối Valorant
        'vlr-red': '#ff4655',     // Đỏ đặc trưng
        'vlr-card': '#1b2733',    // Màu thẻ card
        'vlr-white': '#ece8e1',   // Màu chữ trắng ngà
      },
    },
  },
  plugins: [],
}