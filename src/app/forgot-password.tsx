import { Icon } from '@/components/Icon'
import { AppText, Button, Field } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { forgotPassword } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validation/auth'
import { useTheme } from '@/theme/ThemeProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Pressable, View } from 'react-native'

export default function ForgotPasswordScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [sentToEmail, setSentToEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await forgotPassword(values.email)
      setSentToEmail(values.email)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.')
    }
  })

  const goBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/auth')
    }
  }

  return (
    <Screen scroll contentStyle={{ paddingHorizontal: 30, paddingTop: 12 }}>
      <Pressable onPress={goBack} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 30 }}>
        <Icon name="chevron-left" size={20} color={colors.accentText} />
        <AppText weight="semibold" size={13} color={colors.accentText}>
          Back to sign in
        </AppText>
      </Pressable>

      {sentToEmail ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.primaryBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 18,
            }}
          >
            <Icon name="mail" size={26} color={colors.accent} />
          </View>
          <AppText variant="heading" size={24} color={colors.heading} style={{ marginBottom: 10, textAlign: 'center' }}>
            Check your inbox.
          </AppText>
          <AppText size={13.5} color={colors.muted} lineHeight={20} style={{ textAlign: 'center', marginBottom: 26 }}>
            If an account exists for {sentToEmail}, we sent a link to reset your password. Open it on this device to continue.
          </AppText>
          <Button title="Back to sign in" onPress={goBack} style={{ alignSelf: 'stretch' }} />
        </View>
      ) : (
        <>
          <AppText variant="heading" size={30} color={colors.heading} lineHeight={34} style={{ marginBottom: 8 }}>
            Forgot your password?
          </AppText>
          <AppText size={13.5} color={colors.muted} lineHeight={20} style={{ marginBottom: 26 }}>
            Enter the email you signed up with and we&apos;ll send you a link to reset it.
          </AppText>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Email"
                icon="mail"
                placeholder="ava@studio.co"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          {error ? (
            <AppText size={12.5} color={colors.danger} style={{ marginTop: 12 }}>
              {error}
            </AppText>
          ) : null}

          <Button title="Send reset link" onPress={onSubmit} loading={isSubmitting} style={{ marginTop: 22 }} />
        </>
      )}
    </Screen>
  )
}
