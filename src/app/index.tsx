import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

export default function Index() {
  const { status } = useAuth()
  const { colors } = useTheme()

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.screen }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return <Redirect href={status === 'authenticated' ? '/(tabs)' : '/auth'} />
}
