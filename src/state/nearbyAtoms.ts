import type { NearbyDevice } from '@/types/nearby'
import { atom } from 'jotai'

export const isDiscoverableAtom = atom(false)

export const nearbyDevicesAtom = atom<NearbyDevice[]>([])

export type NearbyToastState = { message: string; count: number } | null
export const nearbyToastAtom = atom<NearbyToastState>(null)

export type IncomingTransferState = { from: NearbyDevice; token: string } | null
export const incomingTransferAtom = atom<IncomingTransferState>(null)
