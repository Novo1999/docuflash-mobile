import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { Pressable } from 'react-native'

type SettingRowProps = {
  icon: IconName
  label: string
  value?: string
  right?: ReactNode
  onPress?: () => void
  last?: boolean
}

export function SettingRow({ icon, label, value, right, onPress, last }: SettingRowProps) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Icon name={icon} size={18} color={colors.muted} strokeWidth={1.6} />
      <AppText weight="medium" size={13.5} style={{ flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText weight="semibold" size={12.5} color={colors.mutedSoft}>
          {value}
        </AppText>
      ) : null}
      {right}
      {onPress || value ? right ? null : <Icon name="chevron-right" size={16} color={colors.mutedSoft} strokeWidth={2} /> : null}
    </Pressable>
  )
}
