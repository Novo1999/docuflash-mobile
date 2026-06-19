import { AUTH_SESSION_STORAGE_KEY, TOKEN_REFRESH_LEEWAY_SECONDS } from '@/constants/auth'
import type { AuthSession } from '@/types/auth'
import * as SecureStore from 'expo-secure-store'

// In-memory cache so the API client can read the token synchronously,
// mirroring the web app's localStorage-backed getStoredAccessToken().
let currentSession: AuthSession | null = null

export function getAccessToken(): string | null {
  return currentSession?.accessToken ?? null
}

export function getSession(): AuthSession | null {
  return currentSession
}

export async function persistSession(session: AuthSession | null): Promise<void> {
  currentSession = session
  try {
    if (session) {
      await SecureStore.setItemAsync(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
    } else {
      await SecureStore.deleteItemAsync(AUTH_SESSION_STORAGE_KEY)
    }
  } catch {
    // Persistence is best-effort; the in-memory session still works for this run.
  }
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(AUTH_SESSION_STORAGE_KEY)
    currentSession = raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    currentSession = null
  }
  return currentSession
}

export function isSessionExpired(session: AuthSession | null, leeway = TOKEN_REFRESH_LEEWAY_SECONDS): boolean {
  if (!session?.expiresAt || session.expiresAt <= 0) return false
  const nowSeconds = Math.floor(Date.now() / 1000)
  return session.expiresAt - leeway <= nowSeconds
}
