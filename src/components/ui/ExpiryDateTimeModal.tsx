import { useTheme } from '@/theme/ThemeProvider'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { useEffect, useRef, useState } from 'react'
import { Modal, Platform, Pressable, View } from 'react-native'
import { AppText } from './AppText'
import { Button } from './Button'

type Props = {
  visible: boolean
  value: Date
  onConfirm: (date: Date) => void
  onClose: () => void
}

function formatPreview(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ExpiryDateTimeModal(props: Props) {
  // Android shows a native dialog (no RN Modal); iOS renders an inline bottom sheet.
  return Platform.OS === 'android' ? <AndroidExpiryPicker {...props} /> : <IOSExpiryPicker {...props} />
}

/**
 * Android: the native pickers present themselves as dialogs. We open the date
 * picker first, then chain into the time picker, merging both into one Date.
 */
function AndroidExpiryPicker({ visible, value, onConfirm, onClose }: Props) {
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

function IOSExpiryPicker({ visible, value, onConfirm, onClose }: Props) {
  const { colors, radii, mode } = useTheme()
  const [draft, setDraft] = useState(value)
  const [minDate, setMinDate] = useState(() => new Date())

  useEffect(() => {
    if (visible) {
      setDraft(value)
      setMinDate(new Date())
    }
  }, [visible, value])

  const isPast = draft.getTime() <= minDate.getTime()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />
      <View
        style={{
          backgroundColor: colors.screen,
          paddingHorizontal: 22,
          paddingTop: 18,
          paddingBottom: 34,
          borderTopLeftRadius: radii.xl,
          borderTopRightRadius: radii.xl,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="heading" size={17} color={colors.heading}>
            Custom expiry
          </AppText>
          <AppText size={13} color={colors.accentText} weight="semibold">
            {formatPreview(draft)}
          </AppText>
        </View>

        <View style={{ marginTop: 6, alignItems: 'center' }}>
          <DateTimePicker
            value={draft}
            mode="datetime"
            display="inline"
            minimumDate={minDate}
            themeVariant={mode === 'dark' ? 'dark' : 'light'}
            accentColor={colors.accent}
            onChange={(_, date) => date && setDraft(date)}
          />
        </View>

        {isPast ? (
          <AppText size={12} color={colors.danger} style={{ marginTop: 4 }}>
            Pick a time in the future.
          </AppText>
        ) : null}

        <Button
          title="Set expiry"
          onPress={() => !isPast && onConfirm(draft)}
          disabled={isPast}
          style={{ marginTop: 16 }}
        />
      </View>
    </Modal>
  )
}
