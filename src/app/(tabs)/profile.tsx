import { Icon, type IconName } from '@/components/Icon'
import { AppText, IconButton, Pill } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import type { ThemePreference } from '@/theme/tokens'
import { useState } from 'react'
import { Alert, Pressable, Switch, View } from 'react-native'

const APPEARANCE_LABEL: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

export default function ProfileScreen() {
  const { colors, radii, preference, setPreference } = useTheme()
  const { user, logout } = useAuth()
  const [downloadAlerts, setDownloadAlerts] = useState(true)

  const name = user?.displayName || user?.email?.split('@')[0] || 'Your account'
  const initial = name.trim().charAt(0).toUpperCase()

  const cycleAppearance = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(preference) + 1) % order.length]
    setPreference(next)
  }

  const onSignOut = () =>
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ])

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 22 }}>
        <AppText variant="heading" size={28} color={colors.heading}>
          Profile
        </AppText>
        <IconButton name="settings" size={36} iconSize={17} strokeWidth={1.5} />
      </View>

      <View style={{ alignItems: 'center', marginBottom: 22 }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: colors.primaryBg,
            borderWidth: 2.5,
            borderColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText variant="heading" size={30} color={colors.accent}>
            {initial}
          </AppText>
        </View>
        <AppText variant="heading" size={21} color={colors.heading} style={{ marginTop: 14 }}>
          {name}
        </AppText>
        {user?.email ? (
          <AppText size={13} color={colors.mutedSoft} style={{ marginTop: 3 }}>
            {user.email}
          </AppText>
        ) : null}
        <Pill label="Pro · 10 GB" tone="accent" style={{ marginTop: 11 }} />
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 11 }}>
          <AppText weight="semibold" size={12.5}>
            Storage
          </AppText>
          <AppText size={12} color={colors.mutedSoft}>
            3.4 GB of 10 GB
          </AppText>
        </View>
        <View style={{ height: 8, borderRadius: 5, backgroundColor: colors.segmentBg, overflow: 'hidden' }}>
          <View style={{ width: '34%', height: '100%', borderRadius: 5, backgroundColor: colors.accent }} />
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg,
          overflow: 'hidden',
        }}
      >
        <SettingRow icon="clock" label="Default expiry" value="7 days" />
        <SettingRow icon="lock" label="Default privacy" value="Protected" />
        <SettingRow
          icon="bell"
          label="Download alerts"
          right={
            <Switch
              value={downloadAlerts}
              onValueChange={setDownloadAlerts}
              trackColor={{ true: colors.accent, false: colors.segmentBg }}
              thumbColor={colors.surface}
            />
          }
        />
        <SettingRow icon="appearance" label="Appearance" value={APPEARANCE_LABEL[preference]} onPress={cycleAppearance} last />
      </View>

      <Pressable
        onPress={onSignOut}
        style={({ pressed }) => ({
          marginTop: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: 1,
          borderColor: colors.dangerBorder,
          borderRadius: radii.md + 1,
          paddingVertical: 14,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Icon name="logout" size={16} color={colors.danger} strokeWidth={1.7} />
        <AppText weight="semibold" size={14} color={colors.danger}>
          Sign out
        </AppText>
      </Pressable>
    </Screen>
  )
}

function SettingRow({
  icon,
  label,
  value,
  right,
  onPress,
  last,
}: {
  icon: IconName
  label: string
  value?: string
  right?: React.ReactNode
  onPress?: () => void
  last?: boolean
}) {
  const { colors } = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Icon name={icon} size={18} color={colors.muted} strokeWidth={1.6} />
      <AppText weight="medium" size={13.5} style={{ flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText weight="semibold" size={12.5} color={colors.mutedSoft}>
          {value}
        </AppText>
      ) : null}
      {right}
      {onPress || value ? (right ? null : <Icon name="chevron-right" size={16} color={colors.mutedSoft} strokeWidth={2} />) : null}
    </Pressable>
  )
}
