/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'system-ui', 'sans-serif'],
        hud: ['Rajdhani', 'system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        jarvis: {
          bg: '#020617',
          panel: '#0b1220',
          'panel-bright': '#0f1b2d',
          cyan: '#22d3ee',
          'cyan-bright': '#67e8f9',
          'cyan-deep': '#0891b2',
          amber: '#fbbf24',
        },
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scan-line': {
          '0%':   { transform: 'translateY(-10%)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(110%)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(34,211,238,0.6), 0 0 16px rgba(34,211,238,0.25)' },
          '50%':      { boxShadow: '0 0 14px rgba(34,211,238,0.9), 0 0 28px rgba(34,211,238,0.4)' },
        },
        'core-pulse': {
          '0%, 100%': { transform: 'scale(1)',   filter: 'brightness(1)' },
          '50%':      { transform: 'scale(1.05)', filter: 'brightness(1.3)' },
        },
        'radar-sweep': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'hud-boot': {
          '0%':   { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '60%':  { opacity: '1', transform: 'translateY(0)    scale(1.005)' },
          '100%': { opacity: '1', transform: 'translateY(0)    scale(1)' },
        },
        'ring-expand': {
          '0%':   { transform: 'scale(0.8)', opacity: '0.9' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'data-stream': {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'bar-flicker': {
          '0%':   { transform: 'scaleY(0.3)' },
          '25%':  { transform: 'scaleY(0.9)' },
          '50%':  { transform: 'scaleY(0.55)' },
          '75%':  { transform: 'scaleY(1)' },
          '100%': { transform: 'scaleY(0.45)' },
        },
        'snap-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)', letterSpacing: '0.35em', filter: 'blur(2px)' },
          '60%':  { opacity: '1', transform: 'scale(1.015)', letterSpacing: '0.22em', filter: 'blur(0)' },
          '100%': { opacity: '1', transform: 'scale(1)',    letterSpacing: '0.2em',  filter: 'blur(0)' },
        },
        'z-drift': {
          '0%, 100%': { transform: 'translateZ(0)    scale(1)' },
          '50%':      { transform: 'translateZ(10px) scale(1.012)' },
        },
        'hud-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: '1' },
          '20%, 24%, 55%': { opacity: '0.4' },
        },
        'target-snap': {
          '0%':   { opacity: '0', transform: 'scale(1.4) rotate(-3deg)' },
          '40%':  { opacity: '1', transform: 'scale(0.96) rotate(0.5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        'tick-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '1' },
        },
      },
      animation: {
        'marquee':      'marquee 35s linear infinite',
        'scan-line':    'scan-line 6s linear infinite',
        'glow-pulse':   'glow-pulse 2.4s ease-in-out infinite',
        'core-pulse':   'core-pulse 2.6s ease-in-out infinite',
        'radar-sweep':  'radar-sweep 4s linear infinite',
        'hud-boot':     'hud-boot 0.6s cubic-bezier(0.2,0.8,0.2,1) both',
        'ring-expand':  'ring-expand 2s cubic-bezier(0,0,0.2,1) infinite',
        'data-stream':  'data-stream 18s linear infinite',
        'bar-flicker':  'bar-flicker 0.9s ease-in-out infinite',
        'snap-in':      'snap-in 0.45s cubic-bezier(0.2,0.9,0.3,1) both',
        'z-drift':      'z-drift 6s ease-in-out infinite',
        'hud-flicker':  'hud-flicker 4s linear infinite',
        'target-snap':  'target-snap 0.35s cubic-bezier(0.2,1.5,0.4,1) both',
        'tick-pulse':   'tick-pulse 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
