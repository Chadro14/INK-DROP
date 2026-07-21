import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          bg: '#FFFFFF',          // Blanc
          card: '#F5F5F5',         // Gris clair
          border: '#E0E0E0',       // Gris
          text: '#000000',         // Noir
          muted: '#666666',        // Gris moyen
        },
        accent: {
          DEFAULT: '#000000',      // Noir
          light: '#333333',        // Gris foncé
          dark: '#000000',         // Noir
        },
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;