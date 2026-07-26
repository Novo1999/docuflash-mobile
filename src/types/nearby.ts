export type NearbyDevice = {
  id: string
  displayName: string
  avatarUrl: string | null
  platform: string
  deviceName: string
  at: number
}

export type TransferSignal = {
  kind: 'request'
  from: NearbyDevice
  to: string
  token: string
}
