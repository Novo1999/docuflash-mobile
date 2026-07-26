import { Icon } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'

export function NearbyEmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  const { colors } = useTheme()
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 40, paddingHorizontal: 20 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="wifi" size={28} color={colors.accent} />
      </View>
      <AppText variant="heading" size={18} color={colors.heading} style={{ textAlign: 'center', marginTop: 4 }}>
        {title}
      </AppText>
      <AppText size={12.5} color={colors.muted} style={{ textAlign: 'center', lineHeight: 18 }}>
        {subtitle}
      </AppText>
    </View>
  )
}
