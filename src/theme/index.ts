export const colors = {
  primary: '#176B87',
  primaryMuted: '#E6F3F7',

  background: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F5',

  text: '#17212B',
  textSecondary: '#53616D',
  textMuted: '#77838D',

  border: '#D8E0E6',

  safe: '#247A4A',
  safeBackground: '#E7F5EC',

  warning: '#A96500',
  warningBackground: '#FFF3DC',

  danger: '#B42318',
  dangerBackground: '#FDECEA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
} as const;

export const typography = {
  caption: 12,
  body: 15,
  bodyLarge: 17,
  title: 20,
  heading: 24,
  display: 32,
  metric: 26,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  typography,
} as const;

export type Theme = typeof theme;