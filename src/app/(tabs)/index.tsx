import { Icon } from '@/components/Icon'
import { AppText, Button, Card, ExpiryDateTimeModal, Field, FileTypeBadge, IconButton, Segmented } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { ACCEPTED_UPLOAD_MIME_TYPES, EXPIRY_PRESETS, MAX_UPLOAD_FILES, MAX_UPLOAD_FILE_SIZE_BYTES } from '@/constants/upload'
import { useUploadSubmit } from '@/hooks/useUploadSubmit'
import { computeExpireAt, formatFileSize, resolveFileType, type PickedFile } from '@/lib/upload'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType, FileType } from '@/types/file'
import * as DocumentPicker from 'expo-document-picker'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, View } from 'react-native'

export default function UploadScreen() {
  const { colors, radii } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const { submit, isUploading } = useUploadSubmit()

  const [files, setFiles] = useState<PickedFile[]>([])
  const [access, setAccess] = useState<FileAccessType>(FileAccessType.PROTECTED)
  const [password, setPassword] = useState('')
  const [expiryKey, setExpiryKey] = useState('7d')
  const [customDate, setCustomDate] = useState<Date | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerInitial, setPickerInitial] = useState(() => new Date())
  const [error, setError] = useState<string | null>(null)

  const isCustom = expiryKey === 'custom'
  const customLabel = customDate ? customDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Custom…'

  // Seed the picker with the current custom date, or the selected preset's expiry.
  const openPicker = () => {
    const hours = EXPIRY_PRESETS.find((p) => p.key === expiryKey)?.hours ?? 24
    setPickerInitial(customDate ?? new Date(Date.now() + hours * 60 * 60 * 1000))
    setPickerOpen(true)
  }

  const onConfirmCustom = (date: Date) => {
    setCustomDate(date)
    setExpiryKey('custom')
    setPickerOpen(false)
  }

  const initial = (user?.displayName || user?.email || 'A').trim().charAt(0).toUpperCase()

  const pickFiles = async () => {
    setError(null)
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: ACCEPTED_UPLOAD_MIME_TYPES,
    })
    if (result.canceled) return
    const picked: PickedFile[] = result.assets
      .map((a) => ({ uri: a.uri, name: a.name, size: a.size ?? 0, mimeType: a.mimeType }))
      .filter((a) => {
        if (!resolveFileType(a)) {
          setError(`"${a.name}" is not a supported file type.`)
          return false
        }
        if (a.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
          setError(`"${a.name}" exceeds the 16 MB limit.`)
          return false
        }
        return true
      })
    setFiles((prev) => [...prev, ...picked].slice(0, MAX_UPLOAD_FILES))
  }

  const removeFile = (uri: string) => setFiles((prev) => prev.filter((f) => f.uri !== uri))

  const onCreate = async () => {
    setError(null)
    if (files.length === 0) {
      setError('Add at least one file to share.')
      return
    }
    if (access === FileAccessType.PROTECTED && password.length < 1) {
      setError('Set a password for protected files.')
      return
    }
    if (isCustom && (!customDate || customDate.getTime() <= Date.now())) {
      setError('Pick a custom expiry time in the future.')
      return
    }
    const preset = EXPIRY_PRESETS.find((p) => p.key === expiryKey)
    const expireAt = isCustom && customDate ? customDate.toISOString() : computeExpireAt(preset?.hours ?? 168)
    const expiryLabel = isCustom && customDate ? customLabel : (preset?.label ?? '7 days')
    try {
      const { links } = await submit({
        files,
        accessType: access,
        password: access === FileAccessType.PROTECTED ? password : undefined,
        expireAt,
      })
      const link = links[0]
      if (!link) throw new Error('No link returned')
      router.push({
        pathname: '/success',
        params: {
          link: link.link,
          fileName: link.fileName,
          kind: link.kind ?? 'file',
          access,
          fileCount: String(files.length),
          expiryLabel,
        },
      })
      setFiles([])
      setPassword('')
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Please try again.')
    }
  }

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <AppText variant="heading" size={21} color={colors.heading}>
          Docuflash
        </AppText>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.primaryBg,
            borderWidth: 2,
            borderColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <AppText weight="semibold" size={13} color={colors.primaryText}>
              {initial}
            </AppText>
          )}
        </View>
      </View>

      <AppText variant="heading" size={32} color={colors.heading} lineHeight={36} style={{ marginTop: 22 }}>
        Share files, privately.
      </AppText>
      <AppText size={13.5} color={colors.muted} lineHeight={20} style={{ marginTop: 6, marginBottom: 18 }}>
        Encrypted links that vanish on your schedule.
      </AppText>

      <View pointerEvents={isUploading ? 'none' : 'auto'} style={{ opacity: isUploading ? 0.5 : 1 }}>
        <Pressable
          onPress={pickFiles}
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.dashBorder,
            backgroundColor: colors.dashBg,
            borderRadius: radii.xl,
            paddingVertical: 24,
            paddingHorizontal: 18,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="upload" size={24} color={colors.accent} strokeWidth={1.6} />
          </View>
          <AppText weight="semibold" size={15} color={colors.text}>
            Drop files or{' '}
            <AppText weight="semibold" size={15} color={colors.accentText}>
              browse
            </AppText>
          </AppText>
          <AppText size={11.5} color={colors.mutedSoft} style={{ textAlign: 'center', lineHeight: 16 }}>
            PDF · DOCX · XLSX · ZIP · TXT{'\n'}Up to 5 files · 16 MB each
          </AppText>
        </Pressable>
      </View>

      {files.length > 0 ? (
        <View style={{ gap: 9, marginTop: 14 }}>
          {files.map((f) => {
            const type = resolveFileType(f) ?? FileType.OTHER
            return (
              <Card key={f.uri} padding={11} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <FileTypeBadge type={type} size={38} radius={11} />
                <View style={{ flex: 1 }}>
                  <AppText weight="semibold" size={13} numberOfLines={1}>
                    {f.name}
                  </AppText>
                  <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 2 }}>
                    {formatFileSize(f.size)}
                  </AppText>
                </View>
                <IconButton
                  name="close"
                  tone="plain"
                  color={colors.mutedSoft}
                  disabled={isUploading}
                  onPress={() => removeFile(f.uri)}
                />
              </Card>
            )
          })}
        </View>
      ) : null}

      <View pointerEvents={isUploading ? 'none' : 'auto'} style={{ opacity: isUploading ? 0.5 : 1 }}>
        <View style={{ marginTop: 16 }}>
          <Segmented
            value={access}
            onChange={setAccess}
            options={[
              { value: FileAccessType.PROTECTED, label: 'Protected', icon: 'lock' },
              { value: FileAccessType.PUBLIC, label: 'Public' },
            ]}
          />
        </View>

        {access === FileAccessType.PROTECTED ? (
          <View style={{ marginTop: 9 }}>
            <Field icon="lock" secure placeholder="Set a password" value={password} onChangeText={setPassword} />
          </View>
        ) : null}

        <AppText size={11.5} color={colors.mutedSoft} style={{ marginTop: 15, marginBottom: 8 }}>
          Auto-delete after
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {EXPIRY_PRESETS.map((preset) => {
            const active = preset.key === expiryKey
            return (
              <Pressable
                key={preset.key}
                onPress={() => setExpiryKey(preset.key)}
                style={{
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 11,
                  borderWidth: active ? 1.5 : 1,
                  borderColor: active ? colors.accent : colors.borderStrong,
                  backgroundColor: active ? colors.accentSoftBg : 'transparent',
                }}
              >
                <AppText weight="semibold" size={12} color={active ? colors.accentText : colors.muted}>
                  {preset.label}
                </AppText>
              </Pressable>
            )
          })}
          <Pressable
            onPress={openPicker}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 11,
              borderWidth: isCustom ? 1.5 : 1,
              borderColor: isCustom ? colors.accent : colors.borderStrong,
              backgroundColor: isCustom ? colors.accentSoftBg : 'transparent',
            }}
          >
            <Icon name="calendar" size={13} color={isCustom ? colors.accentText : colors.muted} strokeWidth={1.7} />
            <AppText weight="semibold" size={12} color={isCustom ? colors.accentText : colors.muted}>
              {customLabel}
            </AppText>
          </Pressable>
        </View>
      </View>

      {error ? (
        <AppText size={12.5} color={colors.danger} style={{ marginTop: 14 }}>
          {error}
        </AppText>
      ) : null}

      <Button title="Create share link" onPress={onCreate} loading={isUploading} style={{ marginTop: 20 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        <Icon name="lock" size={12} color={colors.mutedSoft} strokeWidth={1.8} />
        <AppText size={10.5} color={colors.mutedSoft}>
          End-to-end encrypted · Auto-deletes on expiry
        </AppText>
      </View>

      <ExpiryDateTimeModal visible={pickerOpen} value={pickerInitial} onConfirm={onConfirmCustom} onClose={() => setPickerOpen(false)} />
    </Screen>
  )
}
