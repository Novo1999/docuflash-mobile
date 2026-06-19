import { useTheme } from '@/theme/ThemeProvider'
import type { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'

export function Card({
  children,
  style,
  padding = 14,
  elevated = true,
}: {
  children: ReactNode
  style?: ViewStyle
  padding?: number
  elevated?: boolean
}) {
  const { colors, radii, mode } = useTheme()
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radii.lg + 2,
          padding,
        },
        elevated && mode === 'light'
          ? {
              shadowColor: '#0f1c2e',
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 3 },
              elevation: 1,
            }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  )
}
