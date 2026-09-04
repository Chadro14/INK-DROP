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
          bg: '#000000',
          card: '#0A0A0A',
          border: '#1A1A1A',
          text: '#FFFFFF',
          muted: '#AAAAAA',
        },
        accent: {
          DEFAULT: '#FFFFFF',
          dark: '#E0E0E0',
        },
        // ✅ NOUVELLES COULEURS - THÈME ORANGE/AMBRE (ACTIF)
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // ← ORANGE PRINCIPAL
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        // ✅ NOUVELLES COULEURS - THÈME VERT ÉMERAUDE (commenté)
        // primary: {
        //   50: '#ecfdf5',
        //   100: '#d1fae5',
        //   200: '#a7f3d0',
        //   300: '#6ee7b7',
        //   400: '#34d399',
        //   500: '#10b981',  // ← VERT ÉMERAUDE
        //   600: '#059669',
        //   700: '#047857',
        //   800: '#065f46',
        //   900: '#064e3b',
        //   950: '#022c22',
        // },
        // ✅ NOUVELLES COULEURS - THÈME VIOLET (commenté)
        // primary: {
        //   50: '#f5f3ff',
        //   100: '#ede9fe',
        //   200: '#ddd6fe',
        //   300: '#c4b5fd',
        //   400: '#a78bfa',
        //   500: '#8b5cf6',  // ← VIOLET
        //   600: '#7c3aed',
        //   700: '#6d28d9',
        //   800: '#5b21b6',
        //   900: '#4c1d95',
        //   950: '#2e1065',
        // },
        // ✅ NOUVELLES COULEURS - THÈME ROSE (commenté)
        // primary: {
        //   50: '#fdf2f8',
        //   100: '#fce7f3',
        //   200: '#fbcfe8',
        //   300: '#f9a8d4',
        //   400: '#f472b6',
        //   500: '#ec4899',  // ← ROSE
        //   600: '#db2777',
        //   700: '#be185d',
        //   800: '#9d174d',
        //   900: '#831843',
        //   950: '#500724',
        // },
        // ✅ NOUVELLES COULEURS - THÈME CYAN (commenté)
        // primary: {
        //   50: '#ecfeff',
        //   100: '#cffafe',
        //   200: '#a5f3fc',
        //   300: '#67e8f9',
        //   400: '#22d3ee',
        //   500: '#06b6d4',  // ← CYAN
        //   600: '#0891b2',
        //   700: '#0e7490',
        //   800: '#155e75',
        //   900: '#164e63',
        //   950: '#083344',
        // },
        // ✅ NOUVELLES COULEURS - THÈME ROUGE (commenté)
        // primary: {
        //   50: '#fef2f2',
        //   100: '#fee2e2',
        //   200: '#fecaca',
        //   300: '#fca5a5',
        //   400: '#f87171',
        //   500: '#ef4444',  // ← ROUGE
        //   600: '#dc2626',
        //   700: '#b91c1c',
        //   800: '#991b1b',
        //   900: '#7f1d1d',
        //   950: '#450a0a',
        // },
        // ✅ NOUVELLES COULEURS - THÈME BLEU (commenté)
        // primary: {
        //   50: '#eff6ff',
        //   100: '#dbeafe',
        //   200: '#bfdbfe',
        //   300: '#93c5fd',
        //   400: '#60a5fa',
        //   500: '#3b82f6',  // ← BLEU
        //   600: '#2563eb',
        //   700: '#1d4ed8',
        //   800: '#1e40af',
        //   900: '#1e3a8a',
        //   950: '#172554',
        // },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'slide-left': 'slideLeft 0.5s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
