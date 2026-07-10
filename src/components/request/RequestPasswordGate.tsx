import { Icon } from '@/components/Icon'
import { AppText, Button, Field } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useState } from 'react'
import { View } from 'react-native'

type RequestPasswordGateProps = {
  folderName: string
  error: string | null
  unlocking: boolean
  onUnlock: (password: string) => void
  onPasswordChange?: () => void
}

export function RequestPasswordGate({ folderName, error, unlocking, onUnlock, onPasswordChange }: RequestPasswordGateProps) {
  const { colors } = useTheme()
  const [password, setPassword] = useState('')

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <View style={{ width: 74, height: 74, borderRadius: 18, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={32} color={colors.accent} strokeWidth={1.6} />
      </View>

      <AppText variant="heading" size={23} color={colors.heading} style={{ marginTop: 20, textAlign: 'center' }}>
        {folderName}
      </AppText>
      <AppText size={13} color={colors.muted} lineHeight={20} style={{ marginTop: 8, textAlign: 'center' }}>
        This dropzone is password protected. Enter the password you were given to upload files.
      </AppText>

      <View style={{ width: '100%', marginTop: 24, gap: 12 }}>
        <Field
          icon="lock"
          secure
          placeholder="Enter password to unlock"
          value={password}
          onChangeText={(value) => {
            setPassword(value)
            onPasswordChange?.()
          }}
        />
        {error ? (
          <AppText size={12.5} color={colors.danger}>
            {error}
          </AppText>
        ) : null}
        <Button title="Unlock" icon="lock" onPress={() => onUnlock(password.trim())} loading={unlocking} disabled={password.trim().length === 0} />
      </View>
    </View>
  )
}
