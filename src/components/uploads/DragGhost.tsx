import { AppText, FileTypeBadge } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import type { MyFileRecord } from '@/types/file'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated'

const GHOST_WIDTH = 200

type DragGhostProps = {
  file: MyFileRecord
  dragX: SharedValue<number>
  dragY: SharedValue<number>
}

export function DragGhost({ file, dragX, dragY }: DragGhostProps) {
  const { colors, radii } = useTheme()
  const insets = useSafeAreaInsets()

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value - GHOST_WIDTH / 2 }, { translateY: dragY.value - insets.top - 26 }],
  }))

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: GHOST_WIDTH,
          zIndex: 100,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.accent,
          borderRadius: radii.md,
          borderCurve: 'continuous',
          paddingHorizontal: 11,
          paddingVertical: 8,
          boxShadow: '0 8px 24px rgba(15, 28, 46, 0.18)',
        },
        style,
      ]}
    >
      <FileTypeBadge type={file.fileType} size={28} radius={8} />
      <AppText weight="medium" size={12} numberOfLines={1} style={{ flex: 1 }}>
        {file.fileName}
      </AppText>
    </Animated.View>
  )
}
