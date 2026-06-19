import { Icon } from '@/components/Icon'
import { AppText, Card, FileTypeBadge, IconButton, Pill } from '@/components/ui'
import { deleteFileByShareToken, getMyFiles } from '@/lib/api/files'
import { deleteFolderByShareToken, getFolderByShareToken, getMyFolders } from '@/lib/api/folder'
import { formatExpiry, formatFileSize, getFolderShareLink, getShareLink, shortExpiryBadge } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import type { FileRecord, MyFileRecord } from '@/types/file'
import { FileAccessType } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'
import * as Clipboard from 'expo-clipboard'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, RefreshControl, ScrollView, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function UploadsScreen() {
  const { colors, radii, fonts } = useTheme()
  const router = useRouter()
  const [files, setFiles] = useState<MyFileRecord[]>([])
  const [folders, setFolders] = useState<MyFolderRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    try {
      const [f, d] = await Promise.all([getMyFiles(), getMyFolders()])
      setFiles(f)
      setFolders(d)
    } catch {
      // surface nothing destructive; list simply stays empty
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const standalone = useMemo(() => files.filter((f) => (f.folders?.length ?? 0) === 0), [files])
  const lower = query.trim().toLowerCase()
  const filteredFolders = folders.filter((f) => f.folderName.toLowerCase().includes(lower))
  const filteredFiles = standalone.filter((f) => f.fileName.toLowerCase().includes(lower))

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text)
    Alert.alert('Copied', 'Share link copied to clipboard.')
  }

  const confirmDeleteFile = (token: string) =>
    Alert.alert('Delete file', 'This permanently removes the file and its link.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFileByShareToken(token)
          load()
        },
      },
    ])

  const confirmDeleteFolder = (token: string) =>
    Alert.alert('Delete folder', 'This permanently removes the folder and its files.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFolderByShareToken(token)
          load()
        },
      },
    ])

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
              load()
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
        ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onCopy={() => copy(getFolderShareLink(folder.shareToken))}
                onDelete={() => confirmDeleteFolder(folder.shareToken)}
              />
            ))}
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onCopy={() => copy(getShareLink(file.shareToken))}
                onOpen={() => Linking.openURL(getShareLink(file.shareToken))}
                onDelete={() => confirmDeleteFile(file.shareToken)}
              />
            ))}
          </>
        )}
      </ScrollView>
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
        <IconButton name="copy" onPress={onCopy} />
        <IconButton name="trash" tone="danger" onPress={onDelete} style={{ marginLeft: 6 }} />
      </Pressable>

      {open ? (
        <View style={{ marginTop: 12, marginLeft: 9, paddingLeft: 16, borderLeftWidth: 1.5, borderLeftColor: colors.border, gap: 9 }}>
          {loadingChildren ? (
            <ActivityIndicator color={colors.accent} />
          ) : children && children.length > 0 ? (
            children.map((file) => (
              <View key={file.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
                <FileTypeBadge type={file.fileType} size={32} radius={9} />
                <View style={{ flex: 1 }}>
                  <AppText weight="medium" size={12.5} numberOfLines={1}>
                    {file.fileName}
                  </AppText>
                  <AppText size={10.5} color={colors.mutedSoft}>
                    {formatFileSize(file.fileSize)} · {file.downloadCount} downloads
                  </AppText>
                </View>
              </View>
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
