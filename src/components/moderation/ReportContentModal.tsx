import { Icon } from '@/components/Icon'
import { AppText, Button } from '@/components/ui'
import { createReport } from '@/lib/api/moderation'
import { useTheme } from '@/theme/ThemeProvider'
import { REPORT_REASON_OPTIONS, type ReportReason, type ReportTargetType } from '@/types/moderation'
import { useState } from 'react'
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native'

const MAX_DETAILS_LENGTH = 2000

type Props = {
  visible: boolean
  targetType: ReportTargetType
  shareToken: string
  targetName?: string
  onClose: () => void
}

export function ReportContentModal({ visible, targetType, shareToken, targetName, onClose }: Props) {
  const { colors, radii } = useTheme()
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = () => {
    setReason(null)
    setDetails('')
    setSubmitting(false)
    setSubmitted(false)
    setError(null)
    onClose()
  }

  const submit = async () => {
    if (!reason) {
      setError('Choose what is wrong with this content.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createReport({ targetType, shareToken, reason, details: details.trim() || undefined })
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not send the report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={submitting ? undefined : close}>
      <Pressable
        onPress={submitting ? undefined : close}
        style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <Pressable
          onPress={() => {}}
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
          {submitted ? (
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
                <Icon name="check" size={24} color={colors.accentText} />
              </View>
              <AppText variant="heading" size={19} color={colors.heading} style={{ textAlign: 'center' }}>
                Report received
              </AppText>
              <AppText size={13.5} color={colors.muted} style={{ textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                We review every report. If this content breaks our rules we will remove it and act on the account responsible.
              </AppText>
              <Button title="Done" onPress={close} style={{ marginTop: 22, width: '100%' }} />
            </View>
          ) : (
            <>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.dangerSoftBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Icon name="flag" size={24} color={colors.danger} />
                </View>
                <AppText variant="heading" size={19} color={colors.heading} style={{ textAlign: 'center' }}>
                  Report this {targetType}
                </AppText>
                {targetName ? (
                  <AppText size={13} color={colors.muted} style={{ textAlign: 'center', marginTop: 6 }} numberOfLines={2}>
                    {targetName}
                  </AppText>
                ) : null}
              </View>

              <ScrollView style={{ marginTop: 18 }} keyboardShouldPersistTaps="handled">
                <AppText size={13} weight="semibold" color={colors.heading} style={{ marginBottom: 8 }}>
                  What is wrong with it?
                </AppText>

                <View style={{ gap: 8 }}>
                  {REPORT_REASON_OPTIONS.map((option) => {
                    const selected = reason === option.value
                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        accessibilityLabel={option.label}
                        onPress={() => {
                          setReason(option.value)
                          setError(null)
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingVertical: 11,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: selected ? colors.accentText : colors.border,
                          backgroundColor: selected ? colors.accentSoftBg : 'transparent',
                          borderRadius: radii.lg,
                          borderCurve: 'continuous',
                        }}
                      >
                        <View
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 9,
                            borderWidth: 2,
                            borderColor: selected ? colors.accentText : colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {selected ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentText }} /> : null}
                        </View>
                        <AppText size={13.5} color={selected ? colors.heading : colors.muted} style={{ flex: 1 }}>
                          {option.label}
                        </AppText>
                      </Pressable>
                    )
                  })}
                </View>

                <AppText size={13} weight="semibold" color={colors.heading} style={{ marginTop: 18, marginBottom: 8 }}>
                  Details (optional)
                </AppText>
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  multiline
                  maxLength={MAX_DETAILS_LENGTH}
                  accessibilityLabel="Report details"
                  placeholder="Tell us what you found, so we can review it faster."
                  placeholderTextColor={colors.mutedSoft}
                  style={{
                    minHeight: 80,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    borderCurve: 'continuous',
                    paddingHorizontal: 12,
                    paddingTop: 10,
                    paddingBottom: 10,
                    color: colors.heading,
                    fontSize: 13.5,
                    textAlignVertical: 'top',
                  }}
                />

                {error ? (
                  <AppText size={12.5} color={colors.danger} style={{ marginTop: 10 }}>
                    {error}
                  </AppText>
                ) : null}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                <Button title="Cancel" variant="outline" onPress={close} disabled={submitting} style={{ flex: 1 }} />
                <Button title="Send report" variant="danger" onPress={submit} loading={submitting} style={{ flex: 1 }} />
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
