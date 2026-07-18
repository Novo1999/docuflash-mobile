import type { FolderFrame } from '@/hooks/useFileDrag'
import type { ReactNode } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated'

type DraggableFileCardProps = {
  dragX: SharedValue<number>
  dragY: SharedValue<number>
  hoveredFolderId: SharedValue<string | null>
  folderFrames: SharedValue<FolderFrame[]>
  excludeFolderId?: string
  onBegin: () => void
  onEnd: (folderId: string | null) => void
  children: ReactNode
}

export function DraggableFileCard({ dragX, dragY, hoveredFolderId, folderFrames, excludeFolderId, onBegin, onEnd, children }: DraggableFileCardProps) {
  const active = useSharedValue(false)

  const pan = Gesture.Pan()
    .activateAfterLongPress(250)
    .onStart((event) => {
      active.set(true)
      dragX.set(event.absoluteX)
      dragY.set(event.absoluteY)
      runOnJS(onBegin)()
    })
    .onUpdate((event) => {
      dragX.set(event.absoluteX)
      dragY.set(event.absoluteY)
      let hovered: string | null = null
      for (const frame of folderFrames.get()) {
        if (frame.id === excludeFolderId) continue
        if (
          event.absoluteX >= frame.x &&
          event.absoluteX <= frame.x + frame.width &&
          event.absoluteY >= frame.y &&
          event.absoluteY <= frame.y + frame.height
        ) {
          hovered = frame.id
          break
        }
      }
      hoveredFolderId.set(hovered)
    })
    .onFinalize(() => {
      if (!active.get()) return
      active.set(false)
      const dropped = hoveredFolderId.get()
      hoveredFolderId.set(null)
      runOnJS(onEnd)(dropped)
    })

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(active.get() ? 0.45 : 1, { duration: 120 }),
  }))

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>{children}</Animated.View>
    </GestureDetector>
  )
}
