import type { MyFileRecord } from '@/types/file'
import { useCallback, useRef, useState } from 'react'
import type { View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

export type FolderFrame = { id: string; x: number; y: number; width: number; height: number }

export type FileDragController = ReturnType<typeof useFileDrag>

export function useFileDrag(onDrop: (file: MyFileRecord, folderId: string) => void) {
  const [draggingFile, setDraggingFile] = useState<MyFileRecord | null>(null)
  const dragX = useSharedValue(0)
  const dragY = useSharedValue(0)
  const hoveredFolderId = useSharedValue<string | null>(null)
  const folderFrames = useSharedValue<FolderFrame[]>([])
  const folderRefs = useRef(new Map<string, View>())

  const registerFolder = useCallback((id: string, ref: View | null) => {
    if (ref) folderRefs.current.set(id, ref)
    else folderRefs.current.delete(id)
  }, [])

  const beginDrag = useCallback(
    (file: MyFileRecord) => {
      const entries = [...folderRefs.current.entries()]
      const frames: FolderFrame[] = []
      let pending = entries.length
      if (pending === 0) folderFrames.set([])
      for (const [id, view] of entries) {
        view.measureInWindow((x, y, width, height) => {
          frames.push({ id, x, y, width, height })
          pending -= 1
          if (pending === 0) folderFrames.set(frames)
        })
      }
      setDraggingFile(file)
    },
    [folderFrames],
  )

  const endDrag = useCallback(
    (file: MyFileRecord, folderId: string | null) => {
      setDraggingFile(null)
      folderFrames.set([])
      if (folderId) onDrop(file, folderId)
    },
    [folderFrames, onDrop],
  )

  return { draggingFile, dragX, dragY, hoveredFolderId, folderFrames, registerFolder, beginDrag, endDrag }
}
