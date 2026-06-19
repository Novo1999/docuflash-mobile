import type {
  FileAccessTokenResponse,
  FileDownloadResponse,
  FilePreviewResponse,
  FileRecord,
  MyFileRecord,
  UploadFilePayload,
} from '@/types/file'
import { ApiError, apiClient, buildApiUrl, requireApiData } from './client'

const buildAccessBody = (accessToken?: string) => (accessToken ? { accessToken } : {})

export async function uploadFile(payload: UploadFilePayload) {
  if (payload.accessType === 'protected' && !payload.password) {
    throw new Error('A password is required for protected files')
  }
  return apiClient<FileRecord>('/api/files', { method: 'POST', body: payload })
}

export async function getMyFiles(): Promise<MyFileRecord[]> {
  const response = await apiClient<MyFileRecord[]>('/api/files/mine')
  return requireApiData(response, 'Failed to load your files')
}

export async function getFileByShareToken(token: string) {
  return apiClient<FileRecord>(`/api/files/${token}`)
}

export async function deleteFileByShareToken(token: string): Promise<void> {
  await apiClient<null>(`/api/files/token/${token}`, { method: 'DELETE' })
}

export async function verifyFilePassword(token: string, password: string): Promise<FileAccessTokenResponse> {
  const response = await apiClient<FileAccessTokenResponse>(`/api/files/${token}/verify`, {
    method: 'POST',
    body: { password },
  })
  return requireApiData(response, 'Invalid password')
}

export async function getFilePreview(token: string, accessToken?: string): Promise<FilePreviewResponse> {
  const response = await apiClient<FilePreviewResponse>(`/api/files/${token}/preview`, {
    method: 'POST',
    body: buildAccessBody(accessToken),
  })
  return requireApiData(response, 'Preview is unavailable for this file')
}

export async function getFileDownloadUrl(token: string, accessToken?: string): Promise<FileDownloadResponse> {
  const response = await apiClient<FileDownloadResponse>(`/api/files/${token}/download`, {
    method: 'POST',
    body: buildAccessBody(accessToken),
  })
  return requireApiData(response, 'Download failed. Please try again.')
}

export async function deleteUploadedStorageFile(storageKey: string): Promise<void> {
  const response = await fetch(buildApiUrl('/api/uploadthing'), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storageKey }),
  })

  if (!response.ok) {
    let message = 'Failed to delete uploaded storage file'
    try {
      const json = await response.json()
      message = json.msg ?? json.message ?? message
    } catch {
      // Keep the fallback message when the cleanup endpoint returns no JSON.
    }
    throw new ApiError(message, response.status)
  }
}
