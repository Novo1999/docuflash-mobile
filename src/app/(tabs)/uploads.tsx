import { Icon } from '@/components/Icon'
import { AppText, ConfirmModal } from '@/components/ui'
import { DragGhost, DraggableFileCard, DroppableFolderCard, EmptyState, FileCard, FolderCard } from '@/components/uploads'
import { useDebouncedEffect } from '@/hooks/useDebouncedEffect'
import { useFileDrag } from '@/hooks/useFileDrag'
import { deleteFileByShareToken, getMyFiles } from '@/lib/api/files'
import { deleteFolderByShareToken, getMyFolders, moveFileToFolder } from '@/lib/api/folder'
import { getFolderShareLink, getShareLink } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import type { MyFileRecord } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'
import * as Clipboard from 'expo-clipboard'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function UploadsScreen() {
  const { colors, radii, fonts } = useTheme()
  const router = useRouter()
  const [files, setFiles] = useState<MyFileRecord[]>([])
  const [folders, setFolders] = useState<MyFolderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')
  const [pendingDelete, setPendingDelete] = useState<{ type: 'file' | 'folder'; token: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [foldersVersion, setFoldersVersion] = useState(0)

  const load = useCallback(async (search?: string) => {
    try {
      const [f, d] = await Promise.all([getMyFiles(search), getMyFolders(search)])
      setFiles(f)
      setFolders(d)
    } catch {
      // surface nothing destructive; list simply stays empty
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Debounced server-side search; also handles the initial load (empty query).
  useDebouncedEffect(() => load(query), [query, load], 300)

  // Refresh when returning to the screen (e.g. after an upload/delete elsewhere).
  // The first focus is skipped — the debounced effect above already loads on mount.
  const isFirstFocus = useRef(true)
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false
        return
      }
      load(query)
    }, [load, query]),
  )

  const standalone = useMemo(() => files.filter((f) => (f.folders?.length ?? 0) === 0), [files])
  const rows = useMemo<(MyFolderRecord | MyFileRecord)[]>(() => [...folders, ...standalone], [folders, standalone])

  const moveFile = useCallback(
    async (file: MyFileRecord, folderId: string) => {
      const folder = folders.find((f) => f.id === folderId)
      if (!folder || file.folders.some((ref) => ref.id === folderId)) return

      setFiles((current) =>
        current.map((item) => (item.id === file.id ? { ...item, folders: [{ id: folder.id, folderName: folder.folderName }] } : item)),
      )
      try {
        await moveFileToFolder(folderId, file.id)
        setFoldersVersion((version) => version + 1)
      } catch {
        Alert.alert('Move failed', 'Something went wrong. Please try again.')
      } finally {
        load(query)
      }
    },
    [folders, load, query],
  )

  const drag = useFileDrag(moveFile)

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text)
    Alert.alert('Copied', 'Share link copied to clipboard.')
  }

  const confirmDeleteFile = (token: string) => setPendingDelete({ type: 'file', token })
  const confirmDeleteFolder = (token: string) => setPendingDelete({ type: 'folder', token })

  const runDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      if (pendingDelete.type === 'file') {
        await deleteFileByShareToken(pendingDelete.token)
      } else {
        await deleteFolderByShareToken(pendingDelete.token)
      }
      setPendingDelete(null)
      load()
    } catch {
      Alert.alert('Delete failed', 'Something went wrong. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const listHeader = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 6 }}>
        <AppText variant="heading" size={28} color={colors.heading}>
          My uploads
        </AppText>
        <Pressable
          onPress={() => router.push('/(tabs)')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="plus" size={18} color={colors.primaryText} strokeWidth={1.8} />
        </Pressable>
      </View>
      <AppText size={12.5} color={colors.mutedSoft} style={{ marginTop: 4, marginBottom: 14 }}>
        {standalone.length} active link{standalone.length === 1 ? '' : 's'} · {folders.length} folder
        {folders.length === 1 ? '' : 's'}
      </AppText>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 9,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.md,
          borderCurve: 'continuous',
          paddingHorizontal: 14,
          paddingVertical: 10,
          marginBottom: 14,
        }}
      >
        <Icon name="search" size={16} color={colors.mutedSoft} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search files & folders"
          placeholderTextColor={colors.mutedSoft}
          style={{ flex: 1, fontFamily: fonts.body, fontSize: 13, color: colors.text, padding: 0 }}
        />
      </View>
    </>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(item) => ('folderName' in item ? `folder-${item.id}-${foldersVersion}` : 'file-' + item.id)}
        scrollEnabled={drag.draggingFile === null}
        renderItem={({ item }) =>
          'folderName' in item ? (
            <DroppableFolderCard folderId={item.id} hoveredFolderId={drag.hoveredFolderId} registerFolder={drag.registerFolder}>
              <FolderCard
                folder={item}
                onCopy={() => copy(getFolderShareLink(item.shareToken))}
                onDelete={() => confirmDeleteFolder(item.shareToken)}
              />
            </DroppableFolderCard>
          ) : (
            <DraggableFileCard
              dragX={drag.dragX}
              dragY={drag.dragY}
              hoveredFolderId={drag.hoveredFolderId}
              folderFrames={drag.folderFrames}
              onBegin={() => drag.beginDrag(item)}
              onEnd={(folderId) => drag.endDrag(item, folderId)}
            >
              <FileCard
                file={item}
                onCopy={() => copy(getShareLink(item.shareToken))}
                onOpen={() => router.push(`/share/${item.shareToken}`)}
                onDelete={() => confirmDeleteFile(item.shareToken)}
              />
            </DraggableFileCard>
          )
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : <EmptyState />
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load(query)
            }}
            tintColor={colors.accent}
          />
        }
      />

      {drag.draggingFile ? <DragGhost file={drag.draggingFile} dragX={drag.dragX} dragY={drag.dragY} /> : null}

      <ConfirmModal
        visible={pendingDelete !== null}
        icon="trash"
        tone="danger"
        title={pendingDelete?.type === 'folder' ? 'Delete folder' : 'Delete file'}
        message={
          pendingDelete?.type === 'folder'
            ? 'This permanently removes the folder and its files.'
            : 'This permanently removes the file and its link.'
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={runDelete}
        onClose={() => setPendingDelete(null)}
      />
    </SafeAreaView>
  )
}
