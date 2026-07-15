import type { OAuthProvider } from '@/types/auth'

export const AUTH_SESSION_STORAGE_KEY = 'docuflash_auth_session'
export const OAUTH_PROVIDERS: readonly OAuthProvider[] = ['google', 'github']
export const OAUTH_NATIVE_REDIRECT_URL = 'docuflashmobile://auth'
export const RESET_PASSWORD_REDIRECT_URL = 'docuflashmobile://reset-password'
export const TOKEN_REFRESH_LEEWAY_SECONDS = 60
