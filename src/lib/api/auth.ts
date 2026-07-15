import { OAUTH_NATIVE_REDIRECT_URL, RESET_PASSWORD_REDIRECT_URL } from '@/constants/auth'
import type {
  AuthResult,
  AuthUser,
  GoogleNativePayload,
  LoginPayload,
  OAuthProvider,
  RefreshResult,
  RegisterPayload,
  RegisterResult,
  ResetPasswordPayload,
  UpdateProfilePayload,
} from '@/types/auth'
import { ApiError, apiClient, buildApiUrl, requireApiData } from './client'

export async function registerUser(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await apiClient<RegisterResult>('/api/auth/register', { method: 'POST', body: payload })
  return requireApiData(response, 'Registration failed')
}

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  const response = await apiClient<AuthResult>('/api/auth/login', { method: 'POST', body: payload })
  return requireApiData(response, 'Invalid email or password')
}

export async function loginWithGoogleNative(payload: GoogleNativePayload): Promise<AuthResult> {
  const response = await apiClient<AuthResult>('/api/auth/oauth/google/native', { method: 'POST', body: payload })
  return requireApiData(response, 'Google sign-in failed')
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await apiClient<null>('/api/auth/forgot-password', {
    method: 'POST',
    body: { email, redirectTo: RESET_PASSWORD_REDIRECT_URL },
  })
  if (!response.success) {
    throw new ApiError(response.msg || 'Could not send the reset email', response.status)
  }
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<AuthResult> {
  const response = await apiClient<AuthResult>('/api/auth/reset-password', { method: 'POST', body: payload })
  return requireApiData(response, 'Could not update your password')
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
  return `${buildApiUrl(`/api/auth/oauth/${provider}`)}?redirect=${encodeURIComponent(OAUTH_NATIVE_REDIRECT_URL)}`
}
