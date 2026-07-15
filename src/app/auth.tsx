import { OAuthButton } from '@/components/auth'
import { Icon } from '@/components/Icon'
import { AppText, Button, Field, Segmented } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { ApiError } from '@/lib/api/client'
import { authSchema, type AuthFormValues } from '@/lib/validation/auth'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import type { OAuthProvider } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, View } from 'react-native'

type Mode = 'signin' | 'signup'

export default function AuthScreen() {
  const { colors } = useTheme()
  const { login, loginWithGoogle, loginWithOAuth, register } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null)
  const [mode, setMode] = useState<Mode>('signin')
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { mode: 'signin', email: '', password: '', displayName: '' },
  })

  const switchMode = (next: Mode) => {
    setMode(next)
    setValue('mode', next)
    setError(null)
    clearErrors()
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      if (values.mode === 'signin') {
        await login({ email: values.email, password: values.password })
      } else {
        const { needsEmailConfirmation } = await register({
          email: values.email,
          password: values.password,
          displayName: values.displayName || undefined,
        })
        if (needsEmailConfirmation) {
          Alert.alert('Check your inbox', 'Confirm your email to finish creating your account, then sign in.')
          switchMode('signin')
        }
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.')
    }
  })

  const onGoogle = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (e) {
      console.warn('[google-signin] failed:', e)
      const detail =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? `${(e as { code?: string }).code ? `[${(e as { code?: string }).code}] ` : ''}${e.message}`
            : 'Google sign-in failed. Please try again.'
      setError(detail)
    } finally {
      setGoogleLoading(false)
    }
  }

  const onOAuth = async (provider: OAuthProvider) => {
    setError(null)
    setOauthLoading(provider)
    try {
      await loginWithOAuth(provider)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <Screen scroll contentStyle={{ paddingHorizontal: 30, paddingTop: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 34 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            backgroundColor: colors.primaryBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="lock" size={20} color={colors.accent} strokeWidth={1.7} />
        </View>
        <AppText variant="heading" size={20} color={colors.heading}>
          Docuflash
        </AppText>
      </View>

      <AppText variant="heading" size={30} color={colors.heading} lineHeight={34} style={{ marginBottom: 8 }}>
        {mode === 'signin' ? 'Welcome back.' : 'Create your account.'}
      </AppText>
      <AppText size={13.5} color={colors.muted} lineHeight={20} style={{ marginBottom: 26 }}>
        {mode === 'signin'
          ? 'Sign in to manage your encrypted links.'
          : 'Start sharing files that auto-delete on your schedule.'}
      </AppText>

      <View style={{ marginBottom: 22 }}>
        <Segmented
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'signin', label: 'Sign in' },
            { value: 'signup', label: 'Create account' },
          ]}
        />
      </View>

      <View style={{ gap: 16 }}>
        {mode === 'signup' ? (
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Name"
                icon="settings"
                placeholder="Ava Mercer"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName?.message}
              />
            )}
          />
        ) : null}
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
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Field
              label="Password"
              icon="lock"
              secure
              placeholder="Your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />
      </View>

      {mode === 'signin' ? (
        <View style={{ alignItems: 'flex-end', marginTop: 11 }}>
          <AppText weight="semibold" size={12} color={colors.accentText}>
            Forgot password?
          </AppText>
        </View>
      ) : null}

      {error ? (
        <AppText size={12.5} color={colors.danger} style={{ marginTop: 12 }}>
          {error}
        </AppText>
      ) : null}

      <Button
        title={mode === 'signin' ? 'Sign in' : 'Create account'}
        onPress={onSubmit}
        loading={isSubmitting}
        style={{ marginTop: 18 }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <AppText size={11} color={colors.mutedSoft}>
          or continue with
        </AppText>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <OAuthButton label="Google" onPress={onGoogle} loading={googleLoading} />
        <OAuthButton label="GitHub" icon onPress={() => onOAuth('github')} loading={oauthLoading === 'github'} />
      </View>

      <AppText size={11} color={colors.mutedSoft} style={{ textAlign: 'center', marginTop: 28, lineHeight: 18 }}>
        By continuing you agree to our Terms and Privacy Policy.
      </AppText>
    </Screen>
  )
}
