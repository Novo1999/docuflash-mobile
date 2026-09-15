import { Icon, type IconName } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { Pressable, type ViewStyle } from 'react-native'

type DangerActionButtonProps = {
  icon: IconName
  label: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
}

export function DangerActionButton({ icon, label, onPress, disabled, style }: DangerActionButtonProps) {
  const { colors, radii } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: colors.dangerBorder,
        borderRadius: radii.md + 1,
        paddingVertical: 14,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        ...style,
      })}
    >
      <Icon name={icon} size={16} color={colors.danger} strokeWidth={1.7} />
      <AppText weight="semibold" size={14} color={colors.danger}>
        {label}
      </AppText>
    </Pressable>
  )
}
