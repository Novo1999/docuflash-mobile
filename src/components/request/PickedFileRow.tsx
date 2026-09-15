import { AppText, Card, FileTypeBadge, IconButton, ProgressBar } from '@/components/ui'
import { formatFileSize, resolveFileType, type PickedFile } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import { FileType } from '@/types/file'
import { View } from 'react-native'

/**
 * A file the sender has queued. Idle it offers a remove button; once the upload
 * starts the button is swapped for that file's own progress bar, so it stays
 * obvious which of several files is currently moving.
 */
export function PickedFileRow({
  file,
  uploading,
  progress,
  onRemove,
}: {
  file: PickedFile
  uploading: boolean
  progress: number
  onRemove: () => void
}) {
  const { colors } = useTheme()
  const type = resolveFileType(file) ?? FileType.OTHER
  const done = progress >= 100

  return (
    <Card padding={11} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <FileTypeBadge type={type} size={38} radius={11} />
      <View style={{ flex: 1 }}>
        <AppText weight="semibold" size={13} numberOfLines={1}>
          {file.name}
        </AppText>
        {uploading ? (
          <>
            <ProgressBar progress={progress} style={{ marginTop: 7 }} />
            <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 5 }}>
              {done ? 'Finishing up…' : `${Math.round(progress)}% of ${formatFileSize(file.size)}`}
            </AppText>
          </>
        ) : (
          <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 2 }}>
            {formatFileSize(file.size)}
          </AppText>
        )}
      </View>
      {uploading ? null : <IconButton name="close" tone="plain" color={colors.mutedSoft} onPress={onRemove} />}
    </Card>
  )
}
