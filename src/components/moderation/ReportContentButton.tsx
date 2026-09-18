import { Icon } from '@/components/Icon'
import { ReportContentModal } from '@/components/moderation/ReportContentModal'
import { AppText } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import type { ReportTargetType } from '@/types/moderation'
import { useState } from 'react'
import { Pressable, View } from 'react-native'

type Props = {
  targetType: ReportTargetType
  shareToken: string
  targetName?: string
}

export function ReportContentButton({ targetType, shareToken, targetName }: Props) {
  const { colors } = useTheme()
  const [visible, setVisible] = useState(false)

  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Report this ${targetType}`}
        accessibilityHint="Opens a form to report content that breaks the Docuflash rules"
        hitSlop={12}
        onPress={() => setVisible(true)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 12 }}
      >
        <Icon name="flag" size={15} color={colors.mutedSoft} />
        <AppText size={12.5} color={colors.mutedSoft}>
          Report this {targetType}
        </AppText>
      </Pressable>

      <ReportContentModal visible={visible} targetType={targetType} shareToken={shareToken} targetName={targetName} onClose={() => setVisible(false)} />
    </View>
  )
}
