import { Platform } from 'react-native'
import { AndroidExpiryPicker } from './expiry/AndroidExpiryPicker'
import { IOSExpiryPicker } from './expiry/IOSExpiryPicker'
import type { ExpiryPickerProps } from './expiry/types'

export function ExpiryDateTimeModal(props: ExpiryPickerProps) {
  // Android shows a native dialog (no RN Modal); iOS renders an inline bottom sheet.
  return Platform.OS === 'android' ? <AndroidExpiryPicker {...props} /> : <IOSExpiryPicker {...props} />
}
