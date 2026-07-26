import { useNearbyPresence } from '@/hooks/useNearbyPresence'
import { loadDiscoverable } from '@/lib/nearby'
import { isDiscoverableAtom } from '@/state/nearbyAtoms'
import { useAuth } from '@/state/AuthProvider'
import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

export function NearbyController() {
  const { status } = useAuth()
  const setDiscoverable = useSetAtom(isDiscoverableAtom)

  useEffect(() => {
    if (status !== 'authenticated') return
    void loadDiscoverable().then(setDiscoverable)
  }, [status, setDiscoverable])

  useNearbyPresence()
  return null
}
