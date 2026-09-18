import { Icon } from '@/components/Icon'
import { AppText, FileTypeBadge, IconButton } from '@/components/ui'
import { formatFileSize } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import type { CollectedFileRecord } from '@/types/folder'
import { ActivityIndicator, Pressable, View } from 'react-native'

export function CollectedFileRow({
  file,
  deleting,
  onOpen,
  onDelete,
  onBlock,
}: {
  file: CollectedFileRecord
  deleting: boolean
  onOpen: () => void
  onDelete: () => void
  onBlock?: () => void
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
      {onBlock && !deleting ? (
        <IconButton
          name="block"
          tone="plain"
          size={30}
          iconSize={16}
          color={colors.mutedSoft}
          onPress={onBlock}
          accessibilityLabel={`Block whoever sent ${file.fileName}`}
        />
      ) : null}
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
