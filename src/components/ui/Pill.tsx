import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'
import { AppText } from './AppText'

export function Pill({
  label,
  tone = 'neutral',
  icon,
  style,
}: {
  label: string
  tone?: 'neutral' | 'accent' | 'danger'
  icon?: ReactNode
  style?: ViewStyle
}) {
  const { colors } = useTheme()
  const bg = tone === 'accent' ? colors.accentSoftBg : tone === 'danger' ? colors.dangerSoftBg : 'transparent'
  const text = tone === 'accent' ? colors.accentText : tone === 'danger' ? colors.danger : colors.muted
  const border = tone === 'neutral' ? { borderWidth: 1, borderColor: colors.borderStrong } : null

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: bg,
          borderRadius: 20,
          paddingVertical: 5,
          paddingHorizontal: 11,
        },
        border,
        style,
      ]}
    >
      {icon}
      <AppText weight="semibold" size={11} color={text}>
        {label}
      </AppText>
    </View>
  )
}
