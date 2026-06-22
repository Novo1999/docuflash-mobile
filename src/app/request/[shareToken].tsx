import { Icon } from '@/components/Icon'
import { AppText, Button, Card, FileTypeBadge, IconButton, Pill } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { ACCEPTED_UPLOAD_MIME_TYPES, MAX_UPLOAD_FILES, MAX_UPLOAD_FILE_SIZE_BYTES } from '@/constants/upload'
import { useRequestRealtime, type UploadingPayload } from '@/hooks/useRequestRealtime'
import { deleteUploadedStorageFile } from '@/lib/api/files'
import { getFolderByShareToken, uploadToRequest } from '@/lib/api/folder'
import { formatExpiry, formatFileSize, getClientId, getDeviceInfo, resolveFileType, type PickedFile } from '@/lib/upload'
import { toUploadFile, uploadFiles } from '@/lib/uploadthing'
import { useAuth } from '@/state/AuthProvider'
import { isUploadingAtom, uploadProgressAtom } from '@/state/uploadAtoms'
import { useTheme } from '@/theme/ThemeProvider'
import { FileType } from '@/types/file'
import type { FolderRecord, RequestFileUpload } from '@/types/folder'
import * as DocumentPicker from 'expo-document-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, View } from 'react-native'

export default function RequestUploadScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const { shareToken } = useLocalSearchParams<{ shareToken: string }>()

  const setIsUploading = useSetAtom(isUploadingAtom)
  const setProgress = useSetAtom(uploadProgressAtom)

  const [folder, setFolder] = useState<FolderRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [files, setFiles] = useState<PickedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [incoming, setIncoming] = useState<UploadingPayload | null>(null)

  const refetch = useCallback(async () => {
    if (!shareToken) return
    try {
      const res = await getFolderByShareToken(shareToken)
      setFolder(res)
    } catch {
      // keep the current list if a refetch fails
    }
  }, [shareToken])

  useEffect(() => {
    if (!shareToken) return
    ;(async () => {
      try {
        const res = await getFolderByShareToken(shareToken)
        if (!res.acceptsUploads) {
          setNotFound(true)
        } else {
          setFolder(res)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [shareToken])

  const { broadcastUploading, broadcastComplete } = useRequestRealtime(shareToken ?? '', {
    onUploading: (payload) => {
      setIncoming(payload)
      setTimeout(() => setIncoming((current) => (current === payload ? null : current)), 15000)
    },
    onComplete: () => {
      setIncoming(null)
      void refetch()
    },
  })

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

  const onUpload = async () => {
    if (!shareToken || files.length === 0) return
    const selected = files.slice(0, MAX_UPLOAD_FILES)
    const withTypes = selected.map((f) => ({ file: f, fileType: resolveFileType(f) }))
    const unsupported = withTypes.find(({ fileType }) => !fileType)?.file
    if (unsupported) {
      setError(`"${unsupported.name}" is not a supported file type.`)
      return
    }

    setError(null)
    setUploading(true)
    setIsUploading(true)
    setProgress(0)

    const uploaderName = user?.displayName ?? null
    const representativeName = selected.length > 1 ? `${selected.length} files` : selected[0].name
    broadcastUploading({ fileName: representativeName, uploaderName })

    try {
      const clientId = await getClientId()
      const deviceInfo = getDeviceInfo()
      const uploadables = await Promise.all(selected.map((f) => toUploadFile(f)))
      const uploaded = await uploadFiles('fileUploader', {
        files: uploadables,
        onUploadProgress: ({ totalProgress }) => setProgress(totalProgress),
      })
      setProgress(100)

      if (!uploaded || uploaded.length !== withTypes.length) {
        throw new Error('Upload did not return every storage key')
      }

      const payload: RequestFileUpload[] = uploaded.map((file, index) => {
        const fileType = withTypes[index]?.fileType
        if (!fileType) throw new Error(`Could not resolve file type for ${file.name}`)
        return { fileName: file.name, fileType, fileSize: file.size, storageKey: file.key, clientId, deviceInfo }
      })

      try {
        await uploadToRequest(shareToken, payload)
      } catch (attachError) {
        await Promise.allSettled(uploaded.map((file) => deleteUploadedStorageFile(file.key)))
        throw attachError
      }

      await refetch()
      broadcastComplete()
      setFiles([])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
      setIsUploading(false)
      setProgress(0)
    }
  }

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
          This request may have expired, or it isn&apos;t accepting uploads.
        </AppText>
      </Screen>
    )
  }

  return (
    <Screen scroll contentStyle={{ alignItems: 'center', paddingHorizontal: 26 }}>
      <AppText variant="heading" size={16} color={colors.heading} style={{ marginTop: 8 }}>
        Docuflash
      </AppText>
      <Pill
        label="Send files to this person"
        tone="accent"
        icon={<Icon name="download" size={12} color={colors.accentText} strokeWidth={2} />}
        style={{ marginTop: 14, marginBottom: 22 }}
      />

      <View style={{ width: 74, height: 74, borderRadius: 18, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="download" size={34} color={colors.accent} strokeWidth={1.6} />
      </View>

      <AppText variant="heading" size={23} color={colors.heading} style={{ marginTop: 20, textAlign: 'center' }}>
        {folder.folderName}
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center', marginTop: 12 }}>
        <Pill label={`${folder.files.length} file${folder.files.length === 1 ? '' : 's'} collected`} />
        <Pill label={formatExpiry(folder.expireAt)} />
      </View>

      {incoming ? (
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: 18,
            padding: 12,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.accent,
            backgroundColor: colors.accentSoftBg,
          }}
        >
          <ActivityIndicator color={colors.accent} />
          <AppText size={12.5} color={colors.text} style={{ flex: 1 }}>
            {incoming.uploaderName ?? 'A user'} is uploading{' '}
            <AppText weight="semibold" size={12.5} color={colors.text}>
              {incoming.fileName}
            </AppText>
          </AppText>
        </View>
      ) : null}

      <View pointerEvents={uploading ? 'none' : 'auto'} style={{ width: '100%', opacity: uploading ? 0.5 : 1, marginTop: 18 }}>
        <Pressable
          onPress={pickFiles}
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.dashBorder,
            backgroundColor: colors.dashBg,
            borderRadius: radii.xl,
            paddingVertical: 22,
            paddingHorizontal: 18,
            alignItems: 'center',
            gap: 10,
          }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="upload" size={24} color={colors.accent} strokeWidth={1.6} />
          </View>
          <AppText weight="semibold" size={15} color={colors.text}>
            Pick files to{' '}
            <AppText weight="semibold" size={15} color={colors.accentText}>
              upload
            </AppText>
          </AppText>
          <AppText size={11.5} color={colors.mutedSoft} style={{ textAlign: 'center', lineHeight: 16 }}>
            PDF · DOCX · XLSX · ZIP · TXT{'\n'}Up to 5 files · 16 MB each
          </AppText>
        </Pressable>

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
                  <IconButton name="close" tone="plain" color={colors.mutedSoft} disabled={uploading} onPress={() => removeFile(f.uri)} />
                </Card>
              )
            })}
          </View>
        ) : null}
      </View>

      {error ? (
        <AppText size={12.5} color={colors.danger} style={{ marginTop: 14, alignSelf: 'flex-start' }}>
          {error}
        </AppText>
      ) : null}

      <Button
        title={files.length > 1 ? `Upload ${files.length} files` : 'Upload'}
        icon="upload"
        onPress={onUpload}
        loading={uploading}
        disabled={files.length === 0}
        style={{ marginTop: 18, width: '100%' }}
      />

      <View
        style={{
          width: '100%',
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg + 2,
          paddingHorizontal: 18,
          paddingVertical: 10,
          marginTop: 22,
          gap: 4,
        }}
      >
        <AppText variant="heading" size={14} color={colors.heading} style={{ paddingTop: 4, paddingBottom: 6 }}>
          Collected files
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
                  {formatFileSize(file.fileSize)}
                </AppText>
              </View>
              <Icon name="chevron-right" size={18} color={colors.mutedSoft} strokeWidth={2} />
            </Pressable>
          ))
        ) : (
          <AppText size={12.5} color={colors.mutedSoft} style={{ paddingVertical: 9 }}>
            No files yet. Uploads will appear here.
          </AppText>
        )}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 }}>
        <Icon name="clock" size={12} color={colors.mutedSoft} strokeWidth={1.8} />
        <AppText size={10.5} color={colors.mutedSoft}>
          Files auto-delete 2 hours after upload
        </AppText>
      </View>
    </Screen>
  )
}
