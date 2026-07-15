import { OAUTH_NATIVE_REDIRECT_URL } from '@/constants/auth'
import { getOAuthUrl } from '@/lib/api/auth'
import { parseSessionFromCallbackUrl } from '@/lib/authCallback'
import type { AuthSession, OAuthProvider } from '@/types/auth'
import * as WebBrowser from 'expo-web-browser'

export async function signInWithOAuthProvider(provider: OAuthProvider): Promise<AuthSession | null> {
  const result = await WebBrowser.openAuthSessionAsync(getOAuthUrl(provider), OAUTH_NATIVE_REDIRECT_URL)
  if (result.type !== 'success') return null
  return parseSessionFromCallbackUrl(result.url)
}
