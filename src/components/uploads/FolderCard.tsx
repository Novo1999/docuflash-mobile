import { Icon } from '@/components/Icon'
import { AppText, Card, FileTypeBadge, IconButton } from '@/components/ui'
import { getFolderByShareToken } from '@/lib/api/folder'
import { formatExpiry, formatFileSize } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType, type FileRecord } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

type FolderCardProps = {
  folder: MyFolderRecord
  onCopy: () => void
  onDelete: () => void
}

export function FolderCard({ folder, onCopy, onDelete }: FolderCardProps) {
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
            borderCurve: 'continuous',
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
