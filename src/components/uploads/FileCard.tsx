import { AppText, Card, FileTypeBadge, Pill } from '@/components/ui'
import { formatExpiry, formatFileSize, shortExpiryBadge } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType, type MyFileRecord } from '@/types/file'
import { View } from 'react-native'
import { ActionButton } from './ActionButton'

type FileCardProps = {
  file: MyFileRecord
  onCopy: () => void
  onOpen: () => void
  onDelete: () => void
}

export function FileCard({ file, onCopy, onOpen, onDelete }: FileCardProps) {
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
