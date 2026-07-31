import { getNetworkKey } from '@/lib/api/network'
import { logApiEvent } from '@/lib/logger'
import { buildSelfDevice, channelNameForNetwork, setActiveNearbyChannel } from '@/lib/nearby'
import { getSupabaseClient } from '@/lib/supabase'
import { incomingTransferAtom, isDiscoverableAtom, nearbyDevicesAtom, nearbyToastAtom } from '@/state/nearbyAtoms'
import { useAuth } from '@/state/AuthProvider'
import type { NearbyDevice, TransferSignal } from '@/types/nearby'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'

export function useNearbyPresence() {
  const { user, status } = useAuth()
  const isDiscoverable = useAtomValue(isDiscoverableAtom)
  const setDevices = useSetAtom(nearbyDevicesAtom)
  const setToast = useSetAtom(nearbyToastAtom)
  const setIncoming = useSetAtom(incomingTransferAtom)

  const [isForeground, setIsForeground] = useState(AppState.currentState === 'active')
  const knownIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => setIsForeground(next === 'active'))
    return () => sub.remove()
  }, [])

  const active = status === 'authenticated' && isDiscoverable && isForeground && !!user

  useEffect(() => {
    if (!active || !user) return

    let cancelled = false
    let channel: RealtimeChannel | null = null

    const self = buildSelfDevice(user)

    void (async () => {
      let networkKey: string
      try {
        networkKey = await getNetworkKey()
      } catch {
        return
      }
      if (cancelled) return

      const supabase = getSupabaseClient()
      const channelName = channelNameForNetwork(networkKey)
      const nextChannel = supabase.channel(channelName, {
        config: { presence: { key: user.id }, broadcast: { self: false } },
      })
      channel = nextChannel

      logApiEvent('REALTIME', channelName, 'subscribe')

      nextChannel
        .on('presence', { event: 'sync' }, () => {
          const state = nextChannel.presenceState<NearbyDevice>()
          const devices: NearbyDevice[] = []
          for (const key of Object.keys(state)) {
            if (key === user.id) continue
            const meta = state[key]?.[0]
            if (meta) devices.push(meta)
          }
          logApiEvent('REALTIME', channelName, 'presence sync', { devices: devices.length })
          const appeared = devices.some((device) => !knownIdsRef.current.has(device.id))
          knownIdsRef.current = new Set(devices.map((device) => device.id))
          setDevices(devices)
          if (appeared && devices.length > 0) {
            setToast({ message: 'Devices in your network', count: devices.length })
          }
        })
        .on('broadcast', { event: 'transfer' }, ({ payload }) => {
          logApiEvent('REALTIME', channelName, 'recv transfer', payload)
          const signal = payload as TransferSignal
          if (signal.to !== user.id || signal.kind !== 'request') return
          setIncoming({ from: signal.from, token: signal.token })
        })
        .subscribe((subStatus) => {
          logApiEvent('REALTIME', channelName, `status ${subStatus}`)
          if (subStatus === 'SUBSCRIBED') void nextChannel.track(self)
        })

      setActiveNearbyChannel(nextChannel)
    })()

    return () => {
      cancelled = true
      knownIdsRef.current = new Set()
      setDevices([])
      setActiveNearbyChannel(null)
      if (channel) {
        logApiEvent('REALTIME', channel.topic, 'unsubscribe')
        void getSupabaseClient().removeChannel(channel)
      }
    }
  }, [active, user, setDevices, setToast, setIncoming])
}
