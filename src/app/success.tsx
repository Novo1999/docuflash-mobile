import { Icon } from '@/components/Icon'
import { AppText, Button } from '@/components/ui'
import { Screen } from '@/components/ui/Screen'
import { useTheme } from '@/theme/ThemeProvider'
import * as Clipboard from 'expo-clipboard'
import * as MailComposer from 'expo-mail-composer'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Share, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

export default function SuccessScreen() {
  const { colors, radii } = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{
    link: string
    fileName: string
    kind: string
    access: string
    fileCount: string
    expiryLabel: string
  }>()
  const [copied, setCopied] = useState(false)

  const link = params.link ?? ''
  const expiryLabel = params.expiryLabel ?? '7 days'
  const accessLabel = params.access === 'protected' ? 'Protected' : 'Public'
  const count = Number(params.fileCount ?? '1')
  const summary =
    params.kind === 'folder'
      ? `${params.fileName} · ${count} files · ${accessLabel}`
      : `${params.fileName} · ${accessLabel}`

  const onCopy = async () => {
    await Clipboard.setStringAsync(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const onShare = async () => {
    try {
      await Share.share({ message: link, url: link })
    } catch {
      // user dismissed the share sheet
    }
  }

  const onEmail = async () => {
    const available = await MailComposer.isAvailableAsync()
    if (!available) {
      await onShare()
      return
    }
    await MailComposer.composeAsync({
      subject: 'A file was shared with you via Docuflash',
      body: `Open your encrypted link:\n${link}`,
    })
  }

  const close = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))

  return (
    <Screen contentStyle={{ paddingHorizontal: 26, alignItems: 'center' }}>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <Pressable
          onPress={close}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: colors.segmentBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevron-left" size={17} color={colors.text} strokeWidth={1.8} />
        </Pressable>
        <AppText weight="semibold" size={14}>
          Share link
        </AppText>
        <Pressable onPress={close}>
          <AppText weight="semibold" size={14} color={colors.accentText}>
            Done
          </AppText>
        </Pressable>
      </View>

      <View
        style={{
          width: 74,
          height: 74,
          borderRadius: 37,
          backgroundColor: colors.accentSoftBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 30,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="check" size={26} color={colors.screen} strokeWidth={2.2} />
        </View>
      </View>

      <AppText variant="heading" size={27} color={colors.heading} style={{ marginTop: 18 }}>
        Your link is ready
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 }}>
        <Icon name="folder" size={14} color={colors.accent} strokeWidth={1.6} />
        <AppText size={13} color={colors.muted}>
          {summary}
        </AppText>
      </View>

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
        {link ? <QRCode value={link} size={132} color={colors.heading} backgroundColor="transparent" /> : null}
      </View>
      <AppText size={11} color={colors.mutedSoft} style={{ marginTop: 10 }}>
        Scan to open · expires in {expiryLabel}
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
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.primaryBg,
            borderRadius: 11,
            paddingHorizontal: 14,
            paddingVertical: 9,
          }}
        >
          <Icon name={copied ? 'check' : 'copy'} size={14} color={colors.primaryText} strokeWidth={1.7} />
          <AppText weight="semibold" size={12.5} color={colors.primaryText}>
            {copied ? 'Copied' : 'Copy'}
          </AppText>
        </Pressable>
      </View>

      <View style={{ width: '100%', flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Button title="Email" variant="outline" icon="mail" onPress={onEmail} style={{ flex: 1 }} size={13} />
        <Button title="Share" variant="outline" icon="share" onPress={onShare} style={{ flex: 1 }} size={13} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 18 }}>
        <Icon name="lock" size={12} color={colors.mutedSoft} strokeWidth={1.8} />
        <AppText size={10.5} color={colors.mutedSoft}>
          End-to-end encrypted · Auto-deletes on expiry
        </AppText>
      </View>
    </Screen>
  )
}
