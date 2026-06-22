import type { FileAccessType, FileRecord, FileType } from './file'

export type CreateFolderPayload = {
  folderName: string
  fileIds: string[]
  expireAt: string
  accessType: FileAccessType
  password?: string
  clientId: string
}

export type FolderRecord = {
  shareToken: string
  folderName: string
  createdAt: string
  expireAt?: string
  accessType: FileAccessType
  files: FileRecord[]
  id: string
  acceptsUploads?: boolean
}

export type UploadRequestRecord = {
  shareToken: string
  folderName: string
  acceptsUploads: boolean
  expireAt: string
}

export type RequestFileUpload = {
  fileName: string
  fileType: FileType
  fileSize: number
  storageKey: string
  clientId: string
  deviceInfo: Record<string, unknown>
}

export type MyFolderRecord = {
  id: string
  folderName: string
  shareToken: string
  accessType: FileAccessType
  ownerId: string
  expireAt: string
  createdAt: string
}

export type StoredFolder = {
  folderName: string
  shareToken: string
  createdAt: string
  expireAt: string
  accessType: string
  copied: boolean
  fileCount: number
}
