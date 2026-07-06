import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'

type DetailRowProps = { label: string; value: string; accent?: boolean; last?: boolean }

export function DetailRow({ label, value, accent, last }: DetailRowProps) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <AppText size={12.5} color={colors.mutedSoft}>
        {label}
      </AppText>
      <AppText weight="semibold" size={12.5} color={accent ? colors.accentText : colors.text}>
        {value}
      </AppText>
    </View>
  )
}
