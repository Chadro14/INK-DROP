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
        // ============================================
        // INKDROP — TikTok Style (Blanc/Noir)
        // ============================================
        ink: {
          bg: '#FFFFFF',          // Fond blanc
          card: '#F8F8F8',         // Gris très clair
          border: '#E8E8E8',       // Gris clair
          text: '#000000',         // Noir pur
          muted: '#8A8A8A',        // Gris moyen
        },
        accent: {
          DEFAULT: '#000000',      // Noir
          light: '#333333',        // Gris foncé
          dark: '#000000',         // Noir
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;