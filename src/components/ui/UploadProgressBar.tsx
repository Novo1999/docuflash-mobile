import { isUploadingAtom, uploadProgressAtom } from '@/state/uploadAtoms'
import { useTheme } from '@/theme/ThemeProvider'
import { useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/**
 * Thin upload progress bar pinned just below the status bar. Reads global upload
 * state, so it stays visible (and keeps advancing) regardless of which tab is shown.
 */
export function UploadProgressBar() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const isUploading = useAtomValue(isUploadingAtom)
  const progress = useAtomValue(uploadProgressAtom)

  const width = useSharedValue(0)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (isUploading) {
      opacity.value = withTiming(1, { duration: 150 })
    } else {
      // Fill to 100% on completion, then fade out and reset.
      width.value = withTiming(100, { duration: 200 })
      opacity.value = withTiming(0, { duration: 400 }, (done) => {
        if (done) width.value = 0
      })
    }
  }, [isUploading, opacity, width])

  useEffect(() => {
    if (isUploading) {
      // Keep a visible sliver before real progress arrives.
      width.value = withTiming(Math.max(progress, 6), { duration: 250 })
    }
  }, [progress, isUploading, width])

  const containerStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))
  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }))

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { top: insets.top, backgroundColor: colors.border }, containerStyle]}>
      <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 100,
  },
  fill: {
    height: '100%',
  },
})
