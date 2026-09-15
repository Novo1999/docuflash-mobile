import { Icon } from '@/components/Icon'
import { CollectedFileRow, IncomingUploadBanner, PickedFileRow, RequestPasswordGate } from '@/components/request'
import { AppText, Button, ConfirmModal, Pill } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { MAX_REQUEST_UPLOAD_FILE_SIZE_BYTES, MAX_REQUEST_UPLOAD_FILE_SIZE_MB, MAX_UPLOAD_FILES } from '@/constants/upload'
import { useRequestRealtime, type UploadingPayload } from '@/hooks/useRequestRealtime'
import { deleteFileByShareToken, deleteUploadedStorageFile } from '@/lib/api/files'
import { getFolderByShareToken, unlockFolderByShareToken, uploadToRequest } from '@/lib/api/folder'
import { formatExpiry, getClientId, getDeviceInfo, resolveFileType, type PickedFile } from '@/lib/upload'
import { toUploadFile, totalProgressToPercent, uploadFiles } from '@/lib/uploadthing'
import { useAuth } from '@/state/AuthProvider'
import { isUploadingAtom, uploadProgressAtom } from '@/state/uploadAtoms'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType, FileType, type FileRecord } from '@/types/file'
import type { FolderRecord, RequestFileUpload } from '@/types/folder'
import * as DocumentPicker from 'expo-document-picker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
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

  const [folderPassword, setFolderPassword] = useState<string | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState<string | null>(null)

  const [pendingDelete, setPendingDelete] = useState<FileRecord | null>(null)
  const [deletingToken, setDeletingToken] = useState<string | null>(null)

  // Progress per picked file, keyed by the index it holds in `files`.
  const [fileProgress, setFileProgress] = useState<Record<number, number>>({})
  const lastBroadcastProgress = useRef(0)

  const isProtected = folder?.accessType === FileAccessType.PROTECTED
  const locked = isProtected && folderPassword === null

  // A protected request only ever returns its files from /unlock, so once unlocked the
  // refresh has to go back through it — getFolderByShareToken would empty the list.
  const refetch = useCallback(async () => {
    if (!shareToken) return
    try {
      const res = folderPassword ? await unlockFolderByShareToken(shareToken, folderPassword) : await getFolderByShareToken(shareToken)
      setFolder(res)
    } catch {
      // keep the current list if a refetch fails
    }
  }, [shareToken, folderPassword])

  const onUnlock = async (password: string) => {
    if (!shareToken || !password) return
    setUnlocking(true)
    setUnlockError(null)
    try {
      const unlocked = await unlockFolderByShareToken(shareToken, password)
      setFolder(unlocked)
      setFolderPassword(password)
    } catch (e) {
      setUnlockError(e instanceof Error ? e.message : 'Invalid password')
    } finally {
      setUnlocking(false)
    }
  }

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
      if (!locked) void refetch()
    },
  })

  const pickFiles = async () => {
    setError(null)
    // Upload-to-me links take any file type, so the picker is left unfiltered.
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: '*/*',
    })
    if (result.canceled) return
    const picked: PickedFile[] = result.assets
      .map((a) => ({ uri: a.uri, name: a.name, size: a.size ?? 0, mimeType: a.mimeType }))
      .filter((a) => {
        if (a.size > MAX_REQUEST_UPLOAD_FILE_SIZE_BYTES) {
          setError(`"${a.name}" exceeds the ${MAX_REQUEST_UPLOAD_FILE_SIZE_MB} MB limit.`)
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
    const withTypes = selected.map((f) => ({ file: f, fileType: resolveFileType(f) ?? FileType.OTHER }))

    setError(null)
    setUploading(true)
    setIsUploading(true)
    setProgress(0)
    setFileProgress({})
    lastBroadcastProgress.current = 0

    const uploaderName = user?.displayName ?? null
    const representativeName = selected.length > 1 ? `${selected.length} files` : selected[0].name
    broadcastUploading({ fileName: representativeName, uploaderName, progress: 0 })

    try {
      const clientId = await getClientId()
      const deviceInfo = getDeviceInfo()
      const uploadables = await Promise.all(selected.map((f) => toUploadFile(f)))
      const uploaded = await uploadFiles('requestUploader', {
        files: uploadables,
        onUploadProgress: ({ file, progress: filePercent, totalProgress }) => {
          // Match on identity rather than name so duplicate file names can't cross over.
          const index = uploadables.findIndex((candidate) => candidate === file)
          if (index !== -1) {
            const rounded = Math.round(filePercent)
            setFileProgress((prev) => (prev[index] === rounded ? prev : { ...prev, [index]: rounded }))
          }

          // Rounded so the atom bails out instead of re-rendering on every XHR tick.
          const totalPercent = Math.round(totalProgressToPercent(totalProgress))
          setProgress(totalPercent)

          // The channel is shared and progress events are frequent, so only tell
          // the watcher about meaningful jumps.
          if (totalPercent - lastBroadcastProgress.current >= 5) {
            lastBroadcastProgress.current = totalPercent
            broadcastUploading({ fileName: representativeName, uploaderName, progress: totalPercent })
          }
        },
      })
      setProgress(100)
      setFileProgress(Object.fromEntries(selected.map((_, index) => [index, 100])))

      if (!uploaded || uploaded.length !== withTypes.length) {
        throw new Error('Upload did not return every storage key')
      }

      const payload: RequestFileUpload[] = uploaded.map((file, index) => ({
        fileName: file.name,
        fileType: withTypes[index]?.fileType ?? FileType.OTHER,
        fileSize: file.size,
        storageKey: file.key,
        clientId,
        deviceInfo,
      }))

      try {
        await uploadToRequest(shareToken, payload, folderPassword ?? undefined)
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
      setFileProgress({})
    }
  }

  const onDeleteFile = async () => {
    if (!pendingDelete) return
    const { shareToken: fileToken } = pendingDelete

    setPendingDelete(null)
    setDeletingToken(fileToken)
    setError(null)

    try {
      // The backend removes the object from UploadThing before dropping the row,
      // so a success here means the file is gone from storage too.
      await deleteFileByShareToken(fileToken)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete that file. Please try again.')
    } finally {
      setDeletingToken(null)
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
          This link may have expired, or it isn&apos;t accepting uploads.
        </AppText>
      </Screen>
    )
  }

  if (locked) {
    return (
      <Screen scroll contentStyle={{ alignItems: 'center', paddingHorizontal: 26, justifyContent: 'center' }}>
        <RequestPasswordGate
          folderName={folder.folderName}
          error={unlockError}
          unlocking={unlocking}
          onUnlock={onUnlock}
          onPasswordChange={() => setUnlockError(null)}
        />
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
        {isProtected ? <Pill label="Protected" tone="accent" icon={<Icon name="lock" size={10} color={colors.accentText} strokeWidth={2.2} />} /> : null}
      </View>

      {incoming ? <IncomingUploadBanner incoming={incoming} /> : null}

      <View pointerEvents={uploading ? 'none' : 'auto'} style={{ width: '100%', marginTop: 18 }}>
        {/* Only the dropzone dims during an upload — the file rows below carry the progress bars. */}
        <Pressable
          onPress={pickFiles}
          style={{
            opacity: uploading ? 0.5 : 1,
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
            Any file type{'\n'}Up to {MAX_UPLOAD_FILES} files · {MAX_REQUEST_UPLOAD_FILE_SIZE_MB} MB each
          </AppText>
        </Pressable>

        {files.length > 0 ? (
          <View style={{ gap: 9, marginTop: 14 }}>
            {files.map((f, index) => (
              <PickedFileRow key={f.uri} file={f} uploading={uploading} progress={fileProgress[index] ?? 0} onRemove={() => removeFile(f.uri)} />
            ))}
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
            <CollectedFileRow
              key={file.id}
              file={file}
              deleting={deletingToken === file.shareToken}
              onOpen={() => router.push(`/share/${file.shareToken}`)}
              onDelete={() => setPendingDelete(file)}
            />
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

      <ConfirmModal
        visible={pendingDelete !== null}
        icon="trash"
        tone="danger"
        title="Delete this file?"
        message={pendingDelete ? `"${pendingDelete.fileName}" will be removed from storage for everyone. This can't be undone.` : undefined}
        confirmLabel="Delete"
        onConfirm={onDeleteFile}
        onClose={() => setPendingDelete(null)}
      />
    </Screen>
  )
}
