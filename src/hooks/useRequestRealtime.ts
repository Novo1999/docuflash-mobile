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

    channel
      .on('broadcast', { event: 'uploading' }, ({ payload }) => handlersRef.current.onUploading?.(payload as UploadingPayload))
      .on('broadcast', { event: 'upload-complete' }, () => handlersRef.current.onComplete?.())
      .subscribe()

    channelRef.current = channel

    return () => {
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [token])

  const broadcastUploading = (payload: UploadingPayload) => {
    void channelRef.current?.send({ type: 'broadcast', event: 'uploading', payload })
  }

  const broadcastComplete = () => {
    void channelRef.current?.send({ type: 'broadcast', event: 'upload-complete', payload: {} })
  }

  return { broadcastUploading, broadcastComplete }
}
