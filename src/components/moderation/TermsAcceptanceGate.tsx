import { Icon } from '@/components/Icon'
import { AppText, Button } from '@/components/ui'
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/constants/legal'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import { useState } from 'react'
import { Alert, Linking, Modal, Pressable, ScrollView, View } from 'react-native'

const PROHIBITED_SUMMARY = [
  'Child sexual abuse material or anything that sexualises a minor',
  'Non-consensual intimate imagery',
  'Illegal content, or content that facilitates a crime',
  'Malware or files built to harm a recipient',
  'Harassment, threats, or hate speech',
  'Content that infringes someone else’s rights',
  'Spam, phishing, or fraud',
]

export function TermsAcceptanceGate() {
  const { colors, radii } = useTheme()
  const { needsTermsAcceptance, acceptTerms, logout } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openUrl = async (url: string, label: string) => {
    try {
      await Linking.openURL(url)
    } catch {
      Alert.alert(`Unable to open ${label}`, `Please visit ${url} in your browser.`)
    }
  }

  const onAccept = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await acceptTerms()
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : 'Could not record your acceptance. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const onDecline = () => {
    Alert.alert('Sign out?', 'You need to accept the Terms of Use to keep using Docuflash.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ])
  }

  return (
    <Modal visible={needsTermsAcceptance} transparent animationType="fade" statusBarTranslucent onRequestClose={onDecline}>
      <View style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            maxHeight: '86%',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radii.xl,
            borderCurve: 'continuous',
            paddingHorizontal: 22,
            paddingTop: 24,
            paddingBottom: 18,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.accentSoftBg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Icon name="shield" size={24} color={colors.accentText} />
            </View>
            <AppText variant="heading" size={19} color={colors.heading} style={{ textAlign: 'center' }}>
              Accept the Terms of Use
            </AppText>
            <AppText size={13.5} color={colors.muted} style={{ textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
              Before you upload or share again, please accept the Docuflash Terms of Use.
            </AppText>
          </View>

          <ScrollView style={{ marginTop: 18 }} keyboardShouldPersistTaps="handled">
            <AppText size={13} weight="semibold" color={colors.heading} style={{ marginBottom: 8 }}>
              You may not upload or share:
            </AppText>

            <View style={{ gap: 7 }}>
              {PROHIBITED_SUMMARY.map((item) => (
                <View key={item} style={{ flexDirection: 'row', gap: 8 }}>
                  <AppText size={13} color={colors.mutedSoft}>
                    •
                  </AppText>
                  <AppText size={13} color={colors.muted} style={{ flex: 1, lineHeight: 19 }}>
                    {item}
                  </AppText>
                </View>
              ))}
            </View>

            <AppText size={12.5} color={colors.muted} style={{ marginTop: 14, lineHeight: 19 }}>
              We remove content that breaks these rules and may suspend the account responsible. Anyone who receives a Docuflash link can report it.
            </AppText>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 14 }}>
              <Pressable accessibilityRole="link" accessibilityLabel="Read the full Terms of Use" hitSlop={8} onPress={() => openUrl(TERMS_OF_USE_URL, 'Terms of Use')}>
                <AppText size={12.5} weight="semibold" color={colors.accentText}>
                  Read the full Terms
                </AppText>
              </Pressable>
              <AppText size={12.5} color={colors.mutedSoft}>
                {'  ·  '}
              </AppText>
              <Pressable accessibilityRole="link" accessibilityLabel="Read the Privacy Policy" hitSlop={8} onPress={() => openUrl(PRIVACY_POLICY_URL, 'Privacy Policy')}>
                <AppText size={12.5} weight="semibold" color={colors.accentText}>
                  Privacy Policy
                </AppText>
              </Pressable>
            </View>

            {error ? (
              <AppText size={12.5} color={colors.danger} style={{ marginTop: 12 }}>
                {error}
              </AppText>
            ) : null}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Button title="Decline" variant="outline" onPress={onDecline} disabled={submitting} style={{ flex: 1 }} />
            <Button title="Accept" onPress={onAccept} loading={submitting} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  )
}
