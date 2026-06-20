import { EXTENSION_TO_FILE_TYPE, MIME_TO_FILE_TYPE, SHARE_BASE_URL } from '@/constants/upload'
import { FileType } from '@/types/file'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'
import * as Device from 'expo-device'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'

const CLIENT_ID_STORAGE_KEY = 'docuflash_client_id'
let cachedClientId: string | null = null

export type PickedFile = {
  name: string
  size: number
  mimeType?: string | null
  uri: string
}

export function resolveFileType(file: { name: string; mimeType?: string | null }): FileType | null {
  if (file.mimeType) {
    const mimeMatch = MIME_TO_FILE_TYPE[file.mimeType]
    if (mimeMatch) return mimeMatch
  }
  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension ? EXTENSION_TO_FILE_TYPE[extension] ?? null : null
}

export async function getClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId
  try {
    const stored = await AsyncStorage.getItem(CLIENT_ID_STORAGE_KEY)
    if (stored) {
      cachedClientId = stored
      return stored
    }
  } catch {
    // fall through to mint a new id
  }
  const id = Crypto.randomUUID()
  cachedClientId = id
  try {
    await AsyncStorage.setItem(CLIENT_ID_STORAGE_KEY, id)
  } catch {
    // continue with the in-memory id even if persistence fails
  }
  return id
}

export function getDeviceInfo(): Record<string, unknown> {
  return {
    deviceType: 'mobile',
    browser: 'Docuflash Mobile',
    os: `${Device.osName ?? Platform.OS}${Device.osVersion ? ` ${Device.osVersion}` : ''}`,
    userAgent: `Docuflash/${Platform.OS}`,
    platform: Platform.OS,
    model: Device.modelName ?? 'Unknown',
  }
}

export function getShareLink(shareToken: string): string {
  return `${SHARE_BASE_URL}/share/${shareToken}`
}

export function getFolderShareLink(shareToken: string): string {
  return `${SHARE_BASE_URL}/folder/${shareToken}`
}

export function getDeepLink(shareToken: string): string {
  return Linking.createURL(`share/${shareToken}`)
}

export function getFolderDeepLink(shareToken: string): string {
  return Linking.createURL(`folder/${shareToken}`)
}

export function computeExpireAt(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, i)
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`
}

export function formatExpiry(expireAt?: string): string {
  if (!expireAt) return '—'
  const diffMs = new Date(expireAt).getTime() - Date.now()
  if (diffMs <= 0) return 'Expired'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days >= 1) return `${days} day${days > 1 ? 's' : ''} left`
  if (hours >= 1) return `${hours} hr${hours > 1 ? 's' : ''} left`
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)))
  return `${mins} min left`
}

export function shortExpiryBadge(expireAt?: string): string {
  if (!expireAt) return '—'
  const diffMs = new Date(expireAt).getTime() - Date.now()
  if (diffMs <= 0) return '0h'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days >= 1) return `${days}d`
  return `${Math.max(1, hours)}h`
}
