import { FileType } from '@/types/file'
import * as FileSystem from 'expo-file-system/legacy'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Sharing from 'expo-sharing'
import { Linking, Platform } from 'react-native'

const MIME_BY_TYPE: Record<FileType, string> = {
  [FileType.PDF]: 'application/pdf',
  [FileType.DOCX]: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  [FileType.XLS]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  [FileType.ZIP]: 'application/zip',
  [FileType.TXT]: 'text/plain',
  [FileType.OTHER]: 'application/octet-stream',
}

const UTI_BY_TYPE: Record<FileType, string> = {
  [FileType.PDF]: 'com.adobe.pdf',
  [FileType.DOCX]: 'org.openxmlformats.wordprocessingml.document',
  [FileType.XLS]: 'org.openxmlformats.spreadsheetml.sheet',
  [FileType.ZIP]: 'public.zip-archive',
  [FileType.TXT]: 'public.plain-text',
  [FileType.OTHER]: 'public.data',
}

// android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
const FLAG_GRANT_READ_URI_PERMISSION = 1

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_') || 'file'
}

async function downloadToCache(url: string, fileName: string): Promise<string> {
  const target = `${FileSystem.cacheDirectory ?? ''}${Date.now()}_${sanitizeFileName(fileName)}`
  const { uri } = await FileSystem.downloadAsync(url, target)
  return uri
}

async function writeTextToCache(text: string, fileName: string): Promise<string> {
  const safe = sanitizeFileName(fileName.endsWith('.txt') ? fileName : `${fileName}.txt`)
  const target = `${FileSystem.cacheDirectory ?? ''}${Date.now()}_${safe}`
  await FileSystem.writeAsStringAsync(target, text)
  return target
}

async function shareLocalUri(localUri: string, fileName: string, fileType: FileType, fallbackUrl?: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    if (fallbackUrl) await Linking.openURL(fallbackUrl)
    return
  }
  await Sharing.shareAsync(localUri, {
    mimeType: MIME_BY_TYPE[fileType],
    UTI: UTI_BY_TYPE[fileType],
    dialogTitle: fileName,
  })
}

/**
 * Opens the file for *viewing* in another app. On Android this fires an
 * ACTION_VIEW intent so the OS shows the "Open with" chooser of apps that can
 * display the file (PDF viewer, etc.) — not the share sheet. On iOS there is no
 * separate "open in" vs "share" surface, so the document share sheet is used.
 */
async function openLocalInApp(localUri: string, fileName: string, fileType: FileType, fallbackUrl?: string): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      const contentUri = await FileSystem.getContentUriAsync(localUri)
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        type: MIME_BY_TYPE[fileType],
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      })
      return
    } catch {
      // No app can view this type, or the user dismissed the chooser — fall back to sharing.
      await shareLocalUri(localUri, fileName, fileType, fallbackUrl)
      return
    }
  }
  await shareLocalUri(localUri, fileName, fileType, fallbackUrl)
}

/** Downloads the file and opens the "Open with" viewer chooser. */
export async function openFileInApp(url: string, fileName: string, fileType: FileType): Promise<void> {
  const localUri = await downloadToCache(url, fileName)
  await openLocalInApp(localUri, fileName, fileType, url)
}

/** Writes a text body to a local .txt file and opens it in a viewer app. */
export async function openTextInApp(text: string, fileName: string): Promise<void> {
  const localUri = await writeTextToCache(text, fileName)
  await openLocalInApp(localUri, fileName, FileType.TXT)
}

/** Downloads the file and presents the share sheet (ACTION_SEND on Android). */
export async function shareFile(url: string, fileName: string, fileType: FileType): Promise<void> {
  const localUri = await downloadToCache(url, fileName)
  await shareLocalUri(localUri, fileName, fileType, url)
}

/** Writes a text body to a local .txt file and presents the share sheet. */
export async function shareText(text: string, fileName: string): Promise<void> {
  const localUri = await writeTextToCache(text, fileName)
  await shareLocalUri(localUri, fileName, FileType.TXT)
}

export type SaveResult = { method: 'saved' | 'shared' | 'cancelled' }

/**
 * Saves the file into the device's file manager. On Android the user picks a
 * destination folder via the Storage Access Framework; on iOS the share sheet's
 * "Save to Files" is the platform-native equivalent.
 */
export async function saveFileToDevice(url: string, fileName: string, fileType: FileType): Promise<SaveResult> {
  const localUri = await downloadToCache(url, fileName)

  if (Platform.OS === 'android') {
    const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
    if (!permission.granted) {
      return { method: 'cancelled' }
    }
    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 })
    const baseName = sanitizeFileName(fileName).replace(/\.[^.]+$/, '')
    const destUri = await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, baseName, MIME_BY_TYPE[fileType])
    await FileSystem.writeAsStringAsync(destUri, base64, { encoding: FileSystem.EncodingType.Base64 })
    return { method: 'saved' }
  }

  await shareLocalUri(localUri, fileName, fileType, url)
  return { method: 'shared' }
}
