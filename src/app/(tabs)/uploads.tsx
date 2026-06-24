import { Icon } from '@/components/Icon'
import { AppText, Card, ConfirmModal, FileTypeBadge, IconButton, Pill } from '@/components/ui'
import { deleteFileByShareToken, getMyFiles } from '@/lib/api/files'
import { deleteFolderByShareToken, getFolderByShareToken, getMyFolders } from '@/lib/api/folder'
import { formatExpiry, formatFileSize, getFolderShareLink, getShareLink, shortExpiryBadge } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import type { FileRecord, MyFileRecord } from '@/types/file'
import { FileAccessType } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'
import * as Clipboard from 'expo-clipboard'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native'
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
  useEffect(() => {
    const timer = setTimeout(() => load(query), 300)
    return () => clearTimeout(timer)
  }, [query, load])

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24 }}
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
      >
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

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : folders.length === 0 && standalone.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onCopy={() => copy(getFolderShareLink(folder.shareToken))}
                onDelete={() => confirmDeleteFolder(folder.shareToken)}
              />
            ))}
            {standalone.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onCopy={() => copy(getShareLink(file.shareToken))}
                onOpen={() => router.push(`/share/${file.shareToken}`)}
                onDelete={() => confirmDeleteFile(file.shareToken)}
              />
            ))}
          </>
        )}
      </ScrollView>

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

function EmptyState() {
  const { colors } = useTheme()
  return (
    <View style={{ alignItems: 'center', marginTop: 56, gap: 10 }}>
      <Icon name="folder" size={34} color={colors.mutedSoft} strokeWidth={1.4} />
      <AppText weight="semibold" size={15} color={colors.text}>
        Nothing here yet
      </AppText>
      <AppText size={12.5} color={colors.mutedSoft} style={{ textAlign: 'center' }}>
        Files you share will appear here.
      </AppText>
    </View>
  )
}

function FolderCard({
  folder,
  onCopy,
  onDelete,
}: {
  folder: MyFolderRecord
  onCopy: () => void
  onDelete: () => void
}) {
  const { colors } = useTheme()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [children, setChildren] = useState<FileRecord[] | null>(null)
  const [loadingChildren, setLoadingChildren] = useState(false)

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && children === null) {
      setLoadingChildren(true)
      try {
        const detail = await getFolderByShareToken(folder.shareToken)
        setChildren(detail.files)
      } catch {
        setChildren([])
      } finally {
        setLoadingChildren(false)
      }
    }
  }

  return (
    <Card style={{ marginBottom: 11 }}>
      <Pressable onPress={toggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
        <Icon name={open ? 'chevron-down' : 'chevron-right'} size={18} color={colors.text} strokeWidth={2} />
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: colors.accentSoftBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="folder" size={20} color={colors.accent} strokeWidth={1.7} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={14} numberOfLines={1}>
            {folder.folderName}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            {folder.accessType === FileAccessType.PROTECTED ? (
              <Icon name="lock" size={11} color={colors.accent} strokeWidth={2} />
            ) : null}
            <AppText size={11.5} color={colors.mutedSoft}>
              {formatExpiry(folder.expireAt)}
            </AppText>
          </View>
        </View>
        <IconButton name="external" onPress={() => router.push(`/folder/${folder.shareToken}`)} />
        <IconButton name="copy" onPress={onCopy} style={{ marginLeft: 6 }} />
        <IconButton name="trash" tone="danger" onPress={onDelete} style={{ marginLeft: 6 }} />
      </Pressable>

      {open ? (
        <View style={{ marginTop: 12, marginLeft: 9, paddingLeft: 16, borderLeftWidth: 1.5, borderLeftColor: colors.border, gap: 9 }}>
          {loadingChildren ? (
            <ActivityIndicator color={colors.accent} />
          ) : children && children.length > 0 ? (
            children.map((file) => (
              <Pressable
                key={file.id}
                onPress={() => router.push(`/share/${file.shareToken}`)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}
              >
                <FileTypeBadge type={file.fileType} size={32} radius={9} />
                <View style={{ flex: 1 }}>
                  <AppText weight="medium" size={12.5} numberOfLines={1}>
                    {file.fileName}
                  </AppText>
                  <AppText size={10.5} color={colors.mutedSoft}>
                    {formatFileSize(file.fileSize)} · {file.downloadCount} downloads
                  </AppText>
                </View>
                <Icon name="chevron-right" size={16} color={colors.mutedSoft} strokeWidth={2} />
              </Pressable>
            ))
          ) : (
            <AppText size={11.5} color={colors.mutedSoft}>
              No files in this folder.
            </AppText>
          )}
        </View>
      ) : null}
    </Card>
  )
}

function FileCard({
  file,
  onCopy,
  onOpen,
  onDelete,
}: {
  file: MyFileRecord
  onCopy: () => void
  onOpen: () => void
  onDelete: () => void
}) {
  const { colors } = useTheme()
  const access = file.accessType === FileAccessType.PROTECTED ? 'Protected' : 'Public'
  const expired = formatExpiry(file.expireAt) === 'Expired'

  return (
    <Card style={{ marginBottom: 11 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <FileTypeBadge type={file.fileType} size={40} radius={12} />
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={13.5} numberOfLines={1}>
            {file.fileName}
          </AppText>
          <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 2 }}>
            {formatFileSize(file.fileSize)} · {access} · {file.downloadCount} downloads
          </AppText>
        </View>
        <Pill label={shortExpiryBadge(file.expireAt)} tone={expired ? 'danger' : 'accent'} />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <ActionButton name="copy" onPress={onCopy} />
        <ActionButton name="external" onPress={onOpen} />
        <ActionButton name="trash" tone="danger" onPress={onDelete} />
      </View>
    </Card>
  )
}

function ActionButton({
  name,
  onPress,
  tone = 'bordered',
}: {
  name: Parameters<typeof IconButton>[0]['name']
  onPress: () => void
  tone?: 'bordered' | 'danger'
}) {
  return <IconButton name={name} onPress={onPress} tone={tone} size={34} style={{ flex: 1 }} />
}
