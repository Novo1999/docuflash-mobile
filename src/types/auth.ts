export type OAuthProvider = 'google' | 'github'
export type AuthProviderName = 'email' | OAuthProvider

export type AuthUser = {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  provider: AuthProviderName
  createdAt: string
  updatedAt: string
}

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  expiresIn: number
  tokenType: string
}

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { email: string; password: string; displayName?: string }
export type GoogleNativePayload = { idToken: string }

export type AuthResult = { user: AuthUser; session: AuthSession }
export type RegisterResult = {
  user: AuthUser
  session: AuthSession | null
  needsEmailConfirmation: boolean
}
export type RefreshResult = { session: AuthSession }
export type UpdateProfilePayload = { avatarUrl?: string; displayName?: string }

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
