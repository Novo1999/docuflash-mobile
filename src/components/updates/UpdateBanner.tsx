import { Icon } from '@/components/Icon'
import { AppText, Button, Card, IconButton } from '@/components/ui'
import { useAppUpdates } from '@/hooks/useAppUpdates'
import { useTheme } from '@/theme/ThemeProvider'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Prompts to apply an already-downloaded OTA update without waiting for a cold start.
 * Mounted once at the navigator root so it survives tab and stack changes.
 */
export function UpdateBanner() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const { isUpdateReady, restarting, restart, dismiss } = useAppUpdates()

  if (!isUpdateReady) return null

  return (
    <Card
      padding={12}
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: insets.bottom + 14,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
      }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="download" size={17} color={colors.accent} strokeWidth={1.8} />
      </View>

      <View style={{ flex: 1 }}>
        <AppText weight="semibold" size={13} color={colors.text}>
          Update ready
        </AppText>
        <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 2 }}>
          Restart to get the latest version.
        </AppText>
      </View>

      <Button title="Restart" onPress={restart} loading={restarting} size={12.5} style={{ paddingVertical: 9, paddingHorizontal: 14 }} />
      <IconButton name="close" tone="plain" color={colors.mutedSoft} size={28} onPress={dismiss} disabled={restarting} />
    </Card>
  )
}
