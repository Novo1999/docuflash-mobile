import type {
  AuthResult,
  AuthUser,
  LoginPayload,
  OAuthProvider,
  RefreshResult,
  RegisterPayload,
  RegisterResult,
  UpdateProfilePayload,
} from '@/types/auth'
import { apiClient, buildApiUrl, requireApiData } from './client'

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await apiClient<RegisterResult>('/api/auth/register', { method: 'POST', body: payload })
  return requireApiData(response, 'Registration failed')
}

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  const response = await apiClient<AuthResult>('/api/auth/login', { method: 'POST', body: payload })
  return requireApiData(response, 'Invalid email or password')
}

export async function refreshAuthSession(refreshToken: string): Promise<RefreshResult> {
  const response = await apiClient<RefreshResult>('/api/auth/refresh', { method: 'POST', body: { refreshToken } })
  return requireApiData(response, 'Session refresh failed')
}

export async function logoutUser(): Promise<void> {
  await apiClient<null>('/api/auth/logout', { method: 'POST' })
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient<AuthUser>('/api/auth/me')
  return requireApiData(response, 'Failed to load your profile')
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  const response = await apiClient<AuthUser>('/api/auth/me', { method: 'PATCH', body: payload })
  return requireApiData(response, 'Failed to update your profile')
}

export function getOAuthUrl(provider: OAuthProvider): string {
  return buildApiUrl(`/api/auth/oauth/${provider}`)
}
