import type { ActiveRequestRecord, CreateFolderPayload, CreateUploadRequestPayload, FolderRecord, MyFolderRecord, RequestFileUpload, UploadRequestRecord } from '@/types/folder'
import type { FileRecord } from '@/types/file'
import { apiClient, requireApiData } from './client'

export async function createFolder(payload: CreateFolderPayload): Promise<FolderRecord> {
  if (payload.accessType === 'protected' && !payload.password) {
    throw new Error('A password is required for protected folders')
  }
  const response = await apiClient<FolderRecord>('/api/folders', { method: 'POST', body: payload })
  return requireApiData(response, 'Failed to create folder')
}

export async function createUploadRequest(payload: CreateUploadRequestPayload): Promise<UploadRequestRecord> {
  if (payload.accessType === 'protected' && !payload.password) {
    throw new Error('A password is required for protected requests')
  }
  const response = await apiClient<UploadRequestRecord>('/api/folders/request', { method: 'POST', body: payload })
  return requireApiData(response, 'Failed to create upload request')
}

export async function uploadToRequest(token: string, files: RequestFileUpload[], password?: string): Promise<FileRecord[]> {
  const response = await apiClient<FileRecord[]>(`/api/folders/token/${token}/files`, {
    method: 'POST',
    body: { files, password },
  })
  return requireApiData(response, 'Failed to upload files')
}

export async function getActiveRequests(clientId: string): Promise<ActiveRequestRecord[]> {
  const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : ''
  const response = await apiClient<ActiveRequestRecord[]>(`/api/folders/requests${query}`)
  return requireApiData(response, 'Failed to load your active requests')
}

export async function getMyFolders(search?: string): Promise<MyFolderRecord[]> {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  const response = await apiClient<MyFolderRecord[]>(`/api/folders/mine${query}`)
  return requireApiData(response, 'Failed to load your folders')
}

export async function getFolderByShareToken(token: string): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>(`/api/folders/token/${token}`)
  return requireApiData(response, 'Failed to fetch folder')
}

export async function unlockFolderByShareToken(token: string, password: string): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>(`/api/folders/token/${token}/unlock`, {
    method: 'POST',
    body: { password },
  })
  return requireApiData(response, 'Invalid password')
}

export async function moveFileToFolder(folderId: string, fileId: string): Promise<FolderRecord> {
  const response = await apiClient<FolderRecord>(`/api/folders/${folderId}/files`, { method: 'POST', body: { fileId } })
  return requireApiData(response, 'Failed to move file')
}

export async function deleteFolderById(id: string): Promise<void> {
  const response = await apiClient<null>(`/api/folders/${id}`, { method: 'DELETE' })
  requireApiData(response, 'Failed to delete folder')
}

export async function deleteFolderByShareToken(token: string): Promise<void> {
  const response = await apiClient<null>(`/api/folders/token/${token}`, { method: 'DELETE' })
  requireApiData(response, 'Failed to delete folder')
}
