import { Icon } from '@/components/Icon'
import { AppText, FileTypeBadge, IconButton } from '@/components/ui'
import { formatFileSize } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import type { FileRecord } from '@/types/file'
import { ActivityIndicator, Pressable, View } from 'react-native'

export function CollectedFileRow({
  file,
  deleting,
  onOpen,
  onDelete,
}: {
  file: FileRecord
  deleting: boolean
  onOpen: () => void
  onDelete: () => void
}) {
  const { colors } = useTheme()

  return (
    <Pressable onPress={onOpen} disabled={deleting} style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9, opacity: deleting ? 0.5 : 1 }}>
      <FileTypeBadge type={file.fileType} size={38} radius={11} />
      <View style={{ flex: 1 }}>
        <AppText weight="medium" size={13} numberOfLines={1}>
          {file.fileName}
        </AppText>
        <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 2 }}>
          {formatFileSize(file.fileSize)}
        </AppText>
      </View>
      {deleting ? (
        <View style={{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={colors.danger} />
        </View>
      ) : (
        <IconButton name="trash" tone="plain" size={30} iconSize={16} color={colors.danger} onPress={onDelete} />
      )}
      <Icon name="chevron-right" size={18} color={colors.mutedSoft} strokeWidth={2} />
    </Pressable>
  )
}
