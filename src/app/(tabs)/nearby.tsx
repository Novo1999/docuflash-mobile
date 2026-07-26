import { DiscoverableToggle, NearbyDeviceCard, NearbyEmptyState } from '@/components/nearby'
import { AppText } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { createUploadRequest } from '@/lib/api/folder'
import { sendTransferSignal } from '@/lib/nearby'
import { getClientId, getDeviceInfo } from '@/lib/upload'
import { isDiscoverableAtom, nearbyDevicesAtom } from '@/state/nearbyAtoms'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import type { NearbyDevice } from '@/types/nearby'
import { useRouter } from 'expo-router'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { Alert, View } from 'react-native'

export default function NearbyScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const discoverable = useAtomValue(isDiscoverableAtom)
  const devices = useAtomValue(nearbyDevicesAtom)
  const [requestingId, setRequestingId] = useState<string | null>(null)

  const onRequest = async (device: NearbyDevice) => {
    if (!user || requestingId) return
    setRequestingId(device.id)
    try {
      const clientId = await getClientId()
      const request = await createUploadRequest({
        folderName: `Files for ${user.displayName ?? user.email}`,
        clientId,
      })
      const self: NearbyDevice = {
        id: user.id,
        displayName: user.displayName ?? user.email,
        avatarUrl: user.avatarUrl,
        platform: 'mobile',
        deviceName: String(getDeviceInfo().model ?? 'Mobile device'),
        at: Date.now(),
      }
      sendTransferSignal({ kind: 'request', from: self, to: device.id, token: request.shareToken })
      router.push(`/request/${request.shareToken}`)
    } catch (error) {
      Alert.alert('Request failed', error instanceof Error ? error.message : 'Could not send your request. Please try again.')
    } finally {
      setRequestingId(null)
    }
  }

  return (
    <Screen scroll contentStyle={{ gap: 14, paddingTop: 8 }}>
      <AppText variant="heading" size={26} color={colors.heading} style={{ marginTop: 6 }}>
        Nearby
      </AppText>
      <AppText size={12.5} color={colors.muted} style={{ marginTop: -6, lineHeight: 18 }}>
        People using Docuflash on your WiFi network. Ask them to send you files.
      </AppText>

      <DiscoverableToggle />

      {!discoverable ? (
        <NearbyEmptyState
          title="You're hidden"
          subtitle="Turn on Discoverable on WiFi to find other Docuflash users on your network and request files from them."
        />
      ) : devices.length === 0 ? (
        <NearbyEmptyState
          title="Looking for devices…"
          subtitle="No one else is here yet. Make sure the other person is on the same WiFi and discoverable."
        />
      ) : (
        <View style={{ gap: 10 }}>
          {devices.map((device) => (
            <NearbyDeviceCard
              key={device.id}
              device={device}
              requesting={requestingId === device.id}
              onRequest={() => onRequest(device)}
            />
          ))}
        </View>
      )}
    </Screen>
  )
}
