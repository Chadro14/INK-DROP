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
        // INKDROP — BLEU/BLANC
        // ============================================
        ink: {
          bg: '#0A1628',          // Bleu très foncé (fond)
          card: '#0F213A',         // Bleu foncé (cartes)
          border: '#1A3A5C',       // Bleu moyen (bordures)
          text: '#FFFFFF',         // Blanc
          muted: '#8CB4E8',        // Bleu clair (texte secondaire)
        },
        accent: {
          DEFAULT: '#3B82F6',      // Bleu vif
          light: '#60A5FA',        // Bleu clair
          dark: '#1D4ED8',         // Bleu foncé
        },
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;