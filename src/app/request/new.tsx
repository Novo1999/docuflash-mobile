import { Icon } from '@/components/Icon'
import { AppText, Button, Field } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { createUploadRequest } from '@/lib/api/folder'
import { getClientId, getRequestDeepLink, getRequestLink } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, Share, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

export default function RequestNewScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()

  const [folderName, setFolderName] = useState('')
  const [creating, setCreating] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deepCopied, setDeepCopied] = useState(false)

  const token = link?.split('/').pop() ?? ''
  const deepLink = token ? getRequestDeepLink(token) : ''

  const onGenerate = async () => {
    setCreating(true)
    try {
      const clientId = await getClientId()
      const request = await createUploadRequest({ folderName: folderName.trim() || undefined, clientId })
      setLink(getRequestLink(request.shareToken))
    } catch (e) {
      Alert.alert('Could not create link', e instanceof Error ? e.message : 'Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const onCopy = async () => {
    if (!link) return
    await Clipboard.setStringAsync(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const onCopyDeepLink = async () => {
    if (!deepLink) return
    await Clipboard.setStringAsync(deepLink)
    setDeepCopied(true)
    setTimeout(() => setDeepCopied(false), 1800)
  }

  const onShare = async () => {
    if (!link) return
    try {
      await Share.share({ message: link, url: link })
    } catch {
      // user dismissed the share sheet
    }
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))

  return (
    <Screen scroll contentStyle={{ paddingHorizontal: 26, alignItems: 'center' }}>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <Pressable
          onPress={close}
          style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: colors.segmentBg, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="chevron-left" size={17} color={colors.text} strokeWidth={1.8} />
        </Pressable>
        <AppText weight="semibold" size={14}>
          Request files
        </AppText>
        <View style={{ width: 34 }} />
      </View>

      <View
        style={{
          width: 74,
          height: 74,
          borderRadius: 37,
          backgroundColor: colors.accentSoftBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 26,
        }}
      >
        <Icon name="download" size={32} color={colors.accent} strokeWidth={1.6} />
      </View>

      {!link ? (
        <>
          <AppText variant="heading" size={26} color={colors.heading} style={{ marginTop: 18, textAlign: 'center' }}>
            Get files from anyone
          </AppText>
          <AppText size={13} color={colors.muted} lineHeight={20} style={{ marginTop: 8, textAlign: 'center' }}>
            Generate an &quot;upload to me&quot; link and share it. Anyone can send you files — no account needed. Files auto-delete 2 hours after upload.
          </AppText>

          <View style={{ width: '100%', marginTop: 24 }}>
            <AppText size={11.5} color={colors.mutedSoft} style={{ marginBottom: 8 }}>
              Label (optional)
            </AppText>
            <Field icon="folder" placeholder="e.g. Tax documents 2026" value={folderName} onChangeText={setFolderName} />
          </View>

          <Button title="Generate link" icon="plus" onPress={onGenerate} loading={creating} style={{ marginTop: 20, width: '100%' }} />
        </>
      ) : (
        <>
          <AppText variant="heading" size={26} color={colors.heading} style={{ marginTop: 18, textAlign: 'center' }}>
            Your link is generated
          </AppText>
          <AppText size={13} color={colors.muted} lineHeight={20} style={{ marginTop: 8, textAlign: 'center' }}>
            Share this with someone to make them upload to you.
          </AppText>

          <View
            style={{
              width: 172,
              height: 172,
              borderRadius: 20,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 24,
            }}
          >
            <QRCode value={link} size={132} color={colors.heading} backgroundColor="transparent" />
          </View>
          <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 10 }}>
            Scan to upload · expires in 2 hours
          </AppText>

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md + 1,
              paddingLeft: 15,
              paddingRight: 6,
              paddingVertical: 6,
              marginTop: 22,
            }}
          >
            <AppText size={13} color={colors.muted} numberOfLines={1} style={{ flex: 1 }}>
              {link.replace(/^https?:\/\//, '')}
            </AppText>
            <Pressable
              onPress={onCopy}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryBg, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9 }}
            >
              <Icon name={copied ? 'check' : 'copy'} size={14} color={colors.primaryText} strokeWidth={1.7} />
              <AppText weight="semibold" size={12.5} color={colors.primaryText}>
                {copied ? 'Copied' : 'Copy'}
              </AppText>
            </Pressable>
          </View>

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.md + 1,
              paddingLeft: 15,
              paddingRight: 6,
              paddingVertical: 6,
              marginTop: 10,
            }}
          >
            <AppText size={13} color={colors.muted} numberOfLines={1} style={{ flex: 1 }}>
              {deepLink}
            </AppText>
            <Pressable
              onPress={onCopyDeepLink}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryBg, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9 }}
            >
              <Icon name={deepCopied ? 'check' : 'copy'} size={14} color={colors.primaryText} strokeWidth={1.7} />
              <AppText weight="semibold" size={12.5} color={colors.primaryText}>
                {deepCopied ? 'Copied' : 'App link'}
              </AppText>
            </Pressable>
          </View>

          <View style={{ width: '100%', flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button title="Share" variant="outline" icon="share" onPress={onShare} style={{ flex: 1 }} size={13} />
            <Button title="Open" variant="outline" icon="external" onPress={() => router.push(`/request/${token}`)} style={{ flex: 1 }} size={13} />
          </View>

          <Pressable onPress={() => { setLink(null); setFolderName('') }} style={{ marginTop: 16 }}>
            <AppText weight="semibold" size={13} color={colors.muted}>
              Create another request
            </AppText>
          </Pressable>
        </>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 18 }}>
        <Icon name="clock" size={12} color={colors.mutedSoft} strokeWidth={1.8} />
        <AppText size={10.5} color={colors.mutedSoft}>
          Uploaded files auto-delete 2 hours after upload
        </AppText>
      </View>
    </Screen>
  )
}
