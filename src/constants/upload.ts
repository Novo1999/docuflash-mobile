import { FileType, type Preset } from '@/types/file'

export const ACCEPTED_UPLOAD_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-zip-compressed',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/plain',
]

export const ACCEPTED_UPLOAD_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.xls', '.zip', '.txt']

export const MAX_UPLOAD_FILES = 5
export const MAX_UPLOAD_FILE_SIZE_MB = 16
export const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024
export const DEFAULT_UPLOAD_FOLDER_NAME = 'New Folder'
export const SUPPORTED_UPLOAD_FORMATS = ['PDF', 'DOCX', 'XLSX', 'ZIP', 'TXT']

export const MIME_TO_FILE_TYPE: Record<string, FileType> = {
  'application/pdf': FileType.PDF,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType.DOCX,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileType.XLS,
  'application/vnd.ms-excel': FileType.XLS,
  'application/zip': FileType.ZIP,
  'application/x-zip-compressed': FileType.ZIP,
  'text/plain': FileType.TXT,
}

export const EXTENSION_TO_FILE_TYPE: Record<string, FileType> = {
  pdf: FileType.PDF,
  docx: FileType.DOCX,
  xlsx: FileType.XLS,
  xls: FileType.XLS,
  zip: FileType.ZIP,
  txt: FileType.TXT,
}

// Where shared links resolve — the web frontend, not the API host.
export const SHARE_BASE_URL = process.env.EXPO_PUBLIC_SHARE_BASE_URL ?? 'https://docuflash-frontend.vercel.app'

export const EXPIRY_PRESETS: Preset[] = [
  { key: '1h', label: '1 hour', hours: 1 },
  { key: '6h', label: '6 hours', hours: 6 },
  { key: '24h', label: '24 hours', hours: 24 },
  { key: '3d', label: '3 days', hours: 24 * 3 },
  { key: '7d', label: '7 days', hours: 24 * 7 },
]
