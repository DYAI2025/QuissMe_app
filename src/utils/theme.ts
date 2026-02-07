// Design System - QuissMe Theme
export const theme = {
  colors: {
    bg: '#0a0a0b',
    panel: 'rgba(255, 255, 255, 0.04)',
    panelHover: 'rgba(255, 255, 255, 0.08)',
    text: '#f2f3f5',
    muted: '#a7abb3',
    indigo: '#5b46ff',
    violet: '#a78bfa',
    amber: '#f59e0b',
    orange: '#f97316',
    success: '#22c55e',
    border: 'rgba(255, 255, 255, 0.08)',
    gradientStart: '#5b46ff',
    gradientEnd: '#a78bfa',
  },
  fonts: {
    serif: 'Fraunces',
    sans: 'Sora',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  blur: {
    sm: 8,
    md: 16,
    lg: 20,
  }
};

export type Theme = typeof theme;
