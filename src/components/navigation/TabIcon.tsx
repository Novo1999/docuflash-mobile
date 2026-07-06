import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'

type TabIconProps = { name: IconName; label: string; focused: boolean }

export function TabIcon({ name, label, focused }: TabIconProps) {
  const { colors } = useTheme()
  const color = focused ? colors.text : colors.mutedSoft
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3, width: 76, paddingTop: 8 }}>
      <Icon name={name} size={22} color={color} strokeWidth={focused ? 2 : 1.7} />
      <AppText size={10.5} weight={focused ? 'semibold' : 'medium'} color={color}>
        {label}
      </AppText>
    </View>
  )
}
