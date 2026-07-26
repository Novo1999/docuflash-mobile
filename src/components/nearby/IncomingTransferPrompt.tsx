import { Icon } from '@/components/Icon'
import { AppText, Button } from '@/components/ui'
import { incomingTransferAtom } from '@/state/nearbyAtoms'
import { useTheme } from '@/theme/ThemeProvider'
import { useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { Modal, Pressable, View } from 'react-native'

export function IncomingTransferPrompt() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const [incoming, setIncoming] = useAtom(incomingTransferAtom)

  const onDecline = () => setIncoming(null)

  const onAccept = () => {
    if (!incoming) return
    const token = incoming.token
    setIncoming(null)
    router.push(`/request/${token}`)
  }

  return (
    <Modal visible={!!incoming} transparent animationType="fade" onRequestClose={onDecline}>
      <Pressable
        onPress={onDecline}
        style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 26 }}
      >
        <Pressable
          onPress={() => undefined}
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 22,
            gap: 8,
          }}
        >
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
            <Icon name="upload" size={24} color={colors.accent} />
          </View>
          <AppText variant="heading" size={19} color={colors.heading}>
            File request
          </AppText>
          <AppText size={13} color={colors.muted} lineHeight={19}>
            <AppText weight="semibold" size={13} color={colors.text}>
              {incoming?.from.displayName ?? 'Someone'}
            </AppText>{' '}
            is asking you to send them files.
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Button title="Not now" variant="outline" onPress={onDecline} style={{ flex: 1 }} />
            <Button title="Send files" icon="upload" onPress={onAccept} style={{ flex: 1 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
