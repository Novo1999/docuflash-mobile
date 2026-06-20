import { toUploadFile, uploadFiles } from '@/lib/uploadthing'
import type { ImagePickerAsset } from 'expo-image-picker'

export async function uploadAvatar(
  asset: ImagePickerAsset,
  onUploadProgress?: (progress: number) => void,
): Promise<string> {
  const rnFile = await toUploadFile({
    uri: asset.uri,
    name: asset.fileName ?? 'avatar.jpg',
    size: asset.fileSize,
    mimeType: asset.mimeType,
  })
  const [result] = await uploadFiles('avatarUploader', {
    files: [rnFile],
    onUploadProgress: ({ totalProgress }) => onUploadProgress?.(totalProgress),
  })
  if (!result?.url) throw new Error('Upload did not return a URL')
  return result.url
}
