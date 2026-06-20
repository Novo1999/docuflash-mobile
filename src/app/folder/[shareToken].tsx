import { Icon } from '@/components/Icon'
import { AppText, FileTypeBadge, Pill } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { getFolderByShareToken } from '@/lib/api/folder'
import { formatExpiry, formatFileSize } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType } from '@/types/file'
import type { FolderRecord } from '@/types/folder'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

export default function SharedFolderScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const { shareToken } = useLocalSearchParams<{ shareToken: string }>()

  const [folder, setFolder] = useState<FolderRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!shareToken) return
    ;(async () => {
      try {
        const res = await getFolderByShareToken(shareToken)
        setFolder(res)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [shareToken])

  if (loading) {
    return (
      <Screen contentStyle={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    )
  }

  if (notFound || !folder) {
    return (
      <Screen contentStyle={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Icon name="lock" size={32} color={colors.mutedSoft} strokeWidth={1.5} />
        <AppText variant="heading" size={22} color={colors.heading}>
          Link unavailable
        </AppText>
        <AppText size={13} color={colors.muted} style={{ textAlign: 'center' }}>
          This folder may have expired or been deleted.
        </AppText>
      </Screen>
    )
  }

  const isProtected = folder.accessType === FileAccessType.PROTECTED

  return (
    <Screen scroll contentStyle={{ alignItems: 'center', paddingHorizontal: 26 }}>
      <AppText variant="heading" size={16} color={colors.heading} style={{ marginTop: 8 }}>
        Docuflash
      </AppText>
      <Pill
        label="Someone shared a folder with you"
        tone="accent"
        icon={<Icon name="folder" size={12} color={colors.accentText} strokeWidth={2} />}
        style={{ marginTop: 14, marginBottom: 26 }}
      />

      <View
        style={{
          width: 74,
          height: 74,
          borderRadius: 18,
          backgroundColor: colors.accentSoftBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="folder" size={34} color={colors.accent} strokeWidth={1.6} />
      </View>

      <AppText variant="heading" size={23} color={colors.heading} style={{ marginTop: 24, textAlign: 'center' }}>
        {folder.folderName}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 }}>
        <Pill label={`${folder.files.length} file${folder.files.length === 1 ? '' : 's'}`} />
        <Pill label={formatExpiry(folder.expireAt)} />
        {isProtected ? (
          <Pill
            label="Encrypted"
            tone="accent"
            icon={<Icon name="lock" size={10} color={colors.accentText} strokeWidth={2.2} />}
          />
        ) : null}
      </View>

      <View
        style={{
          width: '100%',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg + 2,
          paddingHorizontal: 18,
          paddingVertical: 10,
          marginTop: 24,
          gap: 4,
        }}
      >
        <AppText variant="heading" size={14} color={colors.heading} style={{ paddingTop: 4, paddingBottom: 6 }}>
          Files
        </AppText>
        {folder.files.length > 0 ? (
          folder.files.map((file) => (
            <Pressable
              key={file.id}
              onPress={() => router.push(`/share/${file.shareToken}`)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9 }}
            >
              <FileTypeBadge type={file.fileType} size={38} radius={11} />
              <View style={{ flex: 1 }}>
                <AppText weight="medium" size={13} numberOfLines={1}>
                  {file.fileName}
                </AppText>
                <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 2 }}>
                  {formatFileSize(file.fileSize)} · {file.downloadCount} downloads
                </AppText>
              </View>
              <Icon name="chevron-right" size={18} color={colors.mutedSoft} strokeWidth={2} />
            </Pressable>
          ))
        ) : (
          <AppText size={12.5} color={colors.mutedSoft} style={{ paddingVertical: 9 }}>
            No files in this folder.
          </AppText>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 }}>
        <Icon name="lock" size={12} color={colors.mutedSoft} strokeWidth={1.8} />
        <AppText size={10.5} color={colors.mutedSoft}>
          End-to-end encrypted · Auto-deletes on expiry
        </AppText>
      </View>
    </Screen>
  )
}
