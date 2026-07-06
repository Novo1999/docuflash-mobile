import { useTheme } from '@/theme/ThemeProvider'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useEffect, useState } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { AppText } from '../AppText'
import { Button } from '../Button'
import type { ExpiryPickerProps } from './types'

function formatPreview(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function IOSExpiryPicker({ visible, value, onConfirm, onClose }: ExpiryPickerProps) {
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
