import type { AuthSession } from '@/types/auth'

function decodeFragmentValue(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, '%20'))
}

export function parseSessionFromCallbackUrl(url: string): AuthSession {
  const fragment = url.split('#')[1] ?? ''
  const params: Record<string, string> = {}
  for (const pair of fragment.split('&')) {
    if (!pair) continue
    const [key, ...rest] = pair.split('=')
    params[decodeFragmentValue(key)] = decodeFragmentValue(rest.join('='))
  }

  if (params.error_description || params.error) throw new Error(params.error_description || params.error)

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
