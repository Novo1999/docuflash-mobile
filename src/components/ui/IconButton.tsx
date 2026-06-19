import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { Pressable, type ViewStyle } from 'react-native'

export function IconButton({
  name,
  onPress,
  size = 32,
  iconSize = 15,
  color,
  tone = 'bordered',
  strokeWidth = 1.7,
  style,
}: {
  name: IconName
  onPress?: () => void
  size?: number
  iconSize?: number
  color?: string
  tone?: 'bordered' | 'plain' | 'filled' | 'danger'
  strokeWidth?: number
  style?: ViewStyle
}) {
  const { colors, radii } = useTheme()

  const toneStyle: ViewStyle =
    tone === 'filled'
      ? { backgroundColor: colors.primaryBg }
      : tone === 'danger'
        ? { borderWidth: 1, borderColor: colors.dangerBorder }
        : tone === 'bordered'
          ? { borderWidth: 1, borderColor: colors.borderStrong }
          : {}

  const iconColor =
    color ?? (tone === 'filled' ? colors.primaryText : tone === 'danger' ? colors.danger : colors.muted)

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: radii.sm,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        toneStyle,
        style,
      ]}
    >
      <Icon name={name} size={iconSize} color={iconColor} strokeWidth={strokeWidth} />
    </Pressable>
  )
}
