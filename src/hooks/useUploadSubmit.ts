import { DEFAULT_UPLOAD_FOLDER_NAME, MAX_UPLOAD_FILES } from '@/constants/upload'
import { deleteFileByShareToken, deleteUploadedStorageFile, uploadFile } from '@/lib/api/files'
import { createFolder } from '@/lib/api/folder'
import { getClientId, getDeviceInfo, getFolderShareLink, getShareLink, resolveFileType, type PickedFile } from '@/lib/upload'
import { toUploadFile, uploadFiles } from '@/lib/uploadthing'
import { FileAccessType, type UploadedShareLink } from '@/types/file'
import { useState } from 'react'

export type UploadInput = {
  files: PickedFile[]
  accessType: FileAccessType
  password?: string
  expireAt: string
  folderName?: string
}

export type UploadOutput = {
  links: UploadedShareLink[]
  lastShareToken: string | null
}

export function useUploadSubmit() {
  const [isUploading, setIsUploading] = useState(false)

  const submit = async (input: UploadInput): Promise<UploadOutput> => {
    const selected = input.files.slice(0, MAX_UPLOAD_FILES)
    const filesWithTypes = selected.map((file) => ({ file, fileType: resolveFileType(file) }))
    const unsupported = filesWithTypes.find(({ fileType }) => !fileType)?.file
    if (unsupported) throw new Error(`"${unsupported.name}" is not a supported file type.`)

    if (input.accessType === FileAccessType.PROTECTED && !input.password) {
      throw new Error('A password is required for protected files.')
    }

    setIsUploading(true)
    const clientId = await getClientId()
    const deviceInfo = getDeviceInfo()
    const password = input.accessType === FileAccessType.PROTECTED ? input.password : undefined

    try {
      const uploadables = await Promise.all(selected.map((f) => toUploadFile(f)))
      const uploaded = await uploadFiles('fileUploader', { files: uploadables })

      if (!uploaded || uploaded.length !== filesWithTypes.length) {
        throw new Error('Upload did not return every storage key')
      }

      const links: UploadedShareLink[] = []
      const createdShareTokens: string[] = []
      const fileIds: string[] = []

      try {
        for (const [index, file] of uploaded.entries()) {
          const fileType = filesWithTypes[index]?.fileType
          if (!fileType) throw new Error(`Could not resolve file type for ${file.name}`)

          const response = await uploadFile({
            fileName: file.name,
            fileType,
            fileSize: file.size,
            storageKey: file.key,
            clientId,
            accessType: input.accessType,
            expireAt: input.expireAt,
            password,
            deviceInfo,
          })

          if (!response.success) throw new Error(response.msg || 'Failed to register file')

          const record = response.data
          fileIds.push(record.id)
          createdShareTokens.push(record.shareToken)
          links.push({
            fileName: file.name,
            shareToken: record.shareToken,
            link: getShareLink(record.shareToken),
            kind: 'file',
            accessType: input.accessType,
          })
        }

        if (fileIds.length <= 1) {
          return { links, lastShareToken: links[0]?.shareToken ?? null }
        }

        const folder = await createFolder({
          folderName: input.folderName?.trim() || DEFAULT_UPLOAD_FOLDER_NAME,
          fileIds,
          expireAt: input.expireAt,
          accessType: input.accessType,
          password,
          clientId,
        })

        const folderLink: UploadedShareLink = {
          fileName: folder.folderName,
          shareToken: folder.shareToken,
          link: getFolderShareLink(folder.shareToken),
          kind: 'folder',
          accessType: input.accessType,
        }
        return { links: [folderLink], lastShareToken: folder.shareToken }
      } catch (metadataError) {
        await Promise.allSettled([
          ...createdShareTokens.map((token) => deleteFileByShareToken(token)),
          ...uploaded.map((file) => deleteUploadedStorageFile(file.key)),
        ])
        throw metadataError
      }
    } finally {
      setIsUploading(false)
    }
  }

  return { submit, isUploading }
}
