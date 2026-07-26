import { AppText } from '@/components/ui'
import { persistDiscoverable } from '@/lib/nearby'
import { isDiscoverableAtom } from '@/state/nearbyAtoms'
import { useTheme } from '@/theme/ThemeProvider'
import { useAtom } from 'jotai'
import { Switch, View } from 'react-native'

export function DiscoverableToggle() {
  const { colors, radii } = useTheme()
  const [discoverable, setDiscoverable] = useAtom(isDiscoverableAtom)

  const onToggle = (value: boolean) => {
    setDiscoverable(value)
    void persistDiscoverable(value)
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <View style={{ flex: 1 }}>
        <AppText weight="semibold" size={14} color={colors.heading}>
          Discoverable on WiFi
        </AppText>
        <AppText size={11.5} color={colors.muted} style={{ marginTop: 2, lineHeight: 16 }}>
          Let others on this network see you and send you files.
        </AppText>
      </View>
      <Switch
        value={discoverable}
        onValueChange={onToggle}
        trackColor={{ true: colors.accent, false: colors.borderStrong }}
        thumbColor={colors.surface}
      />
    </View>
  )
}
