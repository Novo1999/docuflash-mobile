import { OAUTH_NATIVE_REDIRECT_URL } from '@/constants/auth'
import { getOAuthUrl } from '@/lib/api/auth'
import type { AuthSession, OAuthProvider } from '@/types/auth'
import * as WebBrowser from 'expo-web-browser'

export async function signInWithOAuthProvider(provider: OAuthProvider): Promise<AuthSession | null> {
  const result = await WebBrowser.openAuthSessionAsync(getOAuthUrl(provider), OAUTH_NATIVE_REDIRECT_URL)
  if (result.type !== 'success') return null
  return parseSessionFromCallbackUrl(result.url)
}

function decodeFragmentValue(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, '%20'))
}

function parseSessionFromCallbackUrl(url: string): AuthSession {
  const fragment = url.split('#')[1] ?? ''
  const params: Record<string, string> = {}
  for (const pair of fragment.split('&')) {
    if (!pair) continue
    const [key, ...rest] = pair.split('=')
    params[decodeFragmentValue(key)] = decodeFragmentValue(rest.join('='))
  }

  if (params.error) throw new Error(params.error)

  const { access_token: accessToken, refresh_token: refreshToken } = params
  if (!accessToken || !refreshToken) throw new Error('Sign-in did not return a session')

  const expiresAt = Number(params.expires_at) || 0
  return {
    accessToken,
    refreshToken,
    expiresAt,
    expiresIn: expiresAt ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000)) : 0,
    tokenType: params.token_type || 'bearer',
  }
}
