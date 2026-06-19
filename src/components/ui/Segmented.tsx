import { Icon, type IconName } from '@/components/Icon'
import { useTheme } from '@/theme/ThemeProvider'
import { Pressable, View } from 'react-native'
import { AppText } from './AppText'

export type SegmentOption<T extends string> = { value: T; label: string; icon?: IconName }

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}) {
  const { colors, radii } = useTheme()
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.segmentBg, borderRadius: radii.sm + 3, padding: 4 }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 8,
              borderRadius: radii.sm,
              backgroundColor: active ? colors.segmentActiveBg : 'transparent',
            }}
          >
            {opt.icon ? (
              <Icon name={opt.icon} size={13} color={active ? colors.segmentActiveText : colors.muted} strokeWidth={1.8} />
            ) : null}
            <AppText weight="semibold" size={12.5} color={active ? colors.segmentActiveText : colors.muted}>
              {opt.label}
            </AppText>
          </Pressable>
        )
      })}
    </View>
  )
}
