// tailwind.config.ts
import type { Config } from 'tailwindcss'

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
        // === INKDROP COLORS ===
        ink: {
          bg: '#0F0F0F',         // Fond principal
          card: '#1A1A1A',        // Cartes
          border: '#2A2A2A',      // Bordures
          text: '#FFFFFF',        // Texte principal
          muted: '#9CA3AF',       // Texte secondaire
        },
        accent: {
          DEFAULT: '#FF6B35',     // Orange INKDROP
          light: '#FFE66D',       // Jaune
          dark: '#F03E5B',        // Rouge-rose
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
}

export default config