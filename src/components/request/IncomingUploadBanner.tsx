import { AppText, ProgressBar } from '@/components/ui'
import type { UploadingPayload } from '@/hooks/useRequestRealtime'
import { useTheme } from '@/theme/ThemeProvider'
import { ActivityIndicator, View } from 'react-native'

/**
 * Shown to whoever is watching the link while someone else uploads to it. The
 * sender broadcasts progress as it goes, but an older client (or the first tick
 * before any progress arrives) sends none — hence the indeterminate spinner.
 */
export function IncomingUploadBanner({ incoming }: { incoming: UploadingPayload }) {
  const { colors, radii } = useTheme()
  const hasProgress = typeof incoming.progress === 'number'

  return (
    <View
      style={{
        width: '100%',
        marginTop: 18,
        padding: 12,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.accent,
        backgroundColor: colors.accentSoftBg,
        gap: 9,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ActivityIndicator color={colors.accent} />
        <AppText size={12.5} color={colors.text} style={{ flex: 1 }}>
          {incoming.uploaderName ?? 'A user'} is uploading{' '}
          <AppText weight="semibold" size={12.5} color={colors.text}>
            {incoming.fileName}
          </AppText>
        </AppText>
        {hasProgress ? (
          <AppText weight="semibold" size={12} color={colors.accentText}>
            {Math.round(incoming.progress!)}%
          </AppText>
        ) : null}
      </View>
      {hasProgress ? <ProgressBar progress={incoming.progress!} trackColor={colors.surface} /> : null}
    </View>
  )
}
