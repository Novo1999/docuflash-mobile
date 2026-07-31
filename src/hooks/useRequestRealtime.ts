import { getSupabaseClient } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useEffect, useRef } from 'react'

export type UploadingPayload = {
  fileName: string
  uploaderName: string | null
}

type Handlers = {
  onUploading?: (payload: UploadingPayload) => void
  onComplete?: () => void
}

export function useRequestRealtime(token: string, handlers: Handlers) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    if (!token) return

    const supabase = getSupabaseClient()
    const channel = supabase.channel(`request:${token}`, { config: { broadcast: { self: false } } })

    logApiEvent('REALTIME', `request:${token}`, 'subscribe')

    channel
      .on('broadcast', { event: 'uploading' }, ({ payload }) => {
        logApiEvent('REALTIME', `request:${token}`, 'recv uploading', payload)
        handlersRef.current.onUploading?.(payload as UploadingPayload)
      })
      .on('broadcast', { event: 'upload-complete' }, () => {
        logApiEvent('REALTIME', `request:${token}`, 'recv upload-complete')
        handlersRef.current.onComplete?.()
      })
      .subscribe((status) => logApiEvent('REALTIME', `request:${token}`, `status ${status}`))

    channelRef.current = channel

    return () => {
      logApiEvent('REALTIME', `request:${token}`, 'unsubscribe')
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [token])

  const broadcastUploading = (payload: UploadingPayload) => {
    logApiEvent('REALTIME', `request:${token}`, 'send uploading', payload)
    void channelRef.current?.send({ type: 'broadcast', event: 'uploading', payload })
  }

  const broadcastComplete = () => {
    logApiEvent('REALTIME', `request:${token}`, 'send upload-complete')
    void channelRef.current?.send({ type: 'broadcast', event: 'upload-complete', payload: {} })
  }

  return { broadcastUploading, broadcastComplete }
}
