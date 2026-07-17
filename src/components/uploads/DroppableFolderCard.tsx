import type { ReactNode } from 'react'
import { View } from 'react-native'
import Animated, { useAnimatedStyle, withTiming, type SharedValue } from 'react-native-reanimated'

type DroppableFolderCardProps = {
  folderId: string
  hoveredFolderId: SharedValue<string | null>
  registerFolder: (id: string, ref: View | null) => void
  children: ReactNode
}

export function DroppableFolderCard({ folderId, hoveredFolderId, registerFolder, children }: DroppableFolderCardProps) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(hoveredFolderId.value === folderId ? 1.03 : 1, { duration: 120 }) }],
  }))

  return (
    <View ref={(ref) => registerFolder(folderId, ref)} collapsable={false}>
      <Animated.View style={style}>{children}</Animated.View>
    </View>
  )
}
