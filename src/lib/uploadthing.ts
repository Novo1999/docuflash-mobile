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
 */
export async function toUploadFile(asset: {
  uri: string
  name: string
  mimeType?: string | null
}): Promise<RNUploadFile> {
  const blob = await fetch(asset.uri).then((r) => r.blob())
  const file = new File([blob], asset.name, { type: asset.mimeType ?? 'application/octet-stream' })
  return Object.assign(file, { uri: asset.uri }) as RNUploadFile
}
