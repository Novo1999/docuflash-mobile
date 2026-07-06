import { Icon } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { ActivityIndicator, Pressable, View } from 'react-native'

type OAuthButtonProps = {
  label: string
  icon?: boolean
  onPress: () => void
  loading?: boolean
}

export function OAuthButton({ label, icon, onPress, loading }: OAuthButtonProps) {
  const { colors, radii } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        paddingVertical: 13,
        opacity: loading ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : icon ? (
        <Icon name="github" size={17} color={colors.text} />
      ) : (
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1.5,
            borderColor: colors.text,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText variant="heading" size={11} weight="bold" color={colors.text}>
            G
          </AppText>
        </View>
      )}
      <AppText weight="semibold" size={13} color={colors.text}>
        {label}
      </AppText>
    </Pressable>
  )
}
