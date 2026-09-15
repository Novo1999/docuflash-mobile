import { useTheme } from '@/theme/ThemeProvider'
import { View, type ViewStyle } from 'react-native'

/**
 * Inline determinate progress bar. The global upload bar under the status bar is
 * a separate component (UploadProgressBar) — this one sits next to whatever it
 * describes, so the reader can tell which file the progress belongs to.
 */
export function ProgressBar({
  progress,
  height = 4,
  trackColor,
  fillColor,
  style,
}: {
  progress: number
  height?: number
  trackColor?: string
  fillColor?: string
  style?: ViewStyle
}) {
  const { colors } = useTheme()
  const clamped = Math.max(0, Math.min(100, progress))

  return (
    <View style={[{ height, borderRadius: height / 2, backgroundColor: trackColor ?? colors.segmentBg, overflow: 'hidden' }, style]}>
      <View style={{ width: `${clamped}%`, height: '100%', borderRadius: height / 2, backgroundColor: fillColor ?? colors.accent }} />
    </View>
  )
}
