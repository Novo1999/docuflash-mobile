import { IncomingTransferPrompt, NearbyController, NearbyToast } from '@/components/nearby'
import { UpdateBanner } from '@/components/updates'
import { UploadProgressBar } from '@/components/ui/UploadProgressBar'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

export function RootNavigator() {
  const { colors, mode } = useTheme()
  const { status } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    const root = segments[0] as string
    const inAuth = root === 'auth' || root === 'forgot-password'
    const inReset = root === 'reset-password'
    const inPublic = root === 'share' || root === 'folder' || root === 'request'

    if (status === 'unauthenticated' && !inAuth && !inReset && !inPublic) {
      router.replace('/auth')
    } else if (status === 'authenticated' && inAuth) {
      router.replace('/(tabs)')
    }
  }, [status, segments, router])

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="success" options={{ presentation: 'modal' }} />
        <Stack.Screen name="share/[shareToken]" />
        <Stack.Screen name="folder/[shareToken]" />
        <Stack.Screen name="request/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="request/[shareToken]" />
      </Stack>
      <UploadProgressBar />
      <UpdateBanner />
      <NearbyController />
      <NearbyToast />
      <IncomingTransferPrompt />
    </>
  )
}
