import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { useEffect, useRef } from 'react'
import type { ExpiryPickerProps } from './types'

/**
 * Android: the native pickers present themselves as dialogs. We open the date
 * picker first, then chain into the time picker, merging both into one Date.
 */
export function AndroidExpiryPicker({ visible, value, onConfirm, onClose }: ExpiryPickerProps) {
  const openedRef = useRef(false)

  useEffect(() => {
    if (!visible) {
      openedRef.current = false
      return
    }
    if (openedRef.current) return
    openedRef.current = true

    const openTime = (base: Date) => {
      DateTimePickerAndroid.open({
        value: base,
        mode: 'time',
        is24Hour: false,
        onChange: (event, time) => {
          if (event.type === 'set' && time) {
            const next = new Date(base)
            next.setHours(time.getHours(), time.getMinutes(), 0, 0)
            onConfirm(next)
          } else {
            onClose()
          }
        },
      })
    }

    DateTimePickerAndroid.open({
      value,
      mode: 'date',
      minimumDate: new Date(),
      onChange: (event, date) => {
        if (event.type === 'set' && date) {
          const base = new Date(value)
          base.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
          openTime(base)
        } else {
          onClose()
        }
      },
    })
  }, [visible, value, onConfirm, onClose])

  return null
}
