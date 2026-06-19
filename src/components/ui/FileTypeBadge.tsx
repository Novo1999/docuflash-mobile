import { useTheme } from '@/theme/ThemeProvider'
import { FileType } from '@/types/file'
import { View } from 'react-native'
import { AppText } from './AppText'

const LABELS: Record<FileType, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  xls: 'XLSX',
  zip: 'ZIP',
  txt: 'TXT',
  other: 'FILE',
}

export function FileTypeBadge({ type, size = 40, radius = 12 }: { type: FileType; size?: number; radius?: number }) {
  const { colors } = useTheme()
  const badge = colors.fileBadge[type] ?? colors.fileBadge.other
  const label = LABELS[type] ?? 'FILE'
  const fontSize = label.length >= 4 ? size * 0.24 : size * 0.27

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: badge.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText weight="bold" size={fontSize} color={badge.text}>
        {label}
      </AppText>
    </View>
  )
}
