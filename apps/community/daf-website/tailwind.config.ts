import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Background - Warmer cream for less eye strain
        cream: '#F5F1E8',
        cream2: '#EDE8DB',
        
        // Text Colors - Higher contrast
        charcoal: '#1A1A1A',        // Near black for headings - WCAG AAA
        'taupe': '#4A4A4A',         // Dark gray for body text - WCAG AA
        'taupe-dark': '#2D2D2D',    // Darker for better readability
        
        // Accent - Muted but visible
        gold: '#9A8565',            // Darker gold for better contrast
        'gold-light': '#B5A48B',    // Lighter for hover states
        
        // Borders - More visible
        border: '#D4CFC4',          // Darker border
        input: '#C4BDB0',           // Visible input borders
        
        // Medical Calming Colors 2026
        'slate-medical': '#5A6570', // Medical slate for secondary text
        'teal-accent': '#3D6B4F',   // Muted teal for success/CTA
        
        // Dark section (Services, Footer)
        'charcoal-dark': '#0F0F0F', // Darker for dark sections
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '0.2em',
        'wider': '0.1em',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease forwards',
        'fade-in': 'fadeIn 0.6s ease forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
