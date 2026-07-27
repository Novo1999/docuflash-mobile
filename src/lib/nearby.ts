import { getDeviceInfo } from '@/lib/upload'
import type { AuthUser } from '@/types/auth'
import type { NearbyDevice, TransferSignal } from '@/types/nearby'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { RealtimeChannel } from '@supabase/supabase-js'

const DISCOVERABLE_STORAGE_KEY = 'docuflash_nearby_discoverable'

export function channelNameForNetwork(networkKey: string): string {
  return `network:${networkKey}`
}

export function buildSelfDevice(user: AuthUser): NearbyDevice {
  return {
    id: user.id,
    displayName: user.displayName ?? user.email,
    avatarUrl: user.avatarUrl,
    platform: 'mobile',
    deviceName: String(getDeviceInfo().model ?? 'Mobile device'),
    at: Date.now(),
  }
}

export async function loadDiscoverable(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DISCOVERABLE_STORAGE_KEY)) === 'true'
  } catch {
    return false
  }
}

export async function persistDiscoverable(value: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(DISCOVERABLE_STORAGE_KEY, value ? 'true' : 'false')
  } catch {
    return
  }
}

let activeChannel: RealtimeChannel | null = null

export function setActiveNearbyChannel(channel: RealtimeChannel | null): void {
  activeChannel = channel
}

export function sendTransferSignal(signal: TransferSignal): void {
  void activeChannel?.send({ type: 'broadcast', event: 'transfer', payload: signal })
}
