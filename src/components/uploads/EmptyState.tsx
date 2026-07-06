import { Icon } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'

export function EmptyState() {
  const { colors } = useTheme()
  return (
    <View style={{ alignItems: 'center', marginTop: 56, gap: 10 }}>
      <Icon name="folder" size={34} color={colors.mutedSoft} strokeWidth={1.4} />
      <AppText weight="semibold" size={15} color={colors.text}>
        Nothing here yet
      </AppText>
      <AppText size={12.5} color={colors.mutedSoft} style={{ textAlign: 'center' }}>
        Files you share will appear here.
      </AppText>
    </View>
  )
}
