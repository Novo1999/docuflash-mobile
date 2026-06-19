import { BASE_URL } from '@/constants/api'
import { generateReactNativeHelpers } from '@uploadthing/expo'

// Points at the backend's UploadThing endpoint (same host as the REST API).
export const { useUploadThing, uploadFiles, useDocumentUploader } = generateReactNativeHelpers({
  url: `${BASE_URL.replace(/\/$/, '')}/api/uploadthing`,
})

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
