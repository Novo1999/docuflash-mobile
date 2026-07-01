import { Icon, type IconName } from '@/components/Icon'
import { AppText, ConfirmModal, IconButton, Pill, Segmented } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { uploadAvatar } from '@/lib/avatar'
import { useAuth } from '@/state/AuthProvider'
import { useTheme } from '@/theme/ThemeProvider'
import type { ThemePreference } from '@/theme/tokens'
import { FileAccessType } from '@/types/file'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, View } from 'react-native'

const APPEARANCE_LABEL: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

export default function ProfileScreen() {
  const { colors, radii, preference, setPreference } = useTheme()
  const { user, logout, updateProfile } = useAuth()
  const initialExpiry = user?.defaultExpiry ?? '7d'
  const initialPrivacy = user?.defaultPrivacy === FileAccessType.PUBLIC ? FileAccessType.PUBLIC : FileAccessType.PROTECTED
  const [expiryKey, setExpiryKey] = useState(initialExpiry)
  const [privacy, setPrivacy] = useState<FileAccessType>(initialPrivacy)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)

  const name = user?.displayName || user?.email?.split('@')[0] || 'Your account'
  const initial = name.trim().charAt(0).toUpperCase()

  const handleAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploadingAvatar(true)
    try {
      const avatarUrl = await uploadAvatar(asset)
      await updateProfile({ avatarUrl })
    } catch {
      Alert.alert('Upload failed', 'Image must be under 1 MB. Please try a smaller image.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onPickFromGallery = async () => {
    if (uploadingAvatar) return
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to change your profile picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || !result.assets[0]) return
    await handleAsset(result.assets[0])
  }

  const onTakePhoto = async () => {
    if (uploadingAvatar) return
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a profile picture.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || !result.assets[0]) return
    await handleAsset(result.assets[0])
  }

  const saveSettings = async (newExpiryKey: string, newPrivacy: FileAccessType) => {
    if (!user) return
    try {
      await updateProfile({ defaultExpiry: newExpiryKey, defaultPrivacy: newPrivacy })
    } catch (error) {
      Alert.alert('Unable to save settings', error instanceof Error ? error.message : 'Try again.')
      setExpiryKey(user.defaultExpiry ?? '7d')
      setPrivacy(user.defaultPrivacy === FileAccessType.PUBLIC ? FileAccessType.PUBLIC : FileAccessType.PROTECTED)
    }
  }

  const onChangeExpiry = (value: string) => {
    setExpiryKey(value)
    saveSettings(value, privacy)
  }

  const onChangePrivacy = (value: FileAccessType) => {
    setPrivacy(value)
    saveSettings(expiryKey, value)
  }

  const cycleAppearance = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark']
    const next = order[(order.indexOf(preference) + 1) % order.length]
    setPreference(next)
  }

  const onSignOut = () => setSignOutOpen(true)

  return (
    <Screen key={user?.id ?? 'anonymous'} scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 22 }}>
        <AppText variant="heading" size={28} color={colors.heading}>
          Profile
        </AppText>
        <IconButton name="settings" size={36} iconSize={17} strokeWidth={1.5} />
      </View>

      <View style={{ alignItems: 'center', marginBottom: 22 }}>
        <Pressable
          onPress={onPickFromGallery}
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            backgroundColor: colors.primaryBg,
            borderWidth: 2.5,
            borderColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <AppText variant="heading" size={30} color={colors.accent}>
              {initial}
            </AppText>
          )}
          {uploadingAvatar ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}
            >
              <ActivityIndicator color={colors.primaryText} />
            </View>
          ) : null}
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <IconButton name="image" onPress={onPickFromGallery} disabled={uploadingAvatar} size={40} iconSize={18} />
          <IconButton name="camera" onPress={onTakePhoto} disabled={uploadingAvatar} size={40} iconSize={18} />
        </View>
        <AppText variant="heading" size={21} color={colors.heading} style={{ marginTop: 14 }}>
          {name}
        </AppText>
        {user?.email ? (
          <AppText size={13} color={colors.mutedSoft} style={{ marginTop: 3 }}>
            {user.email}
          </AppText>
        ) : null}
        <Pill label="Pro" tone="accent" style={{ marginTop: 11 }} />
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
        <SettingRowStacked icon="clock" label="Default expiry">
          <Segmented
            options={[
              { value: '1h', label: '1h' },
              { value: '6h', label: '6h' },
              { value: '24h', label: '24h' },
              { value: '3d', label: '3d' },
              { value: '7d', label: '7d' },
            ]}
            value={expiryKey}
            onChange={onChangeExpiry}
          />
        </SettingRowStacked>

        <SettingRowStacked icon="lock" label="Default privacy">
          <Segmented
            options={[
              { value: FileAccessType.PROTECTED, label: 'Protected', icon: 'lock' },
              { value: FileAccessType.PUBLIC, label: 'Public' },
            ]}
            value={privacy}
            onChange={onChangePrivacy}
          />
        </SettingRowStacked>

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

      <ConfirmModal
        visible={signOutOpen}
        icon="logout"
        tone="danger"
        title="Sign out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign out"
        onConfirm={() => {
          setSignOutOpen(false)
          logout()
        }}
        onClose={() => setSignOutOpen(false)}
      />
    </Screen>
  )
}

function SettingRow({ icon, label, value, right, onPress, last }: { icon: IconName; label: string; value?: string; right?: React.ReactNode; onPress?: () => void; last?: boolean }) {
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
      {onPress || value ? right ? null : <Icon name="chevron-right" size={16} color={colors.mutedSoft} strokeWidth={2} /> : null}
    </Pressable>
  )
}

function SettingRowStacked({ icon, label, children, last }: { icon: IconName; label: string; children: React.ReactNode; last?: boolean }) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
        <Icon name={icon} size={18} color={colors.muted} strokeWidth={1.6} />
        <AppText weight="medium" size={13.5}>
          {label}
        </AppText>
      </View>
      {children}
    </View>
  )
}
