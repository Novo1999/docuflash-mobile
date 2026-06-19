import type { FileAccessType, FileRecord } from './file'

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
