import type { BlockedSender, BlockSenderPayload, CreateReportPayload, ReportReceipt } from '@/types/moderation'
import { ApiError, apiClient, requireApiData } from './client'

export async function createReport(payload: CreateReportPayload): Promise<ReportReceipt> {
  const response = await apiClient<ReportReceipt>('/api/moderation/reports', { method: 'POST', body: payload })
  return requireApiData(response, 'Could not send the report')
}

export async function blockSender(payload: BlockSenderPayload): Promise<BlockedSender> {
  const response = await apiClient<BlockedSender>('/api/moderation/blocked-senders', { method: 'POST', body: payload })
  return requireApiData(response, 'Could not block this sender')
}

export async function getBlockedSenders(folderId: string, ownerClientId?: string): Promise<BlockedSender[]> {
  const query = new URLSearchParams({ folderId })
  if (ownerClientId) query.set('ownerClientId', ownerClientId)

  const response = await apiClient<BlockedSender[]>(`/api/moderation/blocked-senders?${query.toString()}`)
  return requireApiData(response, 'Could not load blocked senders')
}

export async function unblockSender(id: string, ownerClientId?: string): Promise<void> {
  const query = ownerClientId ? `?${new URLSearchParams({ ownerClientId }).toString()}` : ''
  const response = await apiClient<null>(`/api/moderation/blocked-senders/${id}${query}`, { method: 'DELETE' })

  if (!response.success) {
    throw new ApiError(response.msg || 'Could not unblock this sender', response.status)
  }
}
