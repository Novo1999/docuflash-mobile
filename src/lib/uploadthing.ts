import { BASE_URL } from '@/constants/api'
import { logApiError, logApiRequest, logApiResponse } from '@/lib/logger'
import { generateReactNativeHelpers } from '@uploadthing/expo'

const UPLOADTHING_URL = `${BASE_URL.replace(/\/$/, '')}/api/uploadthing`

// Points at the backend's UploadThing endpoint (same host as the REST API).
export const { useUploadThing, uploadFiles: rawUploadFiles, useDocumentUploader } = generateReactNativeHelpers({
  url: UPLOADTHING_URL,
})

// Logged wrapper so every UploadThing transfer shows up alongside REST calls.
export const uploadFiles: typeof rawUploadFiles = (async (endpoint: any, opts: any) => {
  const startedAt = Date.now()
  const fileCount = Array.isArray(opts?.files) ? opts.files.length : undefined
  logApiRequest('UPLOAD', 'POST', `${UPLOADTHING_URL}#${String(endpoint)}`, { files: fileCount })
  try {
    const result = await rawUploadFiles(endpoint, opts)
    logApiResponse('UPLOAD', 'POST', `${UPLOADTHING_URL}#${String(endpoint)}`, 'OK', Date.now() - startedAt)
    return result
  } catch (error) {
    logApiError('UPLOAD', 'POST', `${UPLOADTHING_URL}#${String(endpoint)}`, error, Date.now() - startedAt)
    throw error
  }
}) as typeof rawUploadFiles

export type RNUploadFile = File & { uri: string }

/**
 * Turns a picked document (expo-document-picker asset) into the RN-FormData
 * compatible File object UploadThing expects — a File carrying a `uri`.
 *
 * We deliberately do NOT do `fetch(uri).then(r => r.blob())` (which is what
 * UploadThing's own expo helper does). On React Native, fetching a `file://`
 * URI buffers the body as an ArrayBuffer, and `Response.blob()` then calls
 * `new Blob([arrayBuffer])`, which RN's BlobManager rejects with
 * "Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not supported".
 *
 * Instead we build an empty-bodied File (UploadThing only reads name/size/type
 * from it for the presign request) and attach the `uri` — RN's FormData streams
 * the real bytes straight from disk via that uri at upload time.
 */
export async function toUploadFile(asset: {
  uri: string
  name: string
  size?: number
  mimeType?: string | null
}): Promise<RNUploadFile> {
  const file = new File([], asset.name, { type: asset.mimeType ?? 'application/octet-stream' })
  if (typeof asset.size === 'number') {
    Object.defineProperty(file, 'size', { value: asset.size, configurable: true })
  }
  return Object.assign(file, { uri: asset.uri }) as RNUploadFile
}
