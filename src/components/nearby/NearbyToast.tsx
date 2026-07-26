import { Icon } from '@/components/Icon'
import { AppText } from '@/components/ui'
import { nearbyToastAtom } from '@/state/nearbyAtoms'
import { useTheme } from '@/theme/ThemeProvider'
import { useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function NearbyToast() {
  const { colors, radii } = useTheme()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [toast, setToast] = useAtom(nearbyToastAtom)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast, setToast])

  if (!toast) return null

  const onPress = () => {
    setToast(null)
    router.push('/nearby')
  }

  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={{ position: 'absolute', top: insets.top + 8, left: 12, right: 12, zIndex: 200 }}
    >
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 13,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.accent,
          backgroundColor: colors.surface,
          boxShadow: '0 6px 18px rgba(15,28,46,0.12)',
        }}
      >
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="wifi" size={20} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={13.5} color={colors.heading}>
            {toast.message}
          </AppText>
          <AppText size={11.5} color={colors.muted} style={{ marginTop: 1 }}>
            {toast.count} {toast.count === 1 ? 'person' : 'people'} nearby · tap to view
          </AppText>
        </View>
        <Icon name="chevron-right" size={18} color={colors.mutedSoft} />
      </Pressable>
    </Animated.View>
  )
}
