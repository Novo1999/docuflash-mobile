import type { FileType } from '@/types/file'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = 'system' | ThemeMode

export type FileBadgeColor = { bg: string; text: string }

export type ThemeColors = {
  screen: string
  surface: string
  surfaceAlt: string
  heading: string
  text: string
  muted: string
  mutedSoft: string
  border: string
  borderStrong: string
  inputBg: string
  segmentBg: string
  segmentActiveBg: string
  segmentActiveText: string
  dashBorder: string
  dashBg: string
  accent: string
  accentText: string
  accentSoftBg: string
  primaryBg: string
  primaryText: string
  danger: string
  dangerBorder: string
  dangerSoftBg: string
  overlay: string
  fileBadge: Record<FileType, FileBadgeColor>
  statusBar: 'light' | 'dark'
}

const accent = '#c8a96e'

export const lightColors: ThemeColors = {
  screen: '#f5f0e8',
  surface: '#fffdf9',
  surfaceAlt: 'rgba(15,28,46,0.06)',
  heading: '#0f1c2e',
  text: '#0f1c2e',
  muted: '#6f6a5f',
  mutedSoft: '#8a8579',
  border: 'rgba(15,28,46,0.08)',
  borderStrong: 'rgba(15,28,46,0.14)',
  inputBg: '#fffdf9',
  segmentBg: 'rgba(15,28,46,0.06)',
  segmentActiveBg: '#0f1c2e',
  segmentActiveText: '#f5f0e8',
  dashBorder: 'rgba(200,169,110,0.7)',
  dashBg: 'rgba(200,169,110,0.07)',
  accent,
  accentText: '#9a7b3e',
  accentSoftBg: 'rgba(200,169,110,0.16)',
  primaryBg: '#0f1c2e',
  primaryText: '#f5f0e8',
  danger: '#b4533f',
  dangerBorder: 'rgba(180,83,63,0.3)',
  dangerSoftBg: 'rgba(180,83,63,0.12)',
  overlay: 'rgba(15,28,46,0.45)',
  fileBadge: {
    pdf: { bg: 'rgba(200,169,110,0.18)', text: '#94762f' },
    docx: { bg: 'rgba(44,74,110,0.12)', text: '#2c4a6e' },
    xls: { bg: 'rgba(74,107,74,0.16)', text: '#4a6b4a' },
    zip: { bg: 'rgba(91,84,120,0.16)', text: '#5b5478' },
    txt: { bg: 'rgba(120,120,120,0.14)', text: '#5b6573' },
    other: { bg: 'rgba(120,120,120,0.14)', text: '#5b6573' },
  },
  statusBar: 'dark',
}

export const darkColors: ThemeColors = {
  screen: '#121417',
  surface: '#1b1e23',
  surfaceAlt: '#262a31',
  heading: '#f3efe7',
  text: '#ece9e3',
  muted: '#9aa0a8',
  mutedSoft: '#7e848c',
  border: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.14)',
  inputBg: '#1b1e23',
  segmentBg: 'rgba(255,255,255,0.06)',
  segmentActiveBg: '#ece9e3',
  segmentActiveText: '#121417',
  dashBorder: 'rgba(200,169,110,0.6)',
  dashBg: 'rgba(200,169,110,0.08)',
  accent,
  accentText: '#d8bd8a',
  accentSoftBg: 'rgba(200,169,110,0.18)',
  primaryBg: '#ece9e3',
  primaryText: '#121417',
  danger: '#e08c75',
  dangerBorder: 'rgba(216,117,95,0.35)',
  dangerSoftBg: 'rgba(216,117,95,0.14)',
  overlay: 'rgba(0,0,0,0.6)',
  fileBadge: {
    pdf: { bg: 'rgba(200,169,110,0.2)', text: '#d8bd8a' },
    docx: { bg: 'rgba(90,140,200,0.18)', text: '#8fb3df' },
    xls: { bg: 'rgba(74,107,74,0.2)', text: '#86b386' },
    zip: { bg: 'rgba(120,110,160,0.22)', text: '#a99fce' },
    txt: { bg: 'rgba(255,255,255,0.08)', text: '#9aa0a8' },
    other: { bg: 'rgba(255,255,255,0.08)', text: '#9aa0a8' },
  },
  statusBar: 'light',
}

export const fonts = {
  heading: 'SourceSerif4_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
}

export const radii = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 }

export function colorsFor(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors
}
