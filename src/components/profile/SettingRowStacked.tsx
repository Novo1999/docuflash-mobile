import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { View } from 'react-native'

type SettingRowStackedProps = {
  icon: IconName
  label: string
  children: ReactNode
  last?: boolean
}

export function SettingRowStacked({ icon, label, children, last }: SettingRowStackedProps) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <Icon name={icon} size={18} color={colors.muted} strokeWidth={1.6} />
        <AppText weight="medium" size={13.5}>
          {label}
        </AppText>
      </View>
      {children}
    </View>
  )
}
