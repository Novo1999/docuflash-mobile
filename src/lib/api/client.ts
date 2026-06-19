import { BASE_URL } from '@/constants/api'
import { getAccessToken } from '@/lib/session'

export type ApiResponse<T> = {
  success: boolean
  msg: string
  data: T
  status: number
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

export function buildApiUrl(endpoint: string): string {
  if (!BASE_URL) {
    throw new ApiError('EXPO_PUBLIC_BASE_URL is not configured', 0)
  }

  const normalizedBaseUrl = BASE_URL.replace(/\/$/, '')
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${normalizedBaseUrl}${normalizedEndpoint}`
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<ApiResponse<T>> {
  const { body, headers, ...rest } = options
  const accessToken = getAccessToken()

  const response = await fetch(buildApiUrl(endpoint), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json: ApiResponse<T> = await response.json()
  return json
}

export const requireApiData = <T>(response: ApiResponse<T>, fallbackMessage: string): T => {
  if (!response.success) {
    throw new ApiError(response.msg || fallbackMessage, response.status)
  }
  return response.data
}
