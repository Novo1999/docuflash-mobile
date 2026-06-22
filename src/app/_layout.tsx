import { UploadProgressBar } from '@/components/ui/UploadProgressBar'
import { configureGoogleSignin } from '@/lib/googleSignin'
import { AuthProvider, useAuth } from '@/state/AuthProvider'
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
  SourceSerif4_700Bold,
} from '@expo-google-fonts/source-serif-4'
import { useFonts } from 'expo-font'
import { Stack, useRouter, useSegments } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { SafeAreaProvider } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync()
configureGoogleSignin()

function RootNavigator() {
  const { colors, mode } = useTheme()
  const { status } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    const root = segments[0] as string
    const inAuth = root === 'auth'
    const inPublic = root === 'share' || root === 'folder' || root === 'request'
    if (status === 'unauthenticated' && !inAuth && !inPublic) {
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
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="success" options={{ presentation: 'modal' }} />
        <Stack.Screen name="share/[shareToken]" />
        <Stack.Screen name="folder/[shareToken]" />
        <Stack.Screen name="request/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="request/[shareToken]" />
      </Stack>
      <UploadProgressBar />
    </>
  )
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
    SourceSerif4_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: '#f5f0e8' }} />

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  )
}
