import { Icon } from '@/components/Icon'
import { AppText, Button, Card, Pill } from '@/components/ui'
import { formatExpiry } from '@/lib/upload'
import { useTheme } from '@/theme/ThemeProvider'
import { FileAccessType } from '@/types/file'
import type { ActiveRequestRecord } from '@/types/folder'
import { View } from 'react-native'

export function ActiveRequestCard({ request, onResume, onEnd }: { request: ActiveRequestRecord; onResume: () => void; onEnd: () => void }) {
  const { colors } = useTheme()
  const isProtected = request.accessType === FileAccessType.PROTECTED

  return (
    <Card padding={14} style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoftBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={isProtected ? 'lock' : 'download'} size={19} color={colors.accent} strokeWidth={1.7} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={14} numberOfLines={1}>
            {request.folderName}
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 7 }}>
            <Pill
              label={isProtected ? 'Protected' : 'Public'}
              tone={isProtected ? 'accent' : 'neutral'}
              icon={isProtected ? <Icon name="lock" size={10} color={colors.accentText} strokeWidth={2.2} /> : undefined}
            />
            <Pill label={`${request.fileCount} file${request.fileCount === 1 ? '' : 's'}`} />
            <Pill label={formatExpiry(request.expireAt)} />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Resume" icon="external" onPress={onResume} style={{ flex: 1 }} size={13} />
        <Button title="End" variant="danger" icon="trash" onPress={onEnd} style={{ flex: 1 }} size={13} />
      </View>
    </Card>
  )
}
