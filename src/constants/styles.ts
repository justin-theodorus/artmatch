// Design system constants

export const COLORS = {
  // Primary palette - Rich indigo
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#a5b4fc',
  primaryGhost: '#eef2ff',

  // Secondary palette - Vibrant pink/magenta
  secondary: '#ec4899',
  secondaryDark: '#db2777',
  secondaryLight: '#f9a8d4',
  secondaryGhost: '#fdf2f8',

  // Accent colors for variety
  accent: '#8b5cf6', // Purple
  accentAlt: '#06b6d4', // Cyan

  // Backgrounds
  background: '#ffffff',
  backgroundLight: '#f9fafb',
  backgroundDark: '#f3f4f6',

  // Text hierarchy
  text: '#111827',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  textMuted: '#d1d5db',

  // Borders
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  // Semantic colors
  success: '#10b981',
  successLight: '#d1fae5',
  error: '#ef4444',
  errorLight: '#fee2e2',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  info: '#3b82f6',
  infoLight: '#dbeafe',

  // Gradient stops
  gradientStart: '#6366f1',
  gradientEnd: '#ec4899',
}

// Gradient definitions for use with LinearGradient
export const GRADIENTS = {
  primary: ['#6366f1', '#8b5cf6'],
  secondary: ['#ec4899', '#f472b6'],
  sunset: ['#f97316', '#ec4899'],
  ocean: ['#06b6d4', '#6366f1'],
  forest: ['#10b981', '#06b6d4'],
  card: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)'],
}

// Shadow presets
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  colored: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  }),
}

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
}

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16
  }
}

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999
}
