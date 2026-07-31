// Lightweight API call logger. Gated on __DEV__ so production builds stay quiet.
type ApiKind = 'REST' | 'UPLOAD' | 'REALTIME'

const time = () => new Date().toISOString()

export function logApiRequest(kind: ApiKind, method: string, target: string, detail?: unknown): void {
  if (!__DEV__) return
  console.log(`[API ${kind}] → ${method} ${target}`, detail ?? '')
}

export function logApiResponse(kind: ApiKind, method: string, target: string, status: number | string, ms: number): void {
  if (!__DEV__) return
  console.log(`[API ${kind}] ← ${method} ${target} ${status} (${Math.round(ms)}ms)`)
}

export function logApiError(kind: ApiKind, method: string, target: string, error: unknown, ms?: number): void {
  if (!__DEV__) return
  const suffix = typeof ms === 'number' ? ` (${Math.round(ms)}ms)` : ''
  console.error(`[API ${kind}] ✖ ${method} ${target}${suffix}`, error)
}

export function logApiEvent(kind: ApiKind, target: string, event: string, detail?: unknown): void {
  if (!__DEV__) return
  console.log(`[API ${kind}] • ${target} ${event} @ ${time()}`, detail ?? '')
}
