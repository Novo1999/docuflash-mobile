import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

export type IconName =
  | 'upload'
  | 'download'
  | 'lock'
  | 'close'
  | 'check'
  | 'copy'
  | 'mail'
  | 'share'
  | 'folder'
  | 'chevron-down'
  | 'chevron-right'
  | 'chevron-left'
  | 'search'
  | 'plus'
  | 'external'
  | 'trash'
  | 'qr'
  | 'eye'
  | 'clock'
  | 'calendar'
  | 'bell'
  | 'appearance'
  | 'settings'
  | 'logout'
  | 'github'
  | 'camera'
  | 'image'

type MaterialName = ComponentProps<typeof MaterialCommunityIcons>['name']

// Map the app's semantic icon names to react-native-paper / MaterialCommunityIcons glyphs.
const GLYPHS: Record<IconName, MaterialName> = {
  upload: 'tray-arrow-up',
  download: 'tray-arrow-down',
  lock: 'lock-outline',
  close: 'close',
  check: 'check',
  copy: 'content-copy',
  mail: 'email-outline',
  share: 'share-variant',
  folder: 'folder-outline',
  'chevron-down': 'chevron-down',
  'chevron-right': 'chevron-right',
  'chevron-left': 'chevron-left',
  search: 'magnify',
  plus: 'plus',
  external: 'open-in-new',
  trash: 'trash-can-outline',
  qr: 'qrcode',
  eye: 'eye-outline',
  clock: 'clock-outline',
  calendar: 'calendar-outline',
  bell: 'bell-outline',
  appearance: 'theme-light-dark',
  settings: 'cog-outline',
  logout: 'logout',
  github: 'github',
  camera: 'camera-outline',
  image: 'image-outline',
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  /** Accepted for backwards-compat with the old SVG icons; ignored by Material icons. */
  strokeWidth?: number
}

export function Icon({ name, size = 18, color = '#000' }: IconProps) {
  return <MaterialCommunityIcons name={GLYPHS[name]} size={size} color={color} />
}
