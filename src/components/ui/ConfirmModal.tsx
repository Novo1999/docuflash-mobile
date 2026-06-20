import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { Modal, Pressable, View } from 'react-native'
import { AppText } from './AppText'
import { Button } from './Button'

type Tone = 'default' | 'danger'

type Props = {
  visible: boolean
  title: string
  message?: string
  icon?: IconName
  tone?: Tone
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

/**
 * Reusable confirmation dialog styled to match the app's design system.
 * Centered card with an optional icon badge, title, message and two actions.
 */
export function ConfirmModal({
  visible,
  title,
  message,
  icon,
  tone = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const { colors, radii } = useTheme()
  const isDanger = tone === 'danger'

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        onPress={loading ? undefined : onClose}
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 28,
        }}
      >
        {/* Stop backdrop press from closing when tapping the card itself */}
        <Pressable
          onPress={() => {}}
          style={{
            width: '100%',
            maxWidth: 360,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.xl,
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: 18,
            alignItems: 'center',
          }}
        >
          {icon ? (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: isDanger ? colors.dangerSoftBg : colors.accentSoftBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Icon name={icon} size={24} color={isDanger ? colors.danger : colors.accentText} />
            </View>
          ) : null}

          <AppText variant="heading" size={19} color={colors.heading} style={{ textAlign: 'center' }}>
            {title}
          </AppText>

          {message ? (
            <AppText size={13.5} color={colors.muted} style={{ textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              {message}
            </AppText>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22, width: '100%' }}>
            <Button title={cancelLabel} variant="outline" onPress={onClose} disabled={loading} style={{ flex: 1 }} />
            <Button
              title={confirmLabel}
              variant={isDanger ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
