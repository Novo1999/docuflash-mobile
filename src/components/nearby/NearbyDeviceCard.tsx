import { AppText, Button, Card } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import type { NearbyDevice } from '@/types/nearby'
import { Image } from 'expo-image'
import { View } from 'react-native'

export function NearbyDeviceCard({
  device,
  requesting,
  onRequest,
}: {
  device: NearbyDevice
  requesting: boolean
  onRequest: () => void
}) {
  const { colors } = useTheme()
  const initial = device.displayName.trim().charAt(0).toUpperCase() || '?'

  return (
    <Card padding={12} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {device.avatarUrl ? (
        <Image source={{ uri: device.avatarUrl }} style={{ width: 44, height: 44, borderRadius: 22 }} contentFit="cover" />
      ) : (
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
          <AppText weight="semibold" size={17} color={colors.accentText}>
            {initial}
          </AppText>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AppText weight="semibold" size={14} color={colors.heading} numberOfLines={1}>
          {device.displayName}
        </AppText>
        <AppText size={11.5} color={colors.mutedSoft} numberOfLines={1} style={{ marginTop: 2 }}>
          {device.deviceName}
        </AppText>
      </View>
      <Button
        title="Request"
        icon="download"
        onPress={onRequest}
        loading={requesting}
        size={13}
        style={{ paddingVertical: 10, paddingHorizontal: 14 }}
      />
    </Card>
  )
}
