import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native'
import { AppText } from './AppText'

type Variant = 'primary' | 'outline' | 'danger'

type ButtonProps = {
  title: string
  onPress?: () => void
  variant?: Variant
  icon?: IconName
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  size?: number
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  size = 15,
}: ButtonProps) {
  const { colors, radii } = useTheme()

  const base: ViewStyle = {
    borderRadius: radii.md + 2,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }

  const variantStyle: ViewStyle =
    variant === 'primary'
      ? { backgroundColor: colors.primaryBg }
      : variant === 'danger'
        ? { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.dangerBorder }
        : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.borderStrong }

  const textColor =
    variant === 'primary' ? colors.primaryText : variant === 'danger' ? colors.danger : colors.text

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [base, variantStyle, { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Icon name={icon} size={17} color={textColor} /> : null}
          <AppText weight="semibold" size={size} color={textColor}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  )
}
