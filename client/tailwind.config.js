module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '14px': '14px',
        '16px': '16px',
        '18px': '18px',
        '20px': '20px',
        '28px': '28px',
        '35px': '35px',
        '45px': '45px',
        '53px': '53px',
      },
      fontWeight: {
        'LightItalic': 300,
        'Regular ': 400,
        'Medium': 500,
        'SemiBold ': 600,
        'Bold': 700,
        'ExtraBold': 800, // Adjust based on your needs


      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        royalBlue: "#4169e1",
        darkBlue: "#0d1117",
        dark: "#0d1117",
      },
    },

  },
  plugins: [],
}