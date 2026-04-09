export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        foreground: '#0F172A',
        muted: { DEFAULT: '#F1F5F9', foreground: '#64748B' },
        accent: { DEFAULT: '#0052FF', secondary: '#4D7CFF', foreground: '#FFFFFF' },
        border: '#E2E8F0',
        card: '#FFFFFF',
      },
      fontFamily: {
        display: ['Calistoga', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        accent: '0 4px 14px rgba(0,82,255,0.25)',
        'accent-lg': '0 8px 24px rgba(0,82,255,0.35)',
      },
    },
  },
  plugins: [],
};
