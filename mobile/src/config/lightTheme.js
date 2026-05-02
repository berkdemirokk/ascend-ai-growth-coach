// Vivid Impact Light Theme — Stitch "Modern Kartlar" / "Klasik Monastik"
// Bold red primary, white surfaces, Inter typography.
// Used by redesigned screens: Path, Stats, Profile, Home.
//
// To roll back to dark M3 theme, swap imports back to ../config/constants -> M3.

export const LT = {
  // Surfaces (light, layered)
  background: '#F9F9F9',
  surface: '#F9F9F9',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F3F3F4',
  surfaceContainer: '#EEEEEE',
  surfaceContainerHigh: '#E8E8E8',
  surfaceContainerHighest: '#E2E2E2',
  surfaceVariant: '#E2E2E2',

  // Text on surfaces
  onBackground: '#1A1C1C',
  onSurface: '#1A1C1C',
  onSurfaceVariant: '#5E3F3A',
  outline: '#936E69',
  outlineVariant: '#E8BCB6',

  // Brand — bold vivid red
  primary: '#B70006',
  primaryContainer: '#E31212',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FFF7F5',

  // Tertiary (cobalt blue accent)
  tertiary: '#3741E1',
  tertiaryContainer: '#535EFB',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#FAF7FF',

  // Status
  error: '#BA1A1A',
  success: '#0F7B3D',
};

// Typography scale (Inter)
export const LT_TYPE = {
  displayHero: {
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -1,
    fontWeight: '900',
  },
  h1: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.4,
    fontWeight: '700',
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  labelCaps: {
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  streakNumber: {
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -0.5,
    fontWeight: '900',
  },
};

export const LT_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 16,
  containerMargin: 20,
};

export const LT_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};
