import { Icon } from '@/components/Icon'
import { AppText, Button, Field, Pill } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { getFileByShareToken, getFileDownloadUrl, getFilePreview, verifyFilePassword } from '@/lib/api/files'
import { openFileInApp, openTextInApp, saveFileToDevice, shareFile, shareText } from '@/lib/files'
import { formatExpiry, formatFileSize } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType, FileType, type FileRecord } from '@/types/file'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'

const TYPE_LABEL: Record<FileType, string> = {
  pdf: 'PDF Document',
  docx: 'Word Document',
  xls: 'Spreadsheet',
  zip: 'Archive',
  txt: 'Text File',
  other: 'File',
}

export default function SharedFileScreen() {
  const { colors, radii } = useTheme()
  const { shareToken } = useLocalSearchParams<{ shareToken: string }>()

  const [file, setFile] = useState<FileRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [accessToken, setAccessToken] = useState<string | undefined>()
  const [password, setPassword] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!shareToken) return
    ;(async () => {
      try {
        const res = await getFileByShareToken(shareToken)
        if (!res.success || !res.data) {
          setNotFound(true)
        } else {
          setFile(res.data)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [shareToken])

  const isProtected = file?.accessType === FileAccessType.PROTECTED
  const locked = isProtected && !accessToken

  const unlock = useCallback(async () => {
    if (!shareToken || !password) return
    setUnlocking(true)
    setError(null)
    try {
      const { accessToken: token } = await verifyFilePassword(shareToken, password)
      setAccessToken(token)
    } catch {
      setError('Incorrect password. Please try again.')
    } finally {
      setUnlocking(false)
    }
  }, [shareToken, password])

  const onPreview = async () => {
    if (!shareToken || !file) return
    setBusy(true)
    try {
      const preview = await getFilePreview(shareToken, accessToken)
      if (preview.kind === 'text') {
        await openTextInApp(preview.text, file.fileName)
      } else {
        await openFileInApp(preview.url, file.fileName, file.fileType)
      }
    } catch (e) {
      Alert.alert('Preview unavailable', e instanceof Error ? e.message : 'Try downloading instead.')
    } finally {
      setBusy(false)
    }
  }

  const onShare = async () => {
    if (!shareToken || !file) return
    setBusy(true)
    try {
      const preview = await getFilePreview(shareToken, accessToken)
      if (preview.kind === 'text') {
        await shareText(preview.text, file.fileName)
      } else {
        await shareFile(preview.url, file.fileName, file.fileType)
      }
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const onDownload = async () => {
    if (!shareToken || !file) return
    setBusy(true)
    try {
      const { fileUrl } = await getFileDownloadUrl(shareToken, accessToken)
      const result = await saveFileToDevice(fileUrl, file.fileName, file.fileType)
      if (result.method === 'saved') {
        Alert.alert('Saved', 'The file was saved to the folder you selected.')
      }
    } catch (e) {
      Alert.alert('Download failed', e instanceof Error ? e.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <Screen contentStyle={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </Screen>
    )
  }

  if (notFound || !file) {
    return (
      <Screen contentStyle={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <Icon name="lock" size={32} color={colors.mutedSoft} strokeWidth={1.5} />
        <AppText variant="heading" size={22} color={colors.heading}>
          Link unavailable
        </AppText>
        <AppText size={13} color={colors.muted} style={{ textAlign: 'center' }}>
          This file may have expired or been deleted.
        </AppText>
      </Screen>
    )
  }

  return (
    <Screen scroll contentStyle={{ alignItems: 'center', paddingHorizontal: 26 }}>
      <AppText variant="heading" size={16} color={colors.heading} style={{ marginTop: 8 }}>
        Docuflash
      </AppText>
      <Pill label="Someone shared a file with you" tone="accent" icon={<Icon name="lock" size={12} color={colors.accentText} strokeWidth={2} />} style={{ marginTop: 14, marginBottom: 26 }} />

      <View
        style={{
          width: 128,
          height: 158,
          borderRadius: 16,
          backgroundColor: colors.surface,
          paddingHorizontal: 18,
          paddingTop: 20,
          gap: 9,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {[44, 88, 80, 90, 62].map((w, i) => (
          <View
            key={i}
            style={{
              width: `${w}%`,
              height: i === 0 ? 6 : 5,
              borderRadius: 3,
              backgroundColor: i === 0 ? colors.borderStrong : colors.border,
            }}
          />
        ))}
        <View
          style={{
            position: 'absolute',
            bottom: -12,
            alignSelf: 'center',
            backgroundColor: colors.accent,
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderRadius: 9,
          }}
        >
          <AppText weight="bold" size={11} color={colors.screen}>
            {(TYPE_LABEL[file.fileType] ? file.fileType : 'other').toUpperCase()}
          </AppText>
        </View>
      </View>

      <AppText variant="heading" size={23} color={colors.heading} style={{ marginTop: 30, textAlign: 'center' }}>
        {file.fileName}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 }}>
        <Pill label={TYPE_LABEL[file.fileType] ?? 'File'} />
        <Pill label={formatFileSize(file.fileSize)} />
        {isProtected ? <Pill label="Encrypted" tone="accent" icon={<Icon name="lock" size={10} color={colors.accentText} strokeWidth={2.2} />} /> : null}
      </View>

      {locked ? (
        <View style={{ width: '100%', marginTop: 24, gap: 12 }}>
          <Field icon="lock" secure placeholder="Enter password to unlock" value={password} onChangeText={setPassword} />
          {error ? (
            <AppText size={12.5} color={colors.danger}>
              {error}
            </AppText>
          ) : null}
          <Button title="Unlock file" icon="lock" onPress={unlock} loading={unlocking} />
        </View>
      ) : (
        <View style={{ width: '100%', gap: 10, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title="Preview" variant="outline" icon="eye" onPress={onPreview} loading={busy} style={{ flex: 1 }} />
            <Button title="Download" icon="download" onPress={onDownload} loading={busy} style={{ flex: 1 }} />
          </View>
          <Button title="Share" variant="outline" icon="share" onPress={onShare} loading={busy} />
        </View>
      )}

      <View
        style={{
          width: '100%',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg + 2,
          paddingHorizontal: 18,
          paddingVertical: 6,
          marginTop: 18,
        }}
      >
        <AppText variant="heading" size={14} color={colors.heading} style={{ paddingTop: 14, paddingBottom: 10 }}>
          File details
        </AppText>
        <DetailRow label="Uploaded" value={formatDate(file.uploadDate)} />
        <DetailRow label="Expires in" value={formatExpiry(file.expireAt)} accent />
        <DetailRow label="Downloads" value={String(file.downloadCount)} />
        <DetailRow label="Size" value={formatFileSize(file.fileSize)} last />
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

function DetailRow({ label, value, accent, last }: { label: string; value: string; accent?: boolean; last?: boolean }) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <AppText size={12.5} color={colors.mutedSoft}>
        {label}
      </AppText>
      <AppText weight="semibold" size={12.5} color={accent ? colors.accentText : colors.text}>
        {value}
      </AppText>
    </View>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}
