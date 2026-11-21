import type { ViewStyle } from 'react-native';

/** Design tokens shared with the SI Coin web app (light fintech identity), tuned for a modern mobile look. */
export const colors = {
  // Brand
  primary: '#175CFF',
  primaryDeep: '#0F3FB8',
  navy: '#0A2A7A',
  ink: '#071A4D',
  sky: '#38BDF8',
  cyan: '#22D3EE',
  violet: '#7C5CFF',

  // Surfaces
  canvas: '#F3F6FD',
  surface: '#FFFFFF',
  paleBlue: '#EAF1FF',
  tint: '#F5F8FF',
  border: '#E3EAF6',
  overlay: 'rgba(7, 26, 77, 0.5)',

  // Text
  text: '#0E1B3D',
  textSoft: '#3A4A6B',
  muted: '#6B7A99',
  faint: '#A0AEC9',

  // Status
  success: '#12924F',
  successBg: '#EAFBF1',
  successBorder: '#BDEFD1',
  danger: '#D92D20',
  dangerBg: '#FEF3F2',
  dangerBorder: '#FECDCA',
  warning: '#B54708',
  warningBg: '#FFFAEB',
  warningBorder: '#FEDF89',

  white: '#FFFFFF',
} as const;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const;

type Shadow = Pick<ViewStyle, 'boxShadow'>;

/** Soft, layered elevation (cross-platform `boxShadow`). */
export const shadow = {
  soft: { boxShadow: '0px 2px 10px rgba(14, 27, 61, 0.06)' },
  card: { boxShadow: '0px 6px 20px rgba(14, 27, 61, 0.07)' },
  raised: { boxShadow: '0px 12px 30px rgba(14, 27, 61, 0.14)' },
  glow: { boxShadow: '0px 10px 24px rgba(23, 92, 255, 0.32)' },
} satisfies Record<string, Shadow>;

/** Tinted icon-chip palettes used for quick actions and list rows. */
export const chips = {
  blue: { bg: '#E6EEFF', fg: '#175CFF' },
  sky: { bg: '#E0F4FE', fg: '#0284C7' },
  violet: { bg: '#EEE9FF', fg: '#6D4AFF' },
  green: { bg: '#E3F8EC', fg: '#12924F' },
  amber: { bg: '#FFF1D6', fg: '#B54708' },
  rose: { bg: '#FDE7E7', fg: '#D92D20' },
  slate: { bg: '#EDF1F8', fg: '#3A4A6B' },
} as const;

export type ChipTone = keyof typeof chips;
