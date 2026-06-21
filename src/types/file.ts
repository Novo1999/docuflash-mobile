import type { StoredFolder } from './folder'

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  XLS = 'xls',
  ZIP = 'zip',
  OTHER = 'other',
  TXT = 'txt',
}

export const PREVIEWABLE_FILE_TYPES = [FileType.PDF, FileType.DOCX, FileType.TXT, FileType.ZIP] as const

export const isPreviewableFileType = (fileType: FileType) =>
  PREVIEWABLE_FILE_TYPES.includes(fileType as (typeof PREVIEWABLE_FILE_TYPES)[number])

export enum FileAccessType {
  PUBLIC = 'public',
  PROTECTED = 'protected',
}

export interface DeviceInfo {
  browser: string
  os: string
  device: string
  ip: string
}

export type UploadFilePayload = {
  fileName: string
  fileType: FileType
  fileSize: number
  storageKey: string
  clientId: string
  accessType: FileAccessType
  expireAt: string
  password?: string
  downloadCount?: number
  deleteAfterDownload?: boolean
  deviceInfo?: Record<string, unknown>
}

export type FileRecord = {
  id: string
  shareToken: string
  fileName: string
  fileType: FileType
  fileSize: number
  accessType: FileAccessType
  expireAt: string
  downloadCount: number
  uploadDate: string
}

export type FileFolderRef = {
  id: string
  folderName: string
}

export type MyFileRecord = {
  id: string
  fileName: string
  fileType: FileType
  shareToken: string
  accessType: FileAccessType
  downloadCount: number
  expireAt: string
  fileSize: number
  ownerId: string
  createdAt: string
  folders: FileFolderRef[]
}

export type FileAccessTokenResponse = { accessToken: string }
export type FileDownloadResponse = { fileUrl: string }

export type PdfPreviewResponse = { kind: 'pdf'; url: string }
export type TextPreviewResponse = { kind: 'text'; text: string }
export type DocxPreviewResponse = { kind: 'docx_url'; url: string }
export type ZipPreviewResponse = { kind: 'zip_url'; url: string }
export type FilePreviewResponse =
  | PdfPreviewResponse
  | TextPreviewResponse
  | DocxPreviewResponse
  | ZipPreviewResponse

export type StoredUpload = {
  fileName: string
  fileSize: number
  fileType: FileType
  shareToken: string
  storageKey: string
  expireAt: string
  accessType: FileAccessType
  copied: boolean
  uploadDate: string
}

export type StoredItem =
  | ({ kind: 'file' } & StoredUpload)
  | ({ kind: 'folder' } & StoredFolder)

export type UploadedShareLink = {
  fileName: string
  shareToken: string
  link: string
  kind?: 'file' | 'folder'
  accessType?: FileAccessType
}

export type Preset = {
  key: string
  label: string
  hours: number
}
