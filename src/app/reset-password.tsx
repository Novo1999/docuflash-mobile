import { Icon } from '@/components/Icon'
import { AppText, Button, Field } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { ApiError } from '@/lib/api/client'
import { parseSessionFromCallbackUrl } from '@/lib/authCallback'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validation/auth'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import type { AuthSession } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLinkingURL } from 'expo-linking'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { View } from 'react-native'

export default function ResetPasswordScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const { completePasswordReset } = useAuth()
  const url = useLinkingURL()
  const [error, setError] = useState<string | null>(null)

  const recovery = useMemo<{ session: AuthSession | null; linkError: string | null }>(() => {
    if (!url || !url.includes('reset-password')) {
      return { session: null, linkError: 'This reset link is invalid or has expired. Request a new one and try again.' }
    }
    try {
      return { session: parseSessionFromCallbackUrl(url), linkError: null }
    } catch (e) {
      return { session: null, linkError: e instanceof Error ? e.message : 'This reset link is invalid or has expired.' }
    }
  }, [url])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!recovery.session) return
    setError(null)
    try {
      await completePasswordReset({
        accessToken: recovery.session.accessToken,
        refreshToken: recovery.session.refreshToken,
        password: values.password,
      })
      router.replace('/(tabs)')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not update your password. Please try again.')
    }
  })

  if (recovery.linkError) {
    return (
      <Screen scroll contentStyle={{ paddingHorizontal: 30, paddingTop: 12 }}>
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
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
            <Icon name="lock" size={26} color={colors.accent} />
          </View>
          <AppText variant="heading" size={24} color={colors.heading} style={{ marginBottom: 10, textAlign: 'center' }}>
            Link expired.
          </AppText>
          <AppText size={13.5} color={colors.muted} lineHeight={20} style={{ textAlign: 'center', marginBottom: 26 }}>
            {recovery.linkError}
          </AppText>
          <Button title="Request a new link" onPress={() => router.replace('/forgot-password')} style={{ alignSelf: 'stretch' }} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen scroll contentStyle={{ paddingHorizontal: 30, paddingTop: 12 }}>
      <AppText variant="heading" size={30} color={colors.heading} lineHeight={34} style={{ marginBottom: 8 }}>
        Choose a new password.
      </AppText>
      <AppText size={13.5} color={colors.muted} lineHeight={20} style={{ marginBottom: 26 }}>
        Enter a new password for your account. You&apos;ll be signed in once it&apos;s updated.
      </AppText>

      <View style={{ gap: 16 }}>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Field
              label="New password"
              icon="lock"
              secure
              placeholder="At least 8 characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Field
              label="Confirm password"
              icon="lock"
              secure
              placeholder="Repeat your new password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmPassword?.message}
            />
          )}
        />
      </View>

      {error ? (
        <AppText size={12.5} color={colors.danger} style={{ marginTop: 12 }}>
          {error}
        </AppText>
      ) : null}

      <Button title="Update password" onPress={onSubmit} loading={isSubmitting} style={{ marginTop: 22 }} />
    </Screen>
  )
}
