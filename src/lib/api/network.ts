import { apiClient, requireApiData } from './client'

export async function getNetworkKey(): Promise<string> {
  const response = await apiClient<{ networkKey: string }>('/api/network/whoami')
  return requireApiData(response, 'Failed to resolve your network').networkKey
}
